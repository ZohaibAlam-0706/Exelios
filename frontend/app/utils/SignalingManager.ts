import { Ticker, Trade } from "./types";

export const BASE_URL = "ws://localhost:3002/"

export class SignalingManager{
    private ws: WebSocket;
    private static instance: SignalingManager
    private bufferedMessages: any[] = [];
    private callbacks: any = {}
    private id: number;
    private initialized: boolean = false;

    private constructor(){
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }

    public static getInstance(): SignalingManager{
        if(!this.instance){
            this.instance = new SignalingManager();
        }
        return this.instance;
    }

    init(){
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessages.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        }
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data.e;
            if(this.callbacks[type]){
                this.callbacks[type].forEach(({callback}: any) => {
                    if(type === "ticker"){
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s
                        }
                        callback(newTicker);
                    }
                    else if(type === "depth"){
                        const updatedAsks = message.data.a;
                        const updatedBids = message.data.b;
                        callback({bids: updatedBids, asks: updatedAsks});
                    }
                    else if(type === "trade"){
                        const date = new Date();
                        const hr = date.getHours();
                        const min = date.getMinutes();
                        const sec = date.getSeconds();
                        const newTrades: Partial<Trade> = {
                            id: message.data.t,
                            isBuyerMaker: message.data.m,
                            price: message.data.p,
                            quantity: message.data.q,
                            timestamp: `${hr}:${min}:${sec}`,
                            quoteQuantity: "1"
                        }
                        callback(newTrades);
                    }
                })
            }
        }
    }
    sendMessage(message: any){
        const messageToSend = {
            ...message,
            id: this.id++
        }
        if(!this.initialized){
            this.bufferedMessages.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string){
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({ callback, id });
    }

    async deRegisterCallback(type: string, id: string){
        if(this.callbacks[type]){
            const index = this.callbacks[type].findIndex(({ callback }: any) => callback.id === id);
            if(index !== -1){
                this.callbacks[type].splice(index, 1);
            }
        }
    }

}