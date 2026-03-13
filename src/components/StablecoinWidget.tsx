import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const StablecoinWidget = ({
  theme,
  className,
}: {
  theme: string;
  className?: string;
}) => {
  const [data, setData] = useState<{
    currentCap: string;
    changePercent: string;
    chartData: any[];
  } | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchStablecoins = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/stablecoins");
        const json = await res.json();

        if (json.error) throw new Error(json.error);

        setData(json);
      } catch (error) {
        console.error("Failed to fetch stablecoins", error);
      }
    };

    fetchStablecoins();
    const interval = setInterval(fetchStablecoins, 1800000);
    return () => clearInterval(interval);
  }, []);

  const isPositive = data ? Number(data.changePercent) >= 0 : true;

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
      className={`relative p-6 rounded-[24px] border thick-glass flex flex-col transition-colors duration-300 ${className} ${theme === "dark" ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white/50"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-300">
            Stablecoin Market Cap
          </p>
          <p className="text-[12px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-1">
            30-Day Liquidity Trend
          </p>
        </div>

        <div className="flex items-center gap-4">
          {data && (
            <div
              className={`flex items-center gap-3 justify-center px-3 py-2 text-[13px] font-black tracking-[0.15em] transition-all border uppercase shadow-sm cursor-default rounded-xl backdrop-blur-2xl 
              ${theme === "dark" ? "border-white/10 bg-zinc-900/10 text-white/90" : "border-zinc-200 bg-white/80 text-zinc-800"}`}
            >
              <span
                className={`font-black ${theme === "dark" ? "text-white" : "text-black"}`}
              >
                ${data.currentCap}B
              </span>
              <span
                className={`font-black ${theme === "dark" ? "text-white" : "text-black"}`}
              >
                |
              </span>
              <span
                className={`font-black ${theme === "dark" ? "text-white" : "text-black"}`}
              >
                30D:
              </span>
              <span
                className={`font-black px-2 py-0.5 rounded-md ${isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}
              >
                {isPositive ? "↑" : "↓"} {data.changePercent}%
              </span>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex p-3 rounded-2xl border thick-glass active:scale-90 hover:brightness-110 rounded-full cursor-pointer ${theme === "dark" ? "bg-black/20 border-white/10" : "bg-white/40 border-slate-200"}`}
            title={isExpanded ? "Hide Chart" : "Show Chart"}
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
              className={`transition-transform duration-300 ${isExpanded ? "" : "rotate-180"}`}
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100 mt-6"
            : "grid-rows-[0fr] opacity-0 mt-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="h-[250px] w-full relative z-10">
            {!data ? (
              <div className="h-full w-full flex items-center justify-center">
                <span className="animate-pulse text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Loading Liquidity...
                </span>
              </div>
            ) : (
              /* AREA CHART */
              <ResponsiveContainer width="100%" minHeight={250}>
                {/* Добавили margin top, чтобы пики не обрезались сверху */}
                <AreaChart
                  data={data.chartData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  {/* Магия градиента */}
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="date" hide={true} />

                  {/* Магия отступа снизу: пол будет на 1% ниже минимальной точки */}
                  <YAxis
                    domain={[(dataMin: number) => dataMin * 0.99, "dataMax"]}
                    hide={true}
                  />

                  <Tooltip
                    content={<CustomTooltip />}
                    // В AreaChart курсор — это линия (stroke), а не прямоугольник (fill). Сделаем её пунктирной!
                    cursor={{
                      stroke:
                        theme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorValue)" // Применяем наш градиент
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* BG Light */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full rounded-full blur-[100px] pointer-events-none transition-all duration-1000 ${
          isExpanded ? "opacity-100" : "opacity-0"
        } ${theme === "dark" ? "bg-indigo-500/5" : "bg-indigo-500/10"}`}
      ></div>
    </div>
  );
};
