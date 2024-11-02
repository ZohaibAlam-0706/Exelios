"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManager = void 0;
const redis_1 = require("redis");
const UserManager_1 = require("./UserManager");
class SubscriptionManager {
    constructor() {
        this.subscriptions = new Map();
        this.reverseSubscriptions = new Map();
        this.redisCallbackHandler = (message, channel) => {
            var _a;
            console.log("Received message on channel:", channel);
            const parsedMessage = JSON.parse(message);
            // console.log("Sending message: ", parsedMessage);
            console.log("Sending message: ", parsedMessage);
            (_a = this.reverseSubscriptions.get(channel)) === null || _a === void 0 ? void 0 : _a.forEach(s => { var _a; return (_a = UserManager_1.UserManager.getInstance().getUser(s)) === null || _a === void 0 ? void 0 : _a.emit(parsedMessage); });
        };
        const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        this.redisClient = (0, redis_1.createClient)({ url: `redis://${redisHost}:${redisPort}` });
        this.redisClient.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }
    subscribe(userId, subscription) {
        var _a, _b;
        if ((_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.includes(subscription)) {
            console.log("Already here");
            return;
        }
        console.log("HELLO");
        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription, (this.reverseSubscriptions.get(subscription) || []).concat(userId));
        if (((_b = this.reverseSubscriptions.get(subscription)) === null || _b === void 0 ? void 0 : _b.length) === 1) {
            console.log("Subscription: ", subscription);
            try {
                this.redisClient.subscribe(subscription, this.redisCallbackHandler);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    unsubscribe(userId, subscription) {
        var _a;
        const subscriptions = this.subscriptions.get(userId);
        if (subscriptions) {
            this.subscriptions.set(userId, subscriptions.filter(s => s !== subscription));
        }
        const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscription, reverseSubscriptions.filter(s => s !== userId));
            if (((_a = this.reverseSubscriptions.get(subscription)) === null || _a === void 0 ? void 0 : _a.length) === 0) {
                this.reverseSubscriptions.delete(subscription);
                this.redisClient.unsubscribe(subscription);
            }
        }
    }
    userLeft(userId) {
        var _a;
        console.log("user left " + userId);
        (_a = this.subscriptions.get(userId)) === null || _a === void 0 ? void 0 : _a.forEach(s => this.unsubscribe(userId, s));
    }
    getSubscriptions(userId) {
        return this.subscriptions.get(userId) || [];
    }
}
exports.SubscriptionManager = SubscriptionManager;
