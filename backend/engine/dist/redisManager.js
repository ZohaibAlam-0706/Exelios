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
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }
        return this.instance;
    }
    pushMessage(message) {
        this.client.lPush("db_processor", JSON.stringify(message));
    }
    publishMessage(channel, message) {
        this.client.publish(channel, JSON.stringify(message));
    }
    sendToApi(clientId, message) {
        this.client.publish(clientId, JSON.stringify(message));
    }
}
exports.RedisManager = RedisManager;
