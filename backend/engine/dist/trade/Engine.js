"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.BASE_CURRENCY = void 0;
const redisManager_1 = require("../redisManager");
const types_1 = require("../types");
const fromApi_1 = require("../types/fromApi");
const orderBook_1 = require("./orderBook");
const fs_1 = __importDefault(require("fs"));
exports.BASE_CURRENCY = "USDC";
class Engine {
    constructor() {
        this.balances = new Map();
        this.orderBooks = [new orderBook_1.orderBook("SOL", [], [], 0, 0)];
        let snapshot = null;
        try {
            if (process.env.WITH_SNAPSHOT === "true") {
                snapshot = fs_1.default.readFileSync('./snapshot.js');
            }
        }
        catch (e) {
            console.log('No Snapshot found');
        }
        if (snapshot) {
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            this.orderBooks = snapshotSnapshot.orderbooks.map((o) => new orderBook_1.orderBook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balances = new Map(snapshotSnapshot.balances);
        }
        else {
            this.orderBooks = [new orderBook_1.orderBook(`SOL`, [], [], 0, 0)];
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
        };
        fs_1.default.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }
    process({ message, clientId }) {
        switch (message.type) {
            case fromApi_1.CREATE_ORDER:
                try {
                    const { executedQty, fills, orderId } = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    redisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_PLACED",
                        payload: {
                            orderId,
                            executedQty,
                            fills
                        }
                    });
                }
                catch (e) {
                    redisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                console.log("market: ", message.data.market);
                break;
            case fromApi_1.CANCEL_ORDER:
                try {
                    const orderId = message.data.orderId;
                    const cancelMarket = message.data.market;
                    const cancelOrder = this.orderBooks.find(x => x.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if (!cancelOrder) {
                        console.log("No OrderBook found");
                        throw new Error("No OrderBook found");
                    }
                    const order = cancelOrder.asks.find(x => x.orderId === orderId) || cancelOrder.bids.find(x => x.orderId === orderId);
                    console.log("Asks: ", cancelOrder.asks, "Bids: ", cancelOrder.bids);
                    if (!order) {
                        console.log("No Order Found BHai", orderId);
                        throw new Error("No Order Found");
                    }
                    if (order.side == 'buy') {
                        const price = cancelOrder.cancelBid(order);
                        const leftQty = (order.quantity - order.filled) * order.price;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].available += leftQty;
                        //@ts-ignore
                        this.balances.get(order.userId)[exports.BASE_CURRENCY].locked -= leftQty;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                    else {
                        const price = cancelOrder.cancelAsk(order);
                        const leftQuantity = Number(order.quantity) - Number(order.filled);
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                        //@ts-ignore
                        this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if (price) {
                            this.sendUpdatedDepthAt(price.toString(), cancelMarket);
                        }
                    }
                    redisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                catch (e) {
                    console.log("Error hwile cancelling order");
                    console.log(e);
                }
                break;
            case fromApi_1.GET_OPEN_ORDERS:
                try {
                    const openOrderBook = this.orderBooks.find(x => x.ticker() === message.data.market);
                    console.log("openOrderBook: ", openOrderBook);
                    console.log("message.data.userId: ", message.data.userId, "message.data.market: ", message.data.market);
                    if (!openOrderBook) {
                        throw new Error("No orderbook found");
                    }
                    const openOrders = openOrderBook.getOpenOrders(message.data.userId);
                    redisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders
                    });
                }
                catch (e) {
                    console.log(e);
                }
                break;
            case fromApi_1.ON_RAMP:
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                break;
            case fromApi_1.GET_DEPTH:
                try {
                    const market = message.data.market;
                    const orderbook = this.orderBooks.find(o => o.ticker() === market);
                    if (!orderbook) {
                        throw new Error("No orderbook found");
                    }
                    redisManager_1.RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: orderbook.getDepth()
                    });
                }
                catch (e) {
                    console.log(e);
                    redisManager_1.RedisManager.getInstance().sendToApi(clientId, {
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
    addOrderbook(orderbook) {
        this.orderBooks.push(orderbook);
    }
    createOrder(market, price, quantity, side, userId) {
        console.log("market: ", market);
        const orderbook = this.orderBooks.find(o => o.ticker() === market);
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];
        if (!orderbook) {
            throw new Error("No orderbook found in this market");
        }
        this.checkAndLockFunds(baseAsset, quoteAsset, side, userId, quoteAsset, price, quantity);
        const order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            filled: 0,
            side,
            userId
        };
        const { fills, executedQty } = orderbook.addOrder(order);
        console.log("fills", fills, "executedQty", executedQty);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);
        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);
        this.publisWsDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);
        return { executedQty, fills, orderId: order.orderId };
    }
    updateDbOrders(order, executedQty, fills, market) {
        redisManager_1.RedisManager.getInstance().pushMessage({
            type: types_1.ORDER_UPDATED,
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
            redisManager_1.RedisManager.getInstance().pushMessage({
                type: types_1.ORDER_UPDATED,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty
                }
            });
        });
    }
    createDbTrades(fills, market, userId) {
        fills.forEach(fill => {
            redisManager_1.RedisManager.getInstance().pushMessage({
                type: types_1.TRADE_ADDED,
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
    publishWsTrades(fills, userId, market) {
        fills.forEach(fill => {
            redisManager_1.RedisManager.getInstance().publishMessage(`trade.${market}`, {
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
    sendUpdatedDepthAt(price, market) {
        const orderbook = this.orderBooks.find(o => o.ticker() === market);
        if (!orderbook) {
            return;
        }
        const depth = orderbook.getDepth();
        const updatedBids = depth === null || depth === void 0 ? void 0 : depth.bids.filter(x => x[0] === price);
        const updatedAsks = depth === null || depth === void 0 ? void 0 : depth.asks.filter(x => x[0] === price);
        redisManager_1.RedisManager.getInstance().publishMessage(`depth.${market}`, {
            stream: `depth.${market}`,
            data: {
                a: updatedAsks.length ? updatedAsks : [[price, "0"]],
                b: updatedBids.length ? updatedBids : [[price, "0"]],
                e: "depth"
            }
        });
    }
    publisWsDepthUpdates(fills, price, side, market) {
        const orderbook = this.orderBooks.find(o => o.ticker() === market);
        if (!orderbook) {
            console.log(`No orderbook found for market: ${market}`);
            return;
        }
        const depth = orderbook.getDepth();
        console.log("depth", depth);
        if (side === "buy") {
            const updatedAsks = depth === null || depth === void 0 ? void 0 : depth.asks.filter(x => fills.map(f => f.price).includes(x[0]));
            const updatedBid = depth === null || depth === void 0 ? void 0 : depth.bids.find(x => Number(x[0]) === Number(price));
            console.log("publish ws depth updates");
            console.log("updatedAsks: ", updatedAsks, "updatedBids: ", updatedBid);
            redisManager_1.RedisManager.getInstance().publishMessage(`depth.${market}`, {
                stream: `depth.${market}`,
                data: {
                    a: updatedAsks,
                    b: updatedBid ? [updatedBid] : [],
                    e: "depth"
                }
            });
        }
        if (side === "sell") {
            const updatedBids = depth === null || depth === void 0 ? void 0 : depth.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updatedAsk = depth === null || depth === void 0 ? void 0 : depth.asks.find(x => Number(x[0]) === Number(price));
            console.log("publish ws depth updates");
            console.log("updatedAsks: ", updatedAsk, "updatedBids: ", updatedBids);
            redisManager_1.RedisManager.getInstance().publishMessage(`depth.${market}`, {
                stream: `depth.${market}`,
                data: {
                    a: updatedAsk ? [updatedAsk] : [],
                    b: updatedBids,
                    e: "depth"
                }
            });
        }
    }
    updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty) {
        if (side === "buy") {
            fills.forEach(fill => {
                var _a, _b, _c, _d;
                // Update quote asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].available = ((_a = this.balances.get(fill.otherUserId)) === null || _a === void 0 ? void 0 : _a[quoteAsset].available) + (fill.qty * fill.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].locked = ((_b = this.balances.get(userId)) === null || _b === void 0 ? void 0 : _b[quoteAsset].locked) - (fill.qty * fill.price);
                // Update base asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].locked = ((_c = this.balances.get(fill.otherUserId)) === null || _c === void 0 ? void 0 : _c[baseAsset].locked) - fill.qty;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].available = ((_d = this.balances.get(userId)) === null || _d === void 0 ? void 0 : _d[baseAsset].available) + fill.qty;
            });
        }
        else {
            fills.forEach(fill => {
                var _a, _b, _c, _d;
                // Update quote asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[quoteAsset].locked = ((_a = this.balances.get(fill.otherUserId)) === null || _a === void 0 ? void 0 : _a[quoteAsset].locked) - (fill.qty * fill.price);
                //@ts-ignore
                this.balances.get(userId)[quoteAsset].available = ((_b = this.balances.get(userId)) === null || _b === void 0 ? void 0 : _b[quoteAsset].available) + (fill.qty * fill.price);
                // Update base asset balance
                //@ts-ignore
                this.balances.get(fill.otherUserId)[baseAsset].available = ((_c = this.balances.get(fill.otherUserId)) === null || _c === void 0 ? void 0 : _c[baseAsset].available) + fill.qty;
                //@ts-ignore
                this.balances.get(userId)[baseAsset].locked = ((_d = this.balances.get(userId)) === null || _d === void 0 ? void 0 : _d[baseAsset].locked) - (fill.qty);
            });
        }
    }
    checkAndLockFunds(baseAsset, quoteAsset, side, userId, asset, price, quantity) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (side === "buy") {
            if ((((_b = (_a = this.balances.get(userId)) === null || _a === void 0 ? void 0 : _a[quoteAsset]) === null || _b === void 0 ? void 0 : _b.available) || 0) < Number(quantity) * Number(price)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].available = ((_c = this.balances.get(userId)) === null || _c === void 0 ? void 0 : _c[quoteAsset].available) - (Number(quantity) * Number(price));
            //@ts-ignore
            this.balances.get(userId)[quoteAsset].locked = ((_d = this.balances.get(userId)) === null || _d === void 0 ? void 0 : _d[quoteAsset].locked) + (Number(quantity) * Number(price));
        }
        else {
            if ((((_f = (_e = this.balances.get(userId)) === null || _e === void 0 ? void 0 : _e[baseAsset]) === null || _f === void 0 ? void 0 : _f.available) || 0) < Number(quantity)) {
                throw new Error("Insufficient funds");
            }
            //@ts-ignore
            this.balances.get(userId)[baseAsset].available = ((_g = this.balances.get(userId)) === null || _g === void 0 ? void 0 : _g[baseAsset].available) - (Number(quantity));
            //@ts-ignore
            this.balances.get(userId)[baseAsset].locked = ((_h = this.balances.get(userId)) === null || _h === void 0 ? void 0 : _h[baseAsset].locked) + Number(quantity);
        }
    }
    onRamp(userId, amount) {
        const userBalance = this.balances.get(userId);
        if (!userBalance) {
            this.balances.set(userId, {
                [exports.BASE_CURRENCY]: {
                    available: amount,
                    locked: 0
                }
            });
        }
        else {
            userBalance[exports.BASE_CURRENCY].available += amount;
        }
    }
    setBaseBalances() {
        this.balances.set("1", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "SOL": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("2", {
            [exports.BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "SOL": {
                available: 10000000,
                locked: 0
            }
        });
        this.balances.set("5", {
            [exports.BASE_CURRENCY]: {
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
exports.Engine = Engine;
