import { RedisManager } from "../redisManager";
import { ORDER_UPDATED, TRADE_ADDED } from "../types";
import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, ON_RAMP } from "../types/fromApi";
import { Fill, Order, orderBook } from "./orderBook";
import fs from 'fs';

export const BASE_CURRENCY = "USDC";

interface userBalance {
    [key: string]: {
        available: number,
        locked: number
    }
}

export class Engine{
    private orderBooks: orderBook[];
    private balances: Map<string, userBalance> = new Map();

    constructor(){
        this.orderBooks = [new orderBook("SOL", [], [], 0, 0)];
        let snapshot = null;
        try{
            if(process.env.WITH_SNAPSHOT === "true"){
                snapshot = fs.readFileSync('./snapshot.js');
            }
        }catch(e){
            console.log('No Snapshot found');
        }

        if (snapshot) {
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            this.orderBooks = snapshotSnapshot.orderbooks.map((o: any) => new orderBook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balances = new Map(snapshotSnapshot.balances);
        } else {
            this.orderBooks = [new orderBook(`SOL`, [], [], 0, 0)];
            this.setBaseBalances();
        }
        setInterval(() => {
            this.saveSnapshot();
        }, 1000 * 3);
    }

    saveSnapshot() {
        const snapshotSnapshot = {
            orderbooks: this.orderBooks.map(o => o.getSnapshot()),
            balances: Array.from(this.balances.entries())
        }
        fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }

    process({ message, clientId }: { message: MessageFromApi, clientId: string }){
        switch(message.type){
            case CREATE_ORDER:
                try{
                    const {executedQty, fills, orderId} = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_PLACED",
                        payload: {
                            orderId,
                            executedQty,
                            fills
                        }
                    });
                }catch(e){
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0
                        }
                    })
                }
                console.log("market: ", message.data.market);
                break
            case CANCEL_ORDER:
                try{
                    const orderId = message.data.orderId;
                    const cancelMarket = message.data.market;
                    const cancelOrder = this.orderBooks.find(x => x.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if(!cancelOrder){
                        console.log("No OrderBook found");
                        throw new Error("No OrderBook found");
                    }
                    const order = cancelOrder.asks.find(x => x.orderId === orderId) || cancelOrder.bids.find(x => x.orderId === orderId);
                    console.log("Asks: ", cancelOrder.asks, "Bids: ", cancelOrder.bids);
                    if(!order){
                        console.log("No Order Found BHai", orderId)
                        throw new Error("No Order Found")
                    }
                    if(order.side == 'buy'){
                        const price = cancelOrder.cancelBid(order);
                        const leftQty = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].available += leftQty;
                        //@ts-ignore
                        this.balances.get(order.userId)[BASE_CURRENCY].locked -= leftQty;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }else{
                        const price = cancelOrder.cancelAsk(order)
                        const leftQuantity = Number(order.quantity) - Number(order.filled);
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });

                }catch(e){
                    console.log("Error hwile cancelling order", );
                    console.log(e);
                }
                break;
            case GET_OPEN_ORDERS:
                try{
                    const openOrderBook = this.orderBooks.find(x => x.ticker() === message.data.market);
                    console.log("openOrderBook: ", openOrderBook);
                    console.log("message.data.userId: ", message.data.userId, "message.data.market: ", message.data.market);
                    if(!openOrderBook){
                        throw new Error("No orderbook found");
                    }
                    const openOrders = openOrderBook.getOpenOrders(message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders
                    }); 
                }catch(e){
                    console.log(e);
                }
                break;
            case ON_RAMP:
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                break;
            case GET_DEPTH:
                try {
                    const market = message.data.market;
                    const orderbook = this.orderBooks.find(o => o.ticker() === market);
                    if (!orderbook) {
                        throw new Error("No orderbook found");
                    }
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: orderbook.getDepth()
                    });
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: {
                            bids: [],
                            asks: []
                        }
                    });
                }
                break;
        }
    }

    addOrderbook(orderbook: orderBook) {
        this.orderBooks.push(orderbook);
    }

    createOrder(market: string, price: string, quantity: string, side: "buy" | "sell", userId: string){
        console.log("market: ", market);
        const orderbook = this.orderBooks.find(o => o.ticker() === market)
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];

        if (!orderbook) {
            throw new Error("No orderbook found in this market");
        }

        this.checkAndLockFunds(baseAsset, quoteAsset, side, userId, quoteAsset, price, quantity);

        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId
        }
        
        const { fills, executedQty } = orderbook.addOrder(order);
        console.log("fills", fills, "executedQty", executedQty);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);

        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);
        this.publisWsDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);
        return { executedQty, fills, orderId: order.orderId };
    }

    updateDbOrders(order: Order, executedQty: number, fills: Fill[], market: string) {
        RedisManager.getInstance().pushMessage({
            type: ORDER_UPDATED,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side,
            }
        });

        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: ORDER_UPDATED,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty
                }
            });
        });
    }

    createDbTrades(fills: Fill[], market: string, userId: string) {
        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId, // TODO: Is this right?
                    price: fill.price,
                    quantity: fill.qty.toString(),
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now()
                }
            });
        });
    }

    publishWsTrades(fills: Fill[], userId: string, market: string) {
        fills.forEach(fill => {
            RedisManager.getInstance().publishMessage(`trade.${market}`, {
                stream: `trade.${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    m: fill.otherUserId === userId, // TODO: Is this right?
                    p: fill.price,
                    q: fill.qty.toString(),
                    s: market,
                }
            });
        });
    }

    sendUpdatedDepthAt(price: string, market: string) {
        const orderbook = this.orderBooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth?.bids.filter(x => x[0] === price);
        const updatedAsks = depth?.asks.filter(x => x[0] === price);
        
        RedisManager.getInstance().publishMessage(`depth.${market}`, {
            stream: `depth.${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }

    publisWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string) {
        const orderbook = this.orderBooks.find(o => o.ticker() === market);
        if (!orderbook) {
            console.log(`No orderbook found for market: ${market}`);
            return;
        }
        const depth = orderbook.getDepth();
        console.log("depth", depth);
        if (side === "buy") {
            const updatedAsks = depth?.asks.filter(x => fills.map(f => f.price).includes(x[0]));
            const updatedBid = depth?.bids.find(x => Number(x[0]) === Number(price));
            console.log("publish ws depth updates")
            console.log("updatedAsks: ",updatedAsks,"updatedBids: ", updatedBid);
            RedisManager.getInstance().publishMessage(`depth.${market}`, {
                stream: `depth.${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBid ? [updatedBid] : [],
                    e: "depth"
                }
            });
        }
        if (side === "sell") {
           const updatedBids = depth?.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
           const updatedAsk = depth?.asks.find(x => Number(x[0]) === Number(price));
           console.log("publish ws depth updates");
           console.log("updatedAsks: ",updatedAsk,"updatedBids: ", updatedBids);
           RedisManager.getInstance().publishMessage(`depth.${market}`, {
               stream: `depth.${market}`,
               data: {
                   a: updatedAsk ? [updatedAsk] : [],
                   b: updatedBids,
                   e: "depth"
               }
           });
        }
    }

    updateBalance(userId: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", fills: Fill[], executedQty: number) {
        if (side === "buy") {
            fills.forEach(fill => {
                // Update quote asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available = this.balances.get(fill.otherUserId)?.[quoteAsset].available + (fill.qty * fill.price);

                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked - (fill.qty * fill.price);

                // Update base asset balance

                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].locked = this.balances.get(fill.otherUserId)?.[baseAsset].locked - fill.qty;

                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = this.balances.get(userId)?.[baseAsset].available + fill.qty;

            });
            
        } else {
            fills.forEach(fill => {
                // Update quote asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].locked = this.balances.get(fill.otherUserId)?.[quoteAsset].locked - (fill.qty * fill.price);

                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available + (fill.qty * fill.price);

                // Update base asset balance

                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].available = this.balances.get(fill.otherUserId)?.[baseAsset].available + fill.qty;

                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked - (fill.qty);

            });
        }
    }

    checkAndLockFunds(baseAsset: string, quoteAsset: string, side: "buy" | "sell", userId: string, asset: string, price: string, quantity: string) {
        if (side === "buy") {
            if ((this.balances.get(userId)?.[quoteAsset]?.available || 0) < Number(quantity) * Number(price)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].available = this.balances.get(userId)?.[quoteAsset].available - (Number(quantity) * Number(price));
            
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].locked = this.balances.get(userId)?.[quoteAsset].locked + (Number(quantity) * Number(price));
        } else {
            if ((this.balances.get(userId)?.[baseAsset]?.available || 0) < Number(quantity)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[baseAsset].available = this.balances.get(userId)?.[baseAsset].available - (Number(quantity));
            
            //@ts-ignore
            this.balances.get(userId)[baseAsset].locked = this.balances.get(userId)?.[baseAsset].locked + Number(quantity);
        }
    }

    onRamp(userId: string, amount: number) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [BASE_CURRENCY]: {
                    available: amount,
                    locked: 0
                }
            });
        } else {
            userBalance[BASE_CURRENCY].available += amount;
        }
    }

    setBaseBalances() {
        this.balances.set("1", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "SOL": {
                available: 10000000,
                locked: 0
            }
        });

        this.balances.set("2", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "SOL": {
                available: 10000000,
                locked: 0
            }
        });

        this.balances.set("5", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "SOL": {
                available: 10000000,
                locked: 0
            }
        });
    }
}