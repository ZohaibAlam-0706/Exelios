import axios from "axios";

const BASE_URL = process.env.API_URL || "http://localhost:3001";
//const BASE_URL = "http://api:3001";
const TOTAL_BIDS = 15;
const TOTAL_ASK = 15;
const MARKET = "SOL_USDC";
const USER_ID = "5";
const SPREAD = 0.01; // 1% spread
const PRICE_PRECISION = 2; // Number of decimal places for price

async function main() {
    const price = 1000 + Math.random() * 10;
    try {
        const openOrders = await axios.get(`${BASE_URL}/api/v1/order/open?userId=${USER_ID}&market=${MARKET}`);
        const totalBids = openOrders.data.filter((o: any) => o.side === "buy").length;
        const totalAsks = openOrders.data.filter((o: any) => o.side === "sell").length;

        const cancelledBids = await cancelBidsMoreThan(openOrders.data.filter((o: any) => o.side === "buy"), price);
        const cancelledAsks = await cancelAsksLessThan(openOrders.data.filter((o: any) => o.side === "sell"), price);

        let bidsToAdd = TOTAL_BIDS - totalBids - cancelledBids;
        let asksToAdd = TOTAL_ASK - totalAsks - cancelledAsks;

        while (bidsToAdd > 0 || asksToAdd > 0) {
            if (bidsToAdd > 0) {
                await axios.post(`${BASE_URL}/api/v1/order`, {
                    market: MARKET,
                    price: (price - Math.random() * 1).toFixed(PRICE_PRECISION).toString(),
                    quantity: "1",
                    side: "buy",
                    userId: USER_ID
                });
                bidsToAdd--;
            }
            if (asksToAdd > 0) {
                await axios.post(`${BASE_URL}/api/v1/order`, {
                    market: MARKET,
                    price: (price + Math.random() * 1).toFixed(PRICE_PRECISION).toString(),
                    quantity: "1",
                    side: "sell",
                    userId: USER_ID
                });
                asksToAdd--;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (e) {
        console.log("Error: ", e);
    }

    main();
}

async function cancelBidsMoreThan(openOrders: any[], price: number) {
    let promises: any[] = [];
    openOrders.forEach((o: any) => {
        console.log(`Checking order: ${o.orderId}, side: ${o.side}, price: ${o.price}`);
        if (o.side === "buy" && (o.price > price || Math.random() < 0.1)) {
            promises.push(axios.delete(`${BASE_URL}/api/v1/order`, {
                data: {
                    orderId: o.orderId,
                    market: MARKET
                }
            }));
        }
    });
    await Promise.all(promises);
    return promises.length;
}

async function cancelAsksLessThan(openOrders: any[], price: number) {
    let promises: any[] = [];
    openOrders.forEach((o: any) => {
        console.log(`Checking order: ${o.orderId}, side: ${o.side}, price: ${o.price}`);
        if (o.side === "sell" && (o.price < price || Math.random() < 0.1)) {
            promises.push(axios.delete(`${BASE_URL}/api/v1/order`, {
                data: {
                    orderId: o.orderId,
                    market: MARKET
                }
            }));
        }
    });
    await Promise.all(promises);
    return promises.length;
}

setInterval(() => {
    main();
}, 10000);