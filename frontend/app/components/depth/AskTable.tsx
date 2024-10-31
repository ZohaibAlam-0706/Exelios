
export const AskTable = ({ asks }: { asks: [string, string][] }) => {
    let currentTotal = 0;
    const relevantAsks = asks.slice(0, 15);
    relevantAsks.reverse();
    const asksWithTotal: [string, string, number][] = relevantAsks.map(([price, quantity]) => [price, quantity, currentTotal += Number(quantity)]);
    const maxTotal = relevantAsks.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);
    asksWithTotal.reverse();

    return <div>
        {asksWithTotal.map(([price, quantity, total]) => <Ask maxTotal={maxTotal} key={price} price={price} quantity={quantity} total={total} />)}
    </div>
}
function Ask({price, quantity, total, maxTotal}: {price: string, quantity: string, total: number, maxTotal: number}) {
    return <div
    style={{
        display: "flex",
        position: "relative",
        width: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
    }}
>
    <div
        style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: `${(90 * total) / maxTotal}%`,
        height: "92%",
        background: "rgba(228, 75, 68, 0.325)",
        transition: "width 0.3s ease-in-out",
        }}
    ></div>
    <div className="flex justify-between text-sm w-full font-mono mb-1">
        <div className="text-red-600">
            {price}
        </div>
        <div className="text-slate-500 font-thin">
            {quantity}
        </div>
        <div className="text-slate-500 font-thin">
            {total?.toFixed(2)}
        </div>
    </div>
    </div>
}