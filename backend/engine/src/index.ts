import { createClient } from "redis";
import { Engine } from "./trade/Engine";


async function main(){
    const redisHost = process.env.REDIS_HOST || 'localhost'; // Default to localhost for local development
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const engine = new Engine();
    const redisClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
    await redisClient.connect();
    console.log("connected to redis");

    while(true){
        const response = await redisClient.rPop("messages" as string);
        if(!response){}
        else{
            engine.process(JSON.parse(response));
        }
    }
}

main();