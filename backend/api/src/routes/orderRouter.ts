import { application, Router } from "express";
import { RedisManager } from "../redisManager";
import { CANCEL_ORDER, CREATE_ORDER, GET_OPEN_ORDERS } from "../types";

export const orderRouter = Router();

orderRouter.post('/',async (req, res) => {
    const { market, price, quantity, side, userId } = req.body;
    console.log({ market, price, quantity, side, userId });
    const response = await RedisManager.getInstance().sendAndAwait({
        type: CREATE_ORDER,
        data: {
        market,
        price,
        quantity,
        side,
        userId
        }
    });
    res.json(response.payload);
});

orderRouter.delete('/', async (req, res) => {
    const { orderId, market } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: CANCEL_ORDER,
        data: {
            orderId,
            market
        }
    });
    res.json(response.payload);
});

orderRouter.get('/open', async (req, res) => {
    const { userId, market } = req.body;
    const response = await RedisManager.getInstance().sendAndAwait({
        type: GET_OPEN_ORDERS,
        data: {
            userId,
            market
        }
    });
    res.json(response.payload);
})