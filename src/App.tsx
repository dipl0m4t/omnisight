import { useEffect, useState, useRef, useLayoutEffect } from "react";
import BackgroundGeometry from "./components/BackgroundGeometry";
import "./App.css";

const SparklinePath = ({ d, color }: { d: string; color?: string }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    if (pathRef.current) {
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
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        stroke: color,
        opacity: 0.6,
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
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
  const height = 20;

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true",
        );
        if (!res.ok) throw new Error("API Limit Reached");
        const data = await res.json();
        if (!cancelled) setMarkets(data);
      } catch {
        if (!cancelled) setError("FAILED TO SYNC DATA");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black text-zinc-400 font-sans selection:bg-white selection:text-black overflow-x-hidden">
      <div className="noise-overlay" />
      <BackgroundGeometry />

      <div className="relative z-10 animate-reveal flex flex-col min-h-screen">
        <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-black/60 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <span className="font-bold tracking-tighter text-white text-lg">
              [OMNISIGHT]
            </span>
            <nav className="hidden sm:flex gap-8 text-[11px] font-bold tracking-widest text-zinc-500">
              <a href="#" className="hover:text-white transition-colors">
                MARKETS
              </a>
              <a href="#" className="hover:text-white transition-colors">
                ANALYTICS
              </a>
              <a href="#" className="hover:text-white transition-colors">
                PORTFOLIO
              </a>
            </nav>
            <button className="px-4 py-2 text-[10px] font-black bg-white text-black hover:bg-zinc-200 transition-all">
              CONNECT WALLET
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full pt-20 px-6 pb-20">
          <div className="mb-10 flex items-center gap-4">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">
              Market Overview
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>

          <div className="border border-white/[0.05] bg-white/[0.01] backdrop-blur-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.05] bg-white/[0.02] text-[10px] font-bold uppercase tracking-widest text-zinc-500">
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
                      className="py-20 text-center font-mono text-[10px] tracking-widest"
                    >
                      SYNCING...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-20 text-center text-red-500/50 font-mono text-[10px]"
                    >
                      {error}
                    </td>
                  </tr>
                ) : (
                  markets.map((coin, idx) => {
                    const isNeg = (coin.price_change_percentage_24h ?? 0) < 0;
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
                            <span className="text-[10px] font-mono text-zinc-600">
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
                            {coin.price_change_percentage_24h?.toFixed(2)}%)
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-[11px] text-zinc-500 hidden sm:table-cell">
                          {formatMarketCap(coin.market_cap)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <svg
                            className="inline-block w-20 h-7"
                            viewBox="0 0 100 20"
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
        </main>
      </div>
    </div>
  );
}

export default App;
