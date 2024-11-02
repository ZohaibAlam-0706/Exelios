import axios from "axios";
import { fetAllMktsURL } from "./utils/types";
import { Markets } from "./components/markets";
import Image from "next/image";

export default async function Home() {
  const response = await axios.get(fetAllMktsURL);
  const markets: {
    symbol: string,
    name: string,
    current_price: number,
    market_cap: number,
    price_change_percentage_24h: number,
    image: string
  }[] = response.data;

  return (
    <div>
      <div className="w-full flex justify-center mt-10 ">
        <Image src="landing-page.jpg" alt="Landing Page" className="w-7/12 rounded-lg" unoptimized/>
      </div>
      <div className="mt-10 flex justify-center w-full">
          <div className="bg-zinc-900 rounded-md mb-10 w-10/12">
            <div className="text-slate-400 ml-3 mt-5 text-2xl">
              Spotlight
            </div>
            <div className="flex justify-between px-5 py-5 text-slate-400 w-full">
              <div className="w-1/6">
                Name
              </div>
              <div className="flex justify-end w-4/6">
                <div className="w-48 text-center">
                  Price
                </div>
                <div className="w-48 text-center">
                  Market Cap
                </div>
                <div className="w-48 text-center">
                  24H Change
                </div>
                <div className="w-48 text-center">
                  Last 7 days
                </div>
              </div>
            </div>
            <div>
              {markets.map((market: {
                symbol: string,
                name: string,
                current_price: number,
                market_cap: number,
                price_change_percentage_24h: number,
                image: string
              }) => <Markets key={market.symbol} symbol={market.symbol} name={market.name} currentPrice={market.current_price} marketCap={market.market_cap} priceChangePercent={market.price_change_percentage_24h} img={market.image} />)}
            </div>
          </div>
      </div>
      {/* Custom scrollbar styles */}
      <style>
        {`
          /* Track */
          ::-webkit-scrollbar {
              width: 4px;
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
