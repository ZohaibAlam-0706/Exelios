import { Trade } from "@/app/utils/types";


export function TradesTable({ trades }: { trades: Trade[] | null }) {
    return (
        <div>
            {trades?.map((trade,index) => {
                return (
                    <div key={index} className="flex justify-between w-full  ">
                        <div className={`text-md font-mono ${trade.isBuyerMaker===true? 'text-red-700': 'text-green-600'}`}>
                            {trade.price}
                        </div>
                        <div className="text-sm">
                            {trade.quantity}
                        </div>
                        <div className="text-sm">
                            {trade.timestamp}
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
