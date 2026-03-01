import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { ThemeToggle } from "./components/theme/ThemeToggle";
import BackgroundGeometry from "./components/BackgroundGeometry";
import "./App.css";
import { useTheme } from "./components/theme/ThemeContext";

// --- КОНФИГ И МОКИ ---
const mockPortfolio = [
  { id: 1, coinId: "bitcoin", amount: 0.5, buyPrice: 60000 },
  { id: 2, coinId: "ethereum", amount: 5, buyPrice: 2000 },
  { id: 3, coinId: "solana", amount: 50, buyPrice: 100 },
];

const SparklinePath = ({ d, color }: { d: string; color?: string }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    if (pathRef.current && d !== "M 0 20 L 100 20") {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [d]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        stroke: color,
        opacity: 0.9,
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
  if (!prices || prices.length < 2) return "M 0 20 L 100 20";
  const smoothPrices = prices.filter((_, i) => i % 4 === 0);
  const min = Math.min(...smoothPrices);
  const max = Math.max(...smoothPrices);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  const padding = 4;

  const points = smoothPrices.map((price, index) => {
    const x = (index / (smoothPrices.length - 1)) * width;
    const y =
      height - padding - ((price - min) / range) * (height - 2 * padding);
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

// --- ОСНОВНОЙ КОМПОНЕНТ ---
function App() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [activeTab, setActiveTab] = useState("markets");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    let cancelled = false;
    async function load(isFirstTime = false) {
      try {
        if (isFirstTime) setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true",
        );
        const data = await res.json();
        if (!cancelled) {
          setMarkets(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("SYNC_ERROR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load(true);
    const intervalId = setInterval(() => load(false), 60000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Улучшенный контраст заголовков для светлой темы (zinc-600)
  const tableHeaderClass = `border-b border-zinc-100 dark:border-white/[0.05] bg-zinc-50/50 dark:bg-white/[0.02] text-xs font-bold uppercase tracking-[0.2em] py-4 px-6 text-zinc-600 dark:text-zinc-500`;
  const tableCellClass = "px-6 py-5 transition-colors";

  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-300 flex flex-col ${theme === "dark" ? "bg-black text-zinc-300" : "bg-white text-zinc-900"}`}
    >
      {/* ФОНОВАЯ ГЕОМЕТРИЯ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundGeometry theme={theme} />
      </div>

      <header
        className={`fixed top-6 inset-x-0 mx-auto w-[calc(100%-4rem)] max-w-5xl z-50 thick-glass refractive-distortion transition-colors duration-300 rounded-[32px] border animate-header-reveal
        ${
          theme === "dark"
            ? "border-white/[0.08] bg-white/[0.02] shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
            : "border-zinc-300 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        }`}
      >
        <div className="w-full px-10 py-5 flex items-center justify-between">
          <span className="font-mono font-black tracking-widest text-black dark:text-white text-2xl">
            [OMNISIGHT]
          </span>

          <nav className="hidden sm:flex gap-8 text-[12px] font-black tracking-[0.3em] text-zinc-600 dark:text-zinc-500 uppercase">
            <button
              onClick={() => setActiveTab("markets")}
              className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "markets" ? "text-black dark:text-white" : ""}`}
            >
              MARKETS
            </button>
            <a
              href="#"
              className="hover:text-black dark:hover:text-white transition-all"
            >
              ANALYTICS
            </a>
            <button
              onClick={() => setActiveTab("portfolio")}
              className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "portfolio" ? "text-black dark:text-white" : ""}`}
            >
              PORTFOLIO
            </button>
          </nav>

          <div className="flex items-center gap-6">
            <ThemeToggle />
            <button
              className={`px-6 py-2 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95
              ${
                theme === "dark"
                  ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1] rounded-4xl"
                  : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100 rounded-4xl"
              }`}
            >
              [CONNECT WALLET]
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto w-full pt-16 px-6 pb-20">
        <div className="mb-10 flex flex-col gap-3">
          <div className="text-xs font-mono font-black text-zinc-700 dark:text-zinc-500 tracking-widest uppercase flex justify-between">
            <span>
              LAST SYNC: {currentTime.toLocaleDateString()}{" "}
              {currentTime.toLocaleTimeString()}
            </span>
            {error && (
              <span className="text-red-500 font-bold animate-pulse">
                {error}
              </span>
            )}
          </div>
          <div className="flex items-center gap-5">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400">
              {activeTab === "markets" ? "Market Overview" : "Your Portfolio"}
            </h2>
            <div className="h-[1px] flex-1 bg-zinc-300 dark:bg-white/10" />
          </div>
        </div>

        {/* ТАБЛИЦА С АНИМАЦИЕЙ ПОЯВЛЕНИЯ (ТОТ САМЫЙ ДИВ) */}
        <div
          className={`border thick-glass refractive-distortion overflow-hidden rounded-[24px] transition-all animate-content-reveal
          ${
            theme === "dark"
              ? "border-white/[0.05] bg-white/[0.01] shadow-none"
              : "border-zinc-200 bg-white/70 shadow-2xl shadow-zinc-200/50"
          }`}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className={tableHeaderClass}>Asset</th>
                <th className={`${tableHeaderClass} text-right`}>
                  {activeTab === "markets" ? "Price" : "Holdings"}
                </th>
                <th
                  className={`${tableHeaderClass} text-right hidden sm:table-cell`}
                >
                  {activeTab === "markets" ? "Market Cap" : "Value"}
                </th>
                <th className={`${tableHeaderClass} text-right`}>
                  {activeTab === "markets" ? "Trend (7d)" : "Profit/Loss"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-24 text-center font-mono text-xs text-zinc-400 uppercase tracking-widest animate-pulse"
                  >
                    Initializing Sync...
                  </td>
                </tr>
              ) : activeTab === "markets" ? (
                markets.map((coin) => {
                  const isNeg = (coin.price_change_percentage_24h ?? 0) < 0;
                  const sparkline = coin.sparkline_in_7d?.price;
                  const is7dNeg = sparkline
                    ? sparkline[sparkline.length - 1] < sparkline[0]
                    : false;
                  return (
                    <tr
                      key={coin.id}
                      className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all font-mono"
                    >
                      <td className={tableCellClass}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-zinc-950 dark:text-zinc-100 tracking-tight">
                            {coin.name}
                          </span>
                          <span className="text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                            {coin.symbol.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className={`${tableCellClass} text-right`}>
                        <div className="flex flex-col items-end">
                          <span className="text-base font-bold text-zinc-950 dark:text-zinc-200 tracking-tight">
                            {formatPrice(coin.current_price)}
                          </span>
                          <span
                            className={`text-xs font-sans font-black mt-0.5 ${isNeg ? "text-red-500" : "text-emerald-500"}`}
                          >
                            {isNeg ? "▼" : "▲"}{" "}
                            {Math.abs(
                              coin.price_change_percentage_24h ?? 0,
                            ).toFixed(2)}
                            %
                          </span>
                        </div>
                      </td>
                      <td
                        className={`${tableCellClass} text-right text-sm font-medium text-zinc-500 hidden sm:table-cell tracking-wide`}
                      >
                        {formatMarketCap(coin.market_cap)}
                      </td>
                      <td className={`${tableCellClass} text-right`}>
                        <svg
                          className="inline-block w-20 h-9"
                          viewBox="0 0 100 40"
                          preserveAspectRatio="none"
                        >
                          <SparklinePath
                            d={generateSparklinePath(sparkline)}
                            color={is7dNeg ? "#ef4444" : "#10b981"}
                          />
                        </svg>
                      </td>
                    </tr>
                  );
                })
              ) : (
                mockPortfolio.map((pos) => {
                  const coin = markets.find((m) => m.id === pos.coinId);
                  if (!coin) return null;
                  const val = coin.current_price * pos.amount;
                  const pl = val - pos.amount * pos.buyPrice;
                  const isProfit = pl >= 0;
                  return (
                    <tr
                      key={pos.id}
                      className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all font-mono"
                    >
                      <td className={tableCellClass}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-zinc-950 dark:text-zinc-100 tracking-tight">
                            {coin.name}
                          </span>
                          <span className="text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                            {coin.symbol.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100`}
                      >
                        {pos.amount}
                      </td>
                      <td
                        className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight`}
                      >
                        $
                        {val.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`px-6 py-5 text-right text-base font-black ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {isProfit ? "+" : "-"}$
                        {Math.abs(pl).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      <footer
        className={`relative z-10 border-t transition-colors duration-300 py-12 mt-auto text-[12px] font-mono tracking-[0.4em] uppercase
        ${
          theme === "dark"
            ? "border-white/[0.05] bg-black/60 text-zinc-500"
            : "border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur-md"
        }`}
      >
        <div className="max-w-5xl mx-auto px-10 flex justify-between items-center">
          <span>© {new Date().getFullYear()} OMNISIGHT_TERMINAL</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM_STATUS: STABLE
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
