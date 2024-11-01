"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const orderRouter_1 = require("./routes/orderRouter");
const depthRouter_1 = require("./routes/depthRouter");
const tradesRouter_1 = require("./routes/tradesRouter");
const klinesRouter_1 = require("./routes/klinesRouter");
const tickerRouter_1 = require("./routes/tickerRouter");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/v1/order", orderRouter_1.orderRouter);
app.use("/api/v1/depth", depthRouter_1.depthRouter);
app.use("/api/v1/trades", tradesRouter_1.tradesRouter);
app.use("/api/v1/klines", klinesRouter_1.klineRouter);
app.use("/api/v1/tickers", tickerRouter_1.tickerRouter);
app.listen(3001, () => {
    console.log("Api is listening on port 3001");
});
