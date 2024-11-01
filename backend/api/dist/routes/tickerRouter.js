"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tickerRouter = void 0;
const express_1 = require("express");
exports.tickerRouter = (0, express_1.Router)();
exports.tickerRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
