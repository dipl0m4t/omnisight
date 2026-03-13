import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WidgetLoader, WidgetError } from "./ui/WidgetStates";

export const StablecoinWidget = ({
  theme,
  data,
  isLoading,
  className,
}: {
  theme: string;
  data: any;
  isLoading: boolean;
  className?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading)
    return <WidgetLoader theme={theme} text="LOADING LIQUIDITY..." />;
  if (!data)
    return <WidgetError theme={theme} text="STABLECOINS API UNAVAILABLE" />;

  const isPositive = Number(data.changePercent) >= 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-xl border thick-glass text-xs font-bold tracking-wider ${theme === "dark" ? "bg-zinc-900/90 border-white/10 text-white" : "bg-white/90 border-zinc-200 text-zinc-900"}`}
        >
          <p className="opacity-70 mb-2 uppercase">DATE: {label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            return (
              <p key={index} className={"text-emerald-500"}>
                MCAP: ${Number(payload[0].value).toFixed(2)}B
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className={`relative p-4 sm:p-6 rounded-[24px] border thick-glass flex flex-col transition-all duration-300 ${className} ${theme === "dark" ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white/50"}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between z-10">
        {/* Left: Titles */}
        <div className="flex flex-col">
          <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-300">
            Stablecoin Market Cap
          </p>
          <p className="text-[10px] sm:text-[12px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-0.5">
            30-Day Liquidity Trend
          </p>
        </div>

        {/* Right: Stats & Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Badge */}
          <div
            className={`flex-1 sm:flex-none flex items-center justify-between sm:justify-center gap-2 sm:gap-3 px-3 py-2 text-[10px] sm:text-[12px] font-black tracking-tighter sm:tracking-[0.1em] transition-all border uppercase rounded-xl backdrop-blur-2xl whitespace-nowrap
            ${theme === "dark" ? "border-white/10 bg-zinc-900/40 text-white/90" : "border-zinc-200 bg-white/80 text-zinc-800"}`}
          >
            <div className="flex items-center gap-1.5">
              <span className={theme === "dark" ? "text-white" : "text-black"}>
                ${data.currentCap}B
              </span>
              <span className="opacity-20">|</span>
              <span className="opacity-60">30D:</span>
            </div>
            <span
              className={`px-1.5 py-0.5 rounded-md ${isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}
            >
              {isPositive ? "↑" : "↓"} {data.changePercent}%
            </span>
          </div>

          {/* Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex-shrink-0 p-2.5 rounded-full border thick-glass active:scale-90 transition-transform cursor-pointer ${theme === "dark" ? "bg-black/20 border-white/10" : "bg-white/40 border-zinc-200"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[400px] opacity-100 mt-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="h-[250px] w-full relative z-10">
          {isExpanded && (
            <ResponsiveContainer width="99%" height="100%">
              <AreaChart
                data={data.chartData}
                margin={{ top: 10, right: 5, left: 5, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide={true} />
                <YAxis
                  domain={[(dataMin: number) => dataMin * 0.999, "dataMax"]}
                  hide={true}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{
                    stroke:
                      theme === "dark"
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.1)",
                    strokeWidth: 1,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Background Light */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full rounded-full blur-[100px] pointer-events-none transition-opacity duration-1000 ${isExpanded ? "opacity-100" : "opacity-0"} ${theme === "dark" ? "bg-indigo-500/5" : "bg-indigo-500/10"}`}
      ></div>
    </div>
  );
};
