import { createClient, RedisClientType } from "redis"
import { ORDER_UPDATED, TRADE_ADDED } from "./types"
import { WsMessage } from "./types/toWs"
import { MessageToApi } from "./types/toApi"

type DbMessage = {
    type: typeof TRADE_ADDED,
    data: {
        id: string,
        isBuyerMaker: boolean,
        price: string,
        quantity: string,
        quoteQuantity: string,
        timestamp: number,
        market: string
    }
} | {
    type: typeof ORDER_UPDATED,
    data: {
        orderId: string,
        executedQty: number,
        market?: string,
        price?: string,
        quantity?: string,
        side?: "buy" | "sell",
    }
}

export class RedisManager{
    private client: RedisClientType;
    private static instance: RedisManager;
    
    private constructor(){
        const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        this.client = createClient({ url: `redis://${redisHost}:${redisPort}` });
        this.client.connect();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RedisManager();
        }
        return this.instance;
    }

    public pushMessage(message: DbMessage){
        this.client.lPush("db_processor", JSON.stringify(message));
    }

    public publishMessage(channel: string, message: WsMessage){
        this.client.publish(channel, JSON.stringify(message));
    }

    public sendToApi(clientId: string, message: MessageToApi){
        this.client.publish(clientId, JSON.stringify(message));
    }
}