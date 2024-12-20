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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pgClient = new pg_1.Client({
    user: 'your_user',
    host: process.env.DB_HOST || 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});
pgClient.connect();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
        const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
        const redisClient = (0, redis_1.createClient)({ url: `redis://${redisHost}:${redisPort}` });
        yield redisClient.connect();
        console.log("connected to redis");
        while (true) {
            const response = yield redisClient.rPop("db_processor");
            if (!response) {
            }
            else {
                const data = JSON.parse(response);
                if (data.type === "TRADE_ADDED") {
                    console.log("adding data");
                    console.log(data);
                    const price = data.data.price;
                    const timestamp = new Date(data.data.timestamp);
                    const query = 'INSERT INTO sol_prices (time, price) VALUES ($1, $2)';
                    // TODO: How to add volume?
                    const values = [timestamp, price];
                    yield pgClient.query(query, values);
                }
            }
        }
    });
}
main();
