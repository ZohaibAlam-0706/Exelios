import { Client } from 'pg';
import { createClient } from 'redis';  
import { DbMessage } from './types';
import dotenv from "dotenv";
dotenv.config();

const pgClient = new Client({
    user: 'your_user',
    host: process.env.DB_HOST || 'localhost',
    database: 'my_database',
    password: 'your_password',
    port: 5432,
});
pgClient.connect();

async function main() {
    const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
    await redisClient.connect();
    console.log("connected to redis");

    while (true) {
        const response = await redisClient.rPop("db_processor" as string)
        if (!response) {

        }  else {
            const data: DbMessage = JSON.parse(response);
            if (data.type === "TRADE_ADDED") {
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO sol_prices (time, price) VALUES ($1, $2)';
                // TODO: How to add volume?
                const values = [timestamp, price];
                await pgClient.query(query, values);
            }
        }
    }

}

main();