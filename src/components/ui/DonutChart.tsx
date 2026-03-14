import { useMemo } from "react";

export const DonutChart = ({ portfolio, marketMap, theme }: any) => {
  const data = useMemo(() => {
    // Count general value and data for shares
    let totalValue = 0;
    const assets = portfolio.map((item: any) => {
      const price = marketMap.get(item.coinId)?.current_price || 0;
      const value = item.amount * price;
      totalValue += value;
      return { symbol: item.coinId, value };
    });

    // Calculating angles for SVG
    let cumulativePercent = 0;
    return assets.map((asset: any) => {
      const percent = (asset.value / totalValue) * 100;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;
      return { ...asset, percent, startPercent };
    });
  }, [portfolio, marketMap]);

  // SVG Settings
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex items-center justify-center h-[180px] w-full animate-content-reveal">
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
        {data.map((asset: any, i: number) => {
          const strokeDasharray = `${(asset.percent * circumference) / 100} ${circumference}`;
          const strokeDashoffset = `${-(asset.startPercent * circumference) / 100}`;

          // Simple colors palette
          const colors = [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#8b5cf6",
            "#ec4899",
          ];
          const color = colors[i % colors.length];

          return (
            <circle
              key={asset.symbol}
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out hover:opacity-80 cursor-pointer"
            >
              <title>
                {asset.symbol.toUpperCase()}: {asset.percent.toFixed(1)}%
              </title>
            </circle>
          );
        })}
      </svg>

      {/* Legend (list of coins on the right) */}
      <div className="flex flex-col gap-2 ml-6 font-mono text-[14px] font-bold uppercase tracking-widest">
        {data.slice(0, 5).map((asset: any, i: number) => (
          <div key={asset.symbol} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "#10b981",
                  "#3b82f6",
                  "#f59e0b",
                  "#8b5cf6",
                  "#ec4899",
                ][i % 5],
              }}
            />
            <span
              className={theme === "dark" ? "text-zinc-400" : "text-zinc-600"}
            >
              {asset.symbol}: {asset.percent.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
