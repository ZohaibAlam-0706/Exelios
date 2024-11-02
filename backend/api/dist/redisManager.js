"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisManager = void 0;
const redis_1 = require("redis");
class RedisManager {
    constructor() {
        const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        this.client = (0, redis_1.createClient)({ url: `redis://${redisHost}:${redisPort}` });
        this.client.connect();
        this.publisher = (0, redis_1.createClient)({ url: `redis://${redisHost}:${redisPort}` });
        this.publisher.connect();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    sendAndAwait(message) {
        return new Promise((resolve) => {
            const id = this.getRandomClientId();
            this.client.subscribe(id, (message) => {
                this.client.unsubscribe(id);
                resolve(JSON.parse(message));
            });
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }));
        });
    }
    getRandomClientId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
exports.RedisManager = RedisManager;
