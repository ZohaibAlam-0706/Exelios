import { Router } from "express";


export const tradesRouter = Router();

tradesRouter.get('/', async (req, res) => {
    const { market } = req.query;
    //Get from DB
    res.json({});
})