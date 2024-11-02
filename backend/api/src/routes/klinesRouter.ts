import { Request, Response, Router } from "express";
import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();


const pgClient = new Client({
    user: process.env.DB_USER || "your_user",
    host: process.env.DB_HOST || 'localhost',
    database: 'my_database',
    password: process.env.DB_PASS || 'your_password',
    port: 5432,  
});
pgClient.connect();

export const klineRouter = Router();

//@ts-ignore
klineRouter.get("/", async (req: Request, res: Response) => {
    const { market, interval, startTime, endTime } = req.query as {
        market: string,
        interval: string,
        startTime: string,
        endTime: string
    };
    let query;
    switch(interval){
        case '1m':
            query = `SELECT * FROM klines_1m WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1h':
            query = `SELECT * FROM klines_1h WHERE bucket >= $1 AND bucket <= $2`;
            break;
        case '1w':
            query = `SELECT * FROM klines_1w WHERE bucket >= $1 AND bucket <= $2`;
            break;
        default:
            return res.status(400).send("Invalid Interval");
    }
    try{
        //@ts-ignore
        const result = await pgClient.query(query, [new Date(parseInt(startTime) * 1000) as string, new Date(parseInt(endTime) * 1000) as string]);
        res.json(result.rows.map(x => ({
            close: x.close,
            end: x.bucket,
            high: x.high,
            low: x.low,
            open: x.open,
            quoteVolume: x.quoteVolume,
            start: x.start,
            trades: x.trades,
            volume: x.volume,
        })));
    }catch(e){
        console.log("Error: ", e);
        res.status(500).send(e);
    }
});