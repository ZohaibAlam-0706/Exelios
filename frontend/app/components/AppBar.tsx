"use client"
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation"

export const AppBar = () => {
    const navigate = useRouter();
    return (
        <div className="flex flex-row justify-between h-14 bottom-4 border-b-2 border-gray-900 bg-backcolor">
            <div className="flex flex-row items-center">
                <Image src="/LOGO.png" alt="logo" className="h-10 w-10 ml-4 rounded-full hover:cursor-pointer" onClick={() => navigate.push('/')} unoptimized/>
                <Link className="items-center text-center font-sans font-bold rounded-lg focus:ring-blue-200 flex flex-col justify-center h-14 text-3xl p-0 ml-[10px] mr-10 shrink-0 bg-gradient-to-r from-red-300 to-red-700 bg-clip-text text-transparent" href="/">Exelios</Link>
                <Link className="items-center text-center font-semibold rounded-lg focus:ring-blue-200 flex flex-col justify-center bg-transparent h-14 text-md p-0 font-sans hover:text-gray-300 " href="/">Markets</Link>
                <Link className="items-center text-center ml-8 font-semibold rounded-lg focus:ring-blue-200 flex flex-col justify-center bg-transparent h-14 text-md p-0 font-sans " href="/trade/SOL_USDC">Spot</Link>
            </div>
            <div className="mt-1.5 h-14 ml-10">
                <div className="flex items-center flex-row w-[340px] flex-1 overflow-hidden rounded-full px-1 ring-0 focus-within:ring-2 focus-within:ring-accentBlue bg-gray-800 h-10">
                    <div className="mx-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search h-4 w-4">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                    </div>
                        <input type="text" placeholder="Search markets" className="h-8 w-full border-0 p-0 text-sm font-normal outline-none focus:ring-0 bg-gray-800" ></input>
                </div>
            </div>
            <div className="flex flex-row">
                <div className="flex flex-row">
                    <button type="button" className="text-center font-sans font-semibold rounded-lg focus:ring-blue-200 relative  text-green-400 overflow-hidden h-8 text-md px-3 py-1 my-auto mr-4">
                        <div className="absolute bg-green-400 opacity-[16%] inset-0 hover:bg-green-200 ">
                        </div>
                        <div className="flex flex-row items-center justify-center gap-4">
                            <p className="text-greenText">Deposit</p>
                        </div>
                    </button>
                    <button type="button" className="text-center font-semibold font-sans rounded-lg focus:ring-blue-200 relative text-blue-500 overflow-hidden h-8 text-md px-3 py-1 my-auto mr-4">
                        <div className="absolute inset-0 bg-blue-500 hover:bg-blue-200 opacity-[16%]"></div>
                        <div className="flex flex-row items-center justify-center gap-4">
                            <p>Withdraw</p>
                        </div>
                    </button>
                </div>
                <div className="ml-6 flex flex-row align-middle">
                    <Link className="items-center text-center font-semibold rounded-lg focus:ring-blue-200 text-gray-400 flex flex-col justify-center bg-transparent h-14 text-sm p-0 my-auto mr-6" href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chart-pie h-5 w-5">
                            <path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"></path>
                            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                        </svg>
                    </Link>
                    <a className="items-center text-center font-semibold rounded-lg focus:ring-blue-200 text-gray-400 flex flex-col justify-center bg-transparent h-14 text-sm p-0 my-auto mr-6" href="/settings">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings h-5 w-5 ">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </a>
                    <div className="my-auto mr-4">
                        {/* <div> */}
                            <button type="button">
                                <div className="flex items-center justify-center flex-col relative overflow-hidden rounded-full h-[32px] w-[32px] px-[9px] mb-4 hover:cursor-pointer bg-[#F88484] bg-opacity-15">
                                    <div></div>
                                    <p className="whitespace-nowrap text-center font-semibold text-[14px] text-[#F88484] opacity-90">M</p>
                                </div>
                            </button>
                        {/* </div> */}
                    </div>
                </div>
            </div>
        </div>
    )
}