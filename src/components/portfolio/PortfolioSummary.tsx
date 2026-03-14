import { useMemo, useState } from "react";
import type { PortfolioItem, MarketRow } from "../../types/crypto";

interface PortfolioSummaryProps {
  portfolio: PortfolioItem[];
  marketMap: Map<string, MarketRow>;
  theme: string;
}

// === DONUT CHART ===
const DonutChart = ({ data }: { data: any[] }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around h-full w-full animate-content-reveal gap-12 px-4 py-6">
      {/* SVG Circle */}
      <div className="relative w-64 h-64 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full -rotate-90 overflow-visible"
        >
          {data.map((asset) => {
            const strokeDasharray = `${(asset.percent * circumference) / 100} ${circumference}`;
            const strokeDashoffset = `${-(asset.startPercent * circumference) / 100}`;
            return (
              <circle
                key={asset.symbol}
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke={asset.color}
                strokeWidth="15"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 12px ${asset.color}55)` }}
              />
            );
          })}
        </svg>
        {/* Circle center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 pb-1">
            Allocation
          </span>
          <span className="text-3xl font-black">{data.length} Assets</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-4 flex-1 max-w-xs">
        {data.slice(0, 6).map((asset) => (
          <div
            key={asset.symbol}
            className="flex items-center justify-between gap-6 font-mono border-b border-zinc-100 dark:border-white/[0.03] pb-2"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3.5 h-3.5 rounded-md shadow-lg"
                style={{ backgroundColor: asset.color }}
              />
              <span className="text-sm font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                {asset.symbol}
              </span>
            </div>
            <span className="text-base font-black text-zinc-950 dark:text-white">
              {asset.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PortfolioSummary = ({
  portfolio,
  marketMap,
  theme,
}: PortfolioSummaryProps) => {
  const [activeView, setActiveView] = useState<"chart" | "distribution">(
    "chart",
  );
  const [isChartOpen, setIsChartOpen] = useState(false);

  const {
    totalBalance,
    totalPnL,
    percentagePnL,
    totalSparkline,
    distributionData,
  } = useMemo(() => {
    let balance = 0;
    let inv = 0;
    const sparklineArray = new Array(168).fill(0);
    const assetValues: { symbol: string; value: number }[] = [];

    portfolio.forEach((pos) => {
      const coin = marketMap.get(pos.coinId);
      if (!coin) return;

      const currentVal = coin.current_price * pos.amount;
      balance += currentVal;
      inv += (pos.buyPrice || 0) * pos.amount;

      assetValues.push({
        symbol: coin.symbol.toUpperCase(),
        value: currentVal,
      });

      if (coin.sparkline_in_7d?.price) {
        const prices = coin.sparkline_in_7d.price;
        const offset = 168 - prices.length;
        for (let i = 0; i < prices.length; i++) {
          const targetIndex = i + offset;
          if (targetIndex >= 0 && targetIndex < 168) {
            sparklineArray[targetIndex] += prices[i] * pos.amount;
          }
        }
      }
    });

    const colors = [
      "#10b981",
      "#3b82f6",
      "#f59e0b",
      "#8b5cf6",
      "#ec4899",
      "#06b6d4",
      "#f97316",
    ];
    let cumulativePercent = 0;
    const distribution = assetValues
      .sort((a, b) => b.value - a.value)
      .map((asset, i) => {
        const percent = balance > 0 ? (asset.value / balance) * 100 : 0;
        const startPercent = cumulativePercent;
        cumulativePercent += percent;
        return {
          ...asset,
          percent,
          startPercent,
          color: colors[i % colors.length],
        };
      });

    return {
      totalBalance: balance,
      totalPnL: balance - inv,
      percentagePnL: inv > 0 ? ((balance - inv) / inv) * 100 : 0,
      totalSparkline: sparklineArray,
      distributionData: distribution,
    };
  }, [portfolio, marketMap]);

  const isPositive = totalPnL >= 0;
  const color = isPositive ? "#10b981" : "#ef4444";

  // Bezier Chart
  const points = useMemo(() => {
    const max = Math.max(...totalSparkline);
    const min = Math.min(...totalSparkline);
    const range = max - min || 1;
    return totalSparkline.map((v, i) => ({
      x: (i / 167) * 100,
      y: 95 - ((v - min) / range) * 90,
    }));
  }, [totalSparkline]);

  const pathD = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cpX = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
  }, "");

  return (
    <div
      className={`p-8 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 thick-glass ${theme === "dark" ? "bg-zinc-900/40 border-white/10 " : "bg-white/50 border-zinc-200 text-slate-900"}`}
    >
      <div
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-all duration-300 ${isChartOpen ? "mb-8" : "mb-2"}`}
      >
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] pb-2 text-zinc-600 dark:text-zinc-300 text-left cursor-default">
            Total Balance
          </p>
          <div className="flex items-baseline gap-4">
            <h2 className="text-4xl font-black font-mono tracking-tight cursor-default">
              $
              {totalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            <span
              className={`cursor-default text-xl font-bold font-sans ${isPositive ? "text-emerald-500" : "text-red-500"}`}
            >
              {isPositive ? "+" : "-"}$
              {Math.abs(totalPnL).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              ({percentagePnL.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Performance/Assets Switch + 7D tag */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isChartOpen && (
            <>
              <div
                className={`flex p-1 rounded-2xl border thick-glass ${theme === "dark" ? "bg-black/20 border-white/10" : "bg-white/40 border-slate-200"}`}
              >
                <button
                  onClick={() => setActiveView("chart")}
                  className={`px-5 py-2.5 text-[12px] font-black uppercase tracking-widest transition-all rounded-xl cursor-pointer ${activeView === "chart" ? (theme === "dark" ? "bg-white/10 text-white shadow-lg" : "bg-white text-black shadow-md") : "text-zinc-500"}`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveView("distribution")}
                  className={`px-5 py-2.5 text-[12px] font-black uppercase tracking-widest transition-all rounded-xl cursor-pointer ${activeView === "distribution" ? (theme === "dark" ? "bg-white/10 text-white shadow-lg" : "bg-white text-black shadow-md") : "text-zinc-500"}`}
                >
                  Assets
                </button>
              </div>
              <div
                className={`flex items-center justify-center px-5 py-3 text-[13px] font-black tracking-widest transition-all border uppercase shadow-sm cursor-default rounded-2xl backdrop-blur-2xl ${theme === "dark" ? "border-white/10 bg-zinc-900/10 text-white/90" : "border-zinc-200 bg-white/80 text-zinc-800"}`}
              >
                7d Chart
              </div>
            </>
          )}
          <button
            onClick={() => setIsChartOpen(!isChartOpen)}
            className={`flex p-3 rounded-2xl border thick-glass active:scale-90 hover:brightness-110 rounded-full cursor-pointer ${theme === "dark" ? "bg-black/20 border-white/10" : "bg-white/40 border-slate-200"}`}
            title={isChartOpen ? "Hide Chart" : "Show Chart"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isChartOpen ? "" : "rotate-180"}`}
            >
              {/* Arrow icon */}
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isChartOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="h-80 w-full relative flex items-center justify-center overflow-visible">
            {activeView === "chart" ? (
              <>
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="w-full h-full overflow-visible animate-content-reveal"
                >
                  <defs>
                    <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity="0.1" />
                      <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`${pathD} L 100 100 L 0 100 Z`}
                    fill="url(#chartFade)"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={color}
                    strokeWidth="3"
                    style={{ vectorEffect: "non-scaling-stroke" }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            ) : (
              <DonutChart data={distributionData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
