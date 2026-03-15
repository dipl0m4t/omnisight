import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const LiquidationMapWidget = ({
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

  // Intercept raw data and turn it into buckets
  const chartData = useMemo(() => {
    if (!data || (!data.bids && !data.asks)) return [];

    const bucketSize = 10;
    const buckets: Record<
      string,
      { price: number; bidsVol: number; asksVol: number }
    > = {};

    const processOrders = (orders: any[], type: "bids" | "asks") => {
      orders.forEach((order) => {
        const price = parseFloat(order[0]);
        const vol = parseFloat(order[1]) * price; // Объем в долларах
        const bucketPrice = Math.round(price / bucketSize) * bucketSize;

        if (!buckets[bucketPrice]) {
          buckets[bucketPrice] = {
            price: bucketPrice,
            bidsVol: 0,
            asksVol: 0,
          };
        }

        if (type === "bids") {
          buckets[bucketPrice].bidsVol += vol; // Green (Support)
        } else {
          buckets[bucketPrice].asksVol += vol; // Red (Resistance)
        }
      });
    };

    if (data.bids) processOrders(data.bids, "bids");
    if (data.asks) processOrders(data.asks, "asks");

    return Object.values(buckets).sort((a, b) => a.price - b.price);
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-3 rounded-xl border thick-glass text-xs font-bold tracking-wider ${theme === "dark" ? "bg-zinc-900/90 border-white/10 text-white" : "bg-white/90 border-zinc-200 text-zinc-900"}`}
        >
          <p className="opacity-70 mb-2">
            PRICE LEVEL: ${label.toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === 0) return null;
            const isBids = entry.dataKey === "bidsVol";
            return (
              <p
                key={index}
                className={isBids ? "text-emerald-500" : "text-red-500"}
              >
                {isBids ? "BUY WALL: " : "SELL WALL: "}$
                {(entry.value / 1e6).toFixed(2)}M
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
      className={`relative p-6 sm:p-6 rounded-[24px] border thick-glass flex flex-col transition-colors duration-300 ${className} ${theme === "dark" ? "border-white/10 bg-zinc-900/40" : "border-zinc-200 bg-white/50"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start z-10">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-300">
            Order Book Liquidity Map
          </p>
          <p className="text-[12px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mt-1">
            BTCUSDT • Spot Depth Clustered
          </p>
        </div>

        <div className="flex items-center gap-4">
          {isExpanded && (
            <div className="hidden sm:flex gap-4 mr-4 animate-fade-in">
              <span className="text-[13px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Asks
              </span>
              <span className="text-[13px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>{" "}
                Bids
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
          <div className="h-[300px] w-full relative z-10">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center">
                <span className="animate-pulse text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                  Mapping Liquidity...
                </span>
              </div>
            ) : (
              isExpanded && (
                <ResponsiveContainer
                  width="99%"
                  height={300}
                  minWidth={1}
                  minHeight={1}
                >
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 0, bottom: 0, left: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke={
                        theme === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.05)"
                      }
                    />

                    <XAxis
                      dataKey="price"
                      tickFormatter={(val) => `$${val.toLocaleString()}`}
                      stroke={
                        theme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)"
                      }
                      tick={{
                        fontSize: 10,
                        fill: "#71717a",
                        fontWeight: "bold",
                      }}
                      tickMargin={10}
                      minTickGap={30}
                    />

                    <YAxis
                      tickFormatter={(val) =>
                        val >= 1000000
                          ? `${(val / 1000000).toFixed(1)}M`
                          : `${(val / 1000).toFixed(0)}k`
                      }
                      stroke={
                        theme === "dark"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.2)"
                      }
                      tick={{
                        fontSize: 10,
                        fill: "#71717a",
                        fontWeight: "bold",
                      }}
                      tickMargin={10}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        fill:
                          theme === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                      }}
                    />

                    <Bar
                      isAnimationActive={false}
                      dataKey="bidsVol"
                      stackId="a"
                      fill="#10b981"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={60}
                    />
                    <Bar
                      isAnimationActive={false}
                      dataKey="asksVol"
                      stackId="a"
                      fill="#ef4444"
                      radius={[0, 0, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )
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
