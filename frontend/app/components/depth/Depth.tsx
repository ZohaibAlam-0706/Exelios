"use client";
import { useEffect, useRef, useState } from "react";
import { getDepth, getTicker } from "../../utils/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";
import { Trade } from "@/app/utils/types";
import { TradesTable } from "./TradesTable";

export function Depth({ market, currPrice, setCurrPrice }: { market: string, currPrice: any, setCurrPrice: any }) {
    const [bids, setBids] = useState<[string, string][]>();
    const [asks, setAsks] = useState<[string, string][]>();
    const [price, setPrice] = useState<string>();
    const [activeTab, setActiveTab] = useState<'book' | 'trades'>('book');
    const containerRef = useRef<HTMLDivElement>(null);
    const [trades, setTrades] = useState<Trade[] | null>(null);

    const scrollToCenter = () => {
        if (containerRef.current) {
            const scrollHeight = containerRef.current.scrollHeight;
            const clientHeight = containerRef.current.clientHeight;
            containerRef.current.scrollTop = (scrollHeight - clientHeight) / 1.5;
        }
    };


    useEffect(() => {
        const updateData = (data: any) => {
            setBids((originalBids) => {
                const bidsAfterUpdate = [...(originalBids || [])];

                data.bids.forEach(([price, size]: [string, string]) => {
                    const index = bidsAfterUpdate.findIndex(bid => bid[0] === price);
                    if (index !== -1) {
                        if (size === "0.00") {
                            bidsAfterUpdate.splice(index, 1);
                        } else {
                            bidsAfterUpdate[index][1] = size;
                        }
                    } else if (size !== "0.00") {
                        bidsAfterUpdate.push([price, size]);
                    }
                });
                return bidsAfterUpdate; 
            });

            setAsks((originalAsks) => {
                const asksAfterUpdate = [...(originalAsks || [])];

                data.asks.forEach(([price, size]: [string, string]) => {
                    const index = asksAfterUpdate.findIndex(ask => ask[0] === price);
                    if (index !== -1) {
                        if (size === "0.00") {
                            asksAfterUpdate.splice(index, 1);
                        } else {
                            asksAfterUpdate[index][1] = size;
                        }
                    } else if (size !== "0.00") {
                        asksAfterUpdate.push([price, size]);
                    }
                });
                return asksAfterUpdate; 
            });
        };
        const updateTrades = (data: any) => {
            setTrades((originalTrades) => {
                const newTrades = [];
                newTrades.push(data);
                originalTrades?.forEach(trade => {
                    newTrades.push(trade);
                })
                return newTrades;
            })
        }
        
        SignalingManager.getInstance().registerCallback("depth", updateData, `DEPTH-${market}`);
        SignalingManager.getInstance().registerCallback("trade", updateTrades,`TRADES-${market}`);

        SignalingManager.getInstance().sendMessage({ "method": "SUBSCRIBE", "params": [`depth.${market}`], "id":6 });
        SignalingManager.getInstance().sendMessage({ "method":"SUBSCRIBE","params":["trade.SOL_USDC"],"id":7 });

        getDepth(market).then(d => {    
            setBids(d.bids.reverse());
            
            setAsks(d.asks);
            scrollToCenter();
        });

        getTicker(market).then(t => {
            setPrice(t.lastPrice)
            setCurrPrice(t.lastPrice);
        });

        return () => {
            SignalingManager.getInstance().sendMessage({ "method": "UNSUBSCRIBE", "params": [`depth.200ms.${market}`],"id":9 });
            SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
            SignalingManager.getInstance().sendMessage({"method":"UNSUBSCRIBE","params":["trade.SOL_USDC"],"id":8 });
            SignalingManager.getInstance().deRegisterCallback("trade", `TRADES-${market}`);
        };
    }, [market]);

    return (
        <div className="mx-3">
            <div>
                <div className="flex justify-items-start gap-4">
                    <BookButton activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TradesButton activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
            </div>
            {activeTab==='book' ? <>
                <TableHeader />
                <div className="h-[500px] overflow-y-auto scrollbar" ref={containerRef}>
                    <div>
                        {asks && <AskTable asks={asks} />}
                        {price && (
                            <div className="my-2 text-green-500 flex justify-between">
                                <div>{price}</div>
                                <button 
                                    onClick={scrollToCenter} // Use the scrollToCenter directly
                                    className="text-blue-500 py-1 px-0 rounded text-xs">
                                    Recenter
                                </button>
                            </div>
                        )}
                        {bids && <BidTable bids={bids} />}
                    </div>
                </div>
            </>:<>
                <TradeHeader />
                <div className="h-[500px] overflow-y-auto scrollbar">
                    <TradesTable trades={trades}/>
                </div>
            </>}
            {/* Custom scrollbar styles */}
            <style>
                {`
                /* Track */
                ::-webkit-scrollbar {
                    width: 0px;
                }

                /* Handle */
                ::-webkit-scrollbar-thumb {
                    background: #4f4f4f;
                    border-radius: 5px;
                }

                /* Handle on hover */
                ::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
                `}
            </style>
        </div>
    );
}

function TableHeader() {
    return (
        <div className="flex justify-between text-sm mt-4 mb-2">
            <div className="text-white">Price</div>
            <div className="text-slate-500">Size</div>
            <div className="text-slate-500">Total</div>
        </div>
    );
}

function BookButton({ activeTab, setActiveTab }: { activeTab: 'trades' | 'book'; setActiveTab: any }) {
    return (
        <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setActiveTab('book')}>
            <div className={`text-sm font-medium py-1 border-b-2 ${activeTab === 'book' ? "border-blue-500" : "border-transparent text-slate-400 hover:border-b-2 hover:border-white hover:text-white"}`}>
                Book
            </div>
        </div>
    );
}

function TradesButton({ activeTab, setActiveTab }: { activeTab: 'trades' | 'book'; setActiveTab: any }) {
    return (
        <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setActiveTab('trades')}>
            <div className={`text-sm font-medium py-1 border-b-2 ${activeTab === 'trades' ? "border-blue-500" : "border-transparent text-slate-400 hover:border-b-2 hover:border-white hover:text-white"}`}>
                Trades
            </div>
        </div>
    );
}

function TradeHeader(){
    return (
        <div className="flex justify-between text-sm mt-4 mb-2">
            <div className="text-white ml-1">Price</div>
            <div className="text-slate-500">Size</div>
            <div className="text-slate-500 w-10"></div>
        </div>
    );
}