"use client";
import { act, useState } from "react";

export function SwapUI({ market, currPrice }: {market: string, currPrice: any}) {
    const [amount, setAmount] = useState('');
    const [activeTab, setActiveTab] = useState('buy');
    const [type, setType] = useState('limit');
    const [buyingQuantity, setBuyingQuantity] = useState(0.00);
    const [money, setMoney] = useState(0);

    function calculate(e: any){
        if(e.target.value == 0){
            setBuyingQuantity(0);
        }
        if(e.target.value > 0){
            setMoney(e.target.value);
            setBuyingQuantity(money/currPrice);
        }else{
            e.target.value = 0;
        }
    }


    return <div>
        <div className="flex flex-col">
            <div className="flex flex-row h-[60px]">
                <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
                <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="flex flex-col gap-1">
                <div className="px-3">
                    <div className="flex flex-row flex-0 gap-5 undefined">
                        <LimitButton type={type} setType={setType} />
                        <MarketButton type={type} setType={setType} />                       
                    </div>
                </div>
                <div className="flex flex-col px-3">
                    <div className="flex flex-col flex-1 gap-3 ">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between flex-row">
                                <p className="text-xs font-normal ">Available Balance</p>
                                <p className="font-medium text-xs">36.94 USDC</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-normal">
                                Price
                            </p>
                            <div className="flex flex-col relative mb-2">
                                <input onChange={calculate} step="0.01" placeholder="0" className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0" type="text" / >
                                <div className="flex flex-row absolute right-1 top-1 p-2">
                                    <div className="relative">
                                        <img src="/USDC.svg" className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        {type=='limit' ? <>
                            <p className="text-xs font-normal">
                                Quantity
                            </p>
                            <div className="flex flex-col relative">
                                <input step="0.01" placeholder="0" className="h-12 rounded-lg border-2 border-solid border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 ring-0 transition focus:border-accentBlue focus:ring-0" type="text" />
                                <div className="flex flex-row absolute right-1 top-1 p-2">
                                    <div className="relative">
                                        <img src={`/${market}.svg`} className="w-4 h-4 mt-1" />
                                    </div>
                                </div>
                            </div>
                        </>:<></>}
                        {type==='market' && 
                            <div className="mt-1">
                                <div className=" flex justify-end flex-row">
                                    <p className="font-medium pr-2 text-xs">≈ {buyingQuantity} USDC</p>
                                </div>
                                <div className="mt-3 flex justify-start flex-row text-xs">
                                    <p>Current Price = {currPrice}</p>
                                </div>
                            </div>}
                        <div className="flex justify-center flex-row mt-2 gap-3">
                            <div className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3">
                                25%
                            </div>
                            <div className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3">
                                50%
                            </div>
                            <div className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3">
                                75%
                            </div>
                            <div className="flex items-center justify-center flex-row rounded-full px-[16px] py-[6px] text-xs cursor-pointer bg-baseBackgroundL2 hover:bg-baseBackgroundL3">
                                Max
                            </div>
                        </div>
                    </div>
                        <button type="button" className={`font-semibold  focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4  text-greenPrimaryButtonText active:scale-98 ${activeTab == 'buy'? 'bg-green-800 hover:bg-green-600': 'bg-red-800 hover:bg-red-600'}`} data-rac="">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</button>
                    <div className="flex justify-between flex-row mt-1">
                        <div className="flex flex-row gap-2">
                            <div className="flex items-center">
                                <input className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5" id="postOnly" type="checkbox" data-rac="" />
                                <label className="ml-2 text-xs">Post Only</label>
                            </div>
                            <div className="flex items-center">
                                <input className="form-checkbox rounded border border-solid border-baseBorderMed bg-base-950 font-light text-transparent shadow-none shadow-transparent outline-none ring-0 ring-transparent checked:border-baseBorderMed checked:bg-base-900 checked:hover:border-baseBorderMed focus:bg-base-900 focus:ring-0 focus:ring-offset-0 focus:checked:border-baseBorderMed cursor-pointer h-5 w-5" id="ioc" type="checkbox" data-rac="" />
                                <label className="ml-2 text-xs">IOC</label>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
</div>
}

function LimitButton({ type, setType }: { type: string, setType: any }) {
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('limit')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'limit' ? "border-blue-500" : "border-transparent text-slate-400 hover:border-b-2 hover:border-white hover:text-white"}`}>
        Limit
    </div>
</div>
}

function MarketButton({ type, setType }: { type: string, setType: any }) {
    return  <div className="flex flex-col cursor-pointer justify-center py-2" onClick={() => setType('market')}>
    <div className={`text-sm font-medium py-1 border-b-2 ${type === 'market' ? "border-blue-500" : "hover:border-b-2 border-transparent text-slate-400 hover:border-white  hover:text-white"} `}>
        Market
    </div>
    </div>
}

function BuyButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'buy' ? 'border-b-green-400 bg-green-400 bg-opacity-10' : 'border-b-slate-900 hover:border-b-slate-800'}`} onClick={() => setActiveTab('buy')}>
        <p className="text-center text-sm font-semibold text-greenText bg-opacity-100">
            Buy
        </p>
    </div>
}

function SellButton({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: any }) {
    return <div className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === 'sell' ? 'border-b-red-800 bg-red-800 bg-opacity-25' : 'border-b-slate-900 hover:border-b-slate-800'}`} onClick={() => setActiveTab('sell')}>
        <p className="text-center text-sm font-semibold text-red-600">
            Sell
        </p>
    </div>
}