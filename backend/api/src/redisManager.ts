import { createClient, RedisClientType } from "redis";
import { MessageToEngine } from "./types/to";
import { MessageFromOrderBook } from "./types";


export class RedisManager{
    private client: RedisClientType;
    private publisher: RedisClientType;
    private static instance: RedisManager;

    private constructor(){
        const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        this.client = createClient({ url: `redis://${redisHost}:${redisPort}` });
        this.client.connect();
        this.publisher = createClient({ url: `redis://${redisHost}:${redisPort}` });
        this.publisher.connect();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new RedisManager(); 
        }
        return this.instance;
    }

    public sendAndAwait(message: MessageToEngine){
        return new Promise<MessageFromOrderBook>((resolve) => {
            const id = this.getRandomClientId();
            this.client.subscribe(id, (message) => {
                this.client.unsubscribe(id);
                resolve(JSON.parse(message));
            })
            this.publisher.lPush("messages", JSON.stringify({ clientId: id, message }))
        })
    }

    public getRandomClientId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}