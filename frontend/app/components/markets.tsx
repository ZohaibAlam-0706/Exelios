"use client"
import Image from "next/image";
import { useRouter } from "next/navigation"


export function Markets({ symbol, name, currentPrice, marketCap, priceChangePercent, img }: {
    symbol: string,
    name: string,
    currentPrice: number,
    marketCap: number,
    priceChangePercent: number,
    img: string
}) {

    const router = useRouter();

    return <div onClick={() => {
        router.push(`/trade/${symbol.toUpperCase()}_USDC`);

    }} className="flex w-full justify-between px-5 py-4 border-t-[1px] border-gray-800 hover:bg-zinc-800 hover:cursor-pointer">
        <div className="flex w-1/6 gap-7 place-items-center">
            <Image src={img} alt={symbol} className="h-10 w-10 rounded-full" unoptimized/>
            <div className="">
                <div className="font-semibold">
                    {name}
                </div>
                <div className="text-sm text-slate-400">
                    {symbol.toUpperCase()}
                </div>
            </div>
        </div>
        <div className="flex w-4/6 justify-end items-center">
            <div className="w-48 text-center">
                ${currentPrice}
            </div>
            <div className="w-48 text-center">
                ${marketCap}
            </div>
            <div className={`w-48 text-center ${priceChangePercent < 0 ? `text-red-700` : `text-green-500`}`}>
                {priceChangePercent.toFixed(2)} %
            </div>
            <div className="w-48 text-center">
                Chart
            </div>
        </div>
    </div>
}