import { useEffect, useState, useRef, useLayoutEffect } from "react";
import BackgroundGeometry from "./components/BackgroundGeometry";
import "./App.css";

const mockPortfolio = [
  { id: 1, coinId: "bitcoin", amount: 0.5, buyPrice: 60000 },
  { id: 2, coinId: "ethereum", amount: 5, buyPrice: 2000 },
  { id: 3, coinId: "solana", amount: 50, buyPrice: 100 },
];

const SparklinePath = ({ d, color }: { d: string; color?: string }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    if (pathRef.current && d !== "M 0 10 L 100 10") {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [d]);

  return (
    <path
      ref={pathRef}
      d={d}
      className="animate-draw"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        stroke: color,
        opacity: 0.8,
        strokeDasharray: pathLength || 1000,
        strokeDashoffset: pathLength ? 0 : 1000,
        transition: "stroke-dashoffset 2s ease-in-out",
      }}
    />
  );
};

type MarketRow = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
};

function generateSparklinePath(prices?: number[]): string {
  if (!prices || prices.length < 2) return "M 0 10 L 100 10";

  const smoothPrices = prices.filter((_, i) => i % 4 === 0);

  const min = Math.min(...smoothPrices);
  const max = Math.max(...smoothPrices);
  const range = max - min || 1;
  const width = 100;
  const height = 40;

  const points = smoothPrices.map((price, index) => {
    const x = (index / (smoothPrices.length - 1)) * width;
    const y = height - ((price - min) / range) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return `M ${points.join(" L ")}`;
}

function formatPrice(v: number) {
  return v >= 1
    ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : `$${v.toFixed(6)}`;
}

function formatMarketCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(1)}M`;
}

function App() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [activeTab, setActiveTab] = useState("markets");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load(isFirstTime = false) {
      try {
        if (isFirstTime) setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true",
        );
        const data = await res.json();
        if (!cancelled) setMarkets(data);
      } catch {
        if (!cancelled) setError("FAILED TO SYNC DATA");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(true);

    const intervalId = setInterval(() => {
      load(false);
    }, 60000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-zinc-400 font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <div className="noise-overlay" />
      <BackgroundGeometry />

      <header className="fixed top-0 left-0 w-full z-50 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold tracking-widest text-white text-2xl">
            [OMNISIGHT]
          </span>
          <nav className="hidden sm:flex gap-8 text-sm font-bold tracking-widest text-zinc-500">
            <button
              onClick={() => setActiveTab("markets")}
              className={`hover:text-white transition-colors ${activeTab === "markets" ? "text-white" : "text-zinc-500"}`}
            >
              MARKETS
            </button>

            <a href="#" className="hover:text-white transition-colors">
              ANALYTICS
            </a>

            <button
              onClick={() => setActiveTab("portfolio")}
              className={`hover:text-white transition-colors ${activeTab === "portfolio" ? "text-white" : "text-zinc-500"}`}
            >
              PORTFOLIO
            </button>
          </nav>
          <button className="px-4 py-2 text-xs font-black bg-white text-black hover:bg-zinc-200 transition-all">
            CONNECT WALLET
          </button>
        </div>
      </header>

      <div className="relative z-10 animate-reveal flex flex-col min-h-screen">
        <main className="flex-1 max-w-5xl mx-auto w-full pt-36 px-6 pb-20">
          {activeTab === "markets" && (
            <>
              <div className="mb-10 flex flex-col gap-2">
                <div className="text-xs font-mono text-zinc-600 tracking-widest">
                  LAST SYNC: {currentTime.toLocaleDateString()}{" "}
                  {currentTime.toLocaleTimeString()}
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-white/40">
                    Market Overview
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="border border-white/[0.05] bg-white/[0.01] backdrop-blur-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/[0.05] bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-zinc-500">
                        <th className="px-6 py-4">Asset</th>
                        <th className="px-6 py-4 text-right">Price</th>
                        <th className="px-6 py-4 text-right hidden sm:table-cell">
                          Mkt Cap
                        </th>
                        <th className="px-6 py-4 text-right">Trend (7d)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-20 text-center font-mono text-xs tracking-widest"
                          >
                            SYNCING...
                          </td>
                        </tr>
                      ) : error ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-20 text-center text-red-500/50 font-mono text-xs"
                          >
                            {error}
                          </td>
                        </tr>
                      ) : (
                        markets.map((coin, idx) => {
                          const isNeg =
                            (coin.price_change_percentage_24h ?? 0) < 0;
                          const sparkline = coin.sparkline_in_7d?.price;
                          let is7dNeg = false;
                          if (sparkline && sparkline.length > 0) {
                            const firstPrice = sparkline[0];
                            const lastPrice = sparkline[sparkline.length - 1];
                            is7dNeg = lastPrice < firstPrice;
                          }
                          return (
                            <tr
                              key={coin.id}
                              className="group hover:bg-white/[0.01] transition-colors animate-reveal opacity-0"
                              style={{ animationDelay: `${idx * 0.05}s` }}
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {coin.name}
                                  </span>
                                  <span className="text-xs font-mono text-zinc-600">
                                    {coin.symbol.toUpperCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right font-mono">
                                <span className="text-sm text-zinc-300">
                                  {formatPrice(coin.current_price)}
                                </span>
                                <span
                                  className={`ml-2 text-xs ${isNeg ? "text-red-500/90" : "text-emerald-500/90"}`}
                                >
                                  ({!isNeg && "+"}
                                  {coin.price_change_percentage_24h?.toFixed(2)}
                                  %)
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-sm text-zinc-500 hidden sm:table-cell">
                                {formatMarketCap(coin.market_cap)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <svg
                                  className="inline-block w-24 h-10"
                                  viewBox="0 0 100 40"
                                  preserveAspectRatio="none"
                                >
                                  <SparklinePath
                                    d={generateSparklinePath(
                                      coin.sparkline_in_7d?.price,
                                    )}
                                    color={is7dNeg ? "#ef4444" : "#10b981"}
                                  />
                                </svg>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
          {activeTab === "portfolio" && (
            <>
              <div className="mb-10 flex items-center gap-4">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </div>
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/40">
                  Your Portfolio
                </h2>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>

              <div className="border border-white/[0.05] bg-white/[0.01] backdrop-blur-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.02] text-xs font-bold uppercase tracking-widest text-zinc-500">
                      <th className="px-6 py-4">Asset</th>
                      <th className="px-6 py-4 text-right">Holdings</th>
                      <th className="px-6 py-4 text-right">Value</th>
                      <th className="px-6 py-4 text-right">Profit/Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {mockPortfolio.map((position) => {
                      // 1. Ищем актуальные данные
                      const actualCoin = markets.find(
                        (m) => m.id === position.coinId,
                      );

                      if (!actualCoin) return null;

                      const currentValue =
                        actualCoin.current_price * position.amount;
                      const profitLoss =
                        currentValue - position.amount * position.buyPrice;
                      const isProfit = profitLoss >= 0;

                      // 4. Отрисовка строки
                      return (
                        <tr
                          key={position.id}
                          className="group hover:bg-white/[0.01] transition-colors animate-reveal"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">
                                {actualCoin.name}
                              </span>
                              <span className="text-xs font-mono text-zinc-600">
                                {actualCoin.symbol.toUpperCase()}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-zinc-300">
                            {position.amount}
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-sm text-zinc-300">
                            $
                            {currentValue.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-mono text-sm ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {isProfit ? "+" : ""}$
                            {profitLoss.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </main>
        <footer className="border-t border-white/[0.05] py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-6 flex justify-between items-center text-xs font-mono text-zinc-600 tracking-widest">
            <span>© {new Date().getFullYear()} OMNISIGHT TERMINAL</span>
            <span>SYSTEM STATUS: OPERATIONAL</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
