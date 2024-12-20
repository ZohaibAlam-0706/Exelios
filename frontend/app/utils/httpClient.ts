import axios from "axios";
import { Ticker, KLine, Depth, Trade } from "./types";

const BASE_URL = "http://localhost:3001/api/v1";

export async function getTicker(market: string): Promise<Ticker>{
    const tickers = await getTickers();
    const ticker = tickers.find(t => t.symbol === market);
    if(!ticker){
        throw new Error(`No Ticker found for the market ${market}`);
    }
    return ticker;
}

export async function getTickers(): Promise<Ticker[]>{
    console.log("Sending request for tickers");
    const response = await axios.get(`${BASE_URL}/tickers`);
    console.log("Response: ", response);
    return response.data;
}

export async function getDepth(market: string): Promise<Depth>{
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}

export async function getTrades(market: string): Promise<Trade[]> {
    const response = await axios.get(`${BASE_URL}/trades?symbol=${market}`);
    return response.data;
}

export async function getKlines(market: string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    console.log(data);
    return data.sort((x, y) => (Number(x.end) < Number(y.end) ? -1 : 1));
}