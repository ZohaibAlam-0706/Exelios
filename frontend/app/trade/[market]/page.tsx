"use client"
import { Depth } from "@/app/components/depth/Depth";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function page(){
    const { market } = useParams();
    const [currPrice, setCurrPrice] = useState(0.00);
    return (
        <div className="flex flex-row flex-1 overflow-hidden bg-backcolor" >
            <div className="flex flex-col flex-1">
                <MarketBar market={market as string} />
                <div className="flex flex-row h-auto border-y border-slate-800 pb-5">
                    <div className="flex flex-col flex-1 w-[270px] h-10/12 border-r-2 border-b-2 pb-3 border-slate-900">
                        <TradeView market={market as string} />
                    </div>
                    <div className="flex flex-col w-[290px] overflow-hidden border-b-2 border-slate-900">
                        <Depth market={market as string} currPrice={currPrice} setCurrPrice={setCurrPrice}/> 
                    </div>
                </div>
            </div>
            <div className=" flex-col border-slate-800 border-l"></div>
            <div>
                <div className="flex flex-col w-72">
                    <SwapUI market={market as string} currPrice={currPrice} />
                </div>
            </div>
        </div>
    )
}