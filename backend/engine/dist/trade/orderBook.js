"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderBook = void 0;
const Engine_1 = require("./Engine");
class orderBook {
    constructor(baseAsset, bids, asks, lastTradeId, currentPrice) {
        this.bids = [];
        this.asks = [];
        this.quoteAsset = Engine_1.BASE_CURRENCY;
        this.bids = bids;
        this.asks = asks;
        this.baseAsset = baseAsset;
        this.lastTradeId = lastTradeId || 0;
        this.currentPrice = currentPrice || 0;
    }
    ticker() {
        return `${this.baseAsset}_${this.quoteAsset}`;
    }
    getSnapshot() {
        return {
            baseAsset: this.baseAsset,
            bids: this.bids,
            asks: this.asks,
            lastTradeId: this.lastTradeId,
            currentPrice: this.currentPrice
        };
    }
    addOrder(order) {
        if (order.side === "buy") {
            const { executedQty, fills } = this.matchBid(order);
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills
                };
            }
            this.bids.push(order);
            return {
                executedQty,
                fills
            };
        }
        else {
            const { executedQty, fills } = this.matchAsk(order);
            order.filled = executedQty;
            if (executedQty === order.quantity) {
                return {
                    executedQty,
                    fills
                };
            }
            // console.log("ORDER Before: ", order);
            // console.log("Asks Before: ", this.asks);
            this.asks.push(order);
            // console.log("Asks After: ", this.asks);
            // console.log("ORDER After: ", order);
            return {
                executedQty,
                fills
            };
        }
    }
    matchBid(order) {
        const fills = [];
        let executedQty = 0;
        this.asks.sort();
        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i].price <= order.price && executedQty < order.quantity) {
                const filledQty = Math.min((order.quantity - executedQty), this.asks[i].quantity);
                executedQty += filledQty;
                this.asks[i].filled += filledQty;
                fills.push({
                    price: this.asks[i].price.toString(),
                    qty: filledQty,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.asks[i].userId,
                    markerOrderId: this.asks[i].orderId
                });
            }
        }
        console.log("ASKS: ", this.asks);
        for (let i = 0; i < this.asks.length; i++) {
            if (this.asks[i].filled === this.asks[i].quantity) {
                this.asks.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty
        };
    }
    matchAsk(order) {
        const fills = [];
        let executedQty = 0;
        this.bids.sort();
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].price >= order.price && executedQty < order.quantity) {
                const amountRemaining = Math.min((order.quantity - executedQty), this.bids[i].quantity);
                executedQty += amountRemaining;
                this.bids[i].filled += amountRemaining;
                fills.push({
                    price: this.bids[i].price.toString(),
                    qty: amountRemaining,
                    tradeId: this.lastTradeId++,
                    otherUserId: this.bids[i].userId,
                    markerOrderId: this.bids[i].userId
                });
            }
        }
        for (let i = 0; i < this.bids.length; i++) {
            if (this.bids[i].filled === this.bids[i].quantity) {
                this.bids.splice(i, 1);
                i--;
            }
        }
        return {
            fills,
            executedQty
        };
    }
    getDepth() {
        const bids = [];
        const asks = [];
        const bidsObj = {};
        const asksObj = {};
        for (let i = 0; i < this.bids.length; i++) {
            const order = this.bids[i];
            if (!bidsObj[order.price]) {
                bidsObj[order.price] = 0;
            }
            bidsObj[order.price] += order.quantity;
        }
        for (let i = 0; i < this.asks.length; i++) {
            const order = this.asks[i];
            if (!asksObj[order.price]) {
                asksObj[order.price] = 0;
            }
            asksObj[order.price] += order.quantity;
        }
        for (const price in bidsObj) {
            bids.push([price, bidsObj[price].toString()]);
        }
        for (const price in asksObj) {
            asks.push([price, asksObj[price].toString()]);
        }
        return {
            bids,
            asks
        };
    }
    getOpenOrders(userId) {
        const asks = this.asks.filter(x => x.userId === userId);
        const bids = this.asks.filter(x => x.userId === userId);
        return [...asks, ...bids];
    }
    cancelBid(order) {
        const index = this.bids.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.bids[index].price;
            this.bids.splice(index, 1);
            return price;
        }
    }
    cancelAsk(order) {
        const index = this.asks.findIndex(x => x.orderId === order.orderId);
        if (index !== -1) {
            const price = this.asks[index].price;
            this.asks.splice(index, 1);
            return price;
        }
    }
}
exports.orderBook = orderBook;
