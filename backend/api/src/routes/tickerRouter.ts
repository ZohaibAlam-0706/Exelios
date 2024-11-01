import { Router } from "express";

export const tickerRouter = Router();

tickerRouter.get('/', async (req, res) => {
    //Get Ticker from DB
    res.json([{
        firstPrice: "173.02",
        high: "176.03",
        lastPrice: "179.10",
        low: "172.01",
        priceChange: "100",
        priceChangePercent: "10",
        quoteVolume: "100",
        symbol: "SOL_USDC",
        trades: "1000",
        volume: "99"
    }]);
})