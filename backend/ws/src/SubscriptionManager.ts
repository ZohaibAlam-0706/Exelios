import { RedisClientType, createClient } from "redis";
import { UserManager } from "./UserManager";

export class SubscriptionManager {
    private static instance: SubscriptionManager;
    private subscriptions: Map<string, string[]> = new Map();
    private reverseSubscriptions: Map<string, string[]> = new Map();
    private redisClient: RedisClientType;

    private constructor() {
        const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        this.redisClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
        this.redisClient.connect();
    }

    public static getInstance() {
        if (!this.instance)  {
            this.instance = new SubscriptionManager();
        }
        return this.instance;
    }

    public subscribe(userId: string, subscription: string) {
        if (this.subscriptions.get(userId)?.includes(subscription)) {
            console.log("Already here");
            return
        }
        console.log("HELLO");
        this.subscriptions.set(userId, (this.subscriptions.get(userId) || []).concat(subscription));
        this.reverseSubscriptions.set(subscription, (this.reverseSubscriptions.get(subscription) || []).concat(userId));
        if (this.reverseSubscriptions.get(subscription)?.length === 1) {
            console.log("Subscription: ", subscription);
            try{
                this.redisClient.subscribe(subscription, this.redisCallbackHandler );
            }catch(e){
                console.log(e);
            }
        }
    }

    private redisCallbackHandler = (message: string, channel: string) => {
        console.log("Received message on channel:", channel);
        const parsedMessage = JSON.parse(message);
        // console.log("Sending message: ", parsedMessage);
        console.log("Sending message: ", parsedMessage);
        this.reverseSubscriptions.get(channel)?.forEach(s => UserManager.getInstance().getUser(s)?.emit(parsedMessage));
    }

    public unsubscribe(userId: string, subscription: string) {
        const subscriptions = this.subscriptions.get(userId);
        if (subscriptions) {
            this.subscriptions.set(userId, subscriptions.filter(s => s !== subscription));
        }
        const reverseSubscriptions = this.reverseSubscriptions.get(subscription);
        if (reverseSubscriptions) {
            this.reverseSubscriptions.set(subscription, reverseSubscriptions.filter(s => s !== userId));
            if (this.reverseSubscriptions.get(subscription)?.length === 0) {
                this.reverseSubscriptions.delete(subscription);
                this.redisClient.unsubscribe(subscription);
            }
        }
    }

    public userLeft(userId: string) {
        console.log("user left " + userId);
        this.subscriptions.get(userId)?.forEach(s => this.unsubscribe(userId, s));
    }
    
    getSubscriptions(userId: string) {
        return this.subscriptions.get(userId) || [];
    }
}