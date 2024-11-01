import express from 'express';
import cors from 'cors';
import { orderRouter } from './routes/orderRouter';
import { depthRouter } from './routes/depthRouter';
import { tradesRouter } from './routes/tradesRouter';
import { klineRouter } from './routes/klinesRouter';
import { tickerRouter } from './routes/tickerRouter';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/order", orderRouter);
app.use("/api/v1/depth", depthRouter);
app.use("/api/v1/trades", tradesRouter);
app.use("/api/v1/klines", klineRouter);
app.use("/api/v1/tickers", tickerRouter);

app.listen(3001, () => {
    console.log("Api is listening on port 3001");
})