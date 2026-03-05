import { useMemo } from "react";
// 1. Исправляем импорт типов (добавили type)
import type { PortfolioItem, MarketRow } from "../types/crypto";

interface PortfolioSummaryProps {
  portfolio: PortfolioItem[];
  marketMap: Map<string, MarketRow>;
  theme: string;
}

export const PortfolioSummary = ({
  portfolio,
  marketMap,
  theme,
}: PortfolioSummaryProps) => {
  const { totalBalance, totalPnL, percentagePnL, totalSparkline } =
    useMemo(() => {
      let balance = 0;
      let inv = 0;
      const sparklineArray = new Array(168).fill(0);

      portfolio.forEach((pos) => {
        const coin = marketMap.get(pos.coinId);
        if (!coin) return;
        balance += coin.current_price * pos.amount;
        inv += (pos.buyPrice || 0) * pos.amount;

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

      const pnl = balance - inv;
      const pnlPercent = inv > 0 ? (pnl / inv) * 100 : 0;
      return {
        totalBalance: balance,
        totalPnL: pnl,
        percentagePnL: pnlPercent,
        totalSparkline: sparklineArray,
      };
    }, [portfolio, marketMap]);

  // 2. Расчет координат для тонкой линии (убрали width/height)
  const isPositive = totalPnL >= 0;

  // Отрисовка сглаженного графика (Bezier)
  const points = useMemo(() => {
    const max = Math.max(...totalSparkline);
    const min = Math.min(...totalSparkline);
    const range = max - min || 1;
    // Оставляем всего 5% отступа сверху и снизу, чтобы график не «сплющивало»
    return totalSparkline.map((v, i) => ({
      x: (i / 167) * 100,
      y: 95 - ((v - min) / range) * 90,
    }));
  }, [totalSparkline]);

  // Генерируем путь. Сделаем изгибы чуть более «натянутыми», чтобы не было ощущения «глиста»
  const pathD = points.reduce((acc, p, i, a) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = a[i - 1];
    const cpX = prev.x + (p.x - prev.x) / 2;
    return `${acc} C ${cpX},${prev.y} ${cpX},${p.y} ${p.x},${p.y}`;
  }, "");

  const color = isPositive ? "#10b981" : "#ef4444";

  return (
    <div
      className={`
      p-6 rounded-2xl border backdrop-blur-md shadow-xl transition-all duration-300 thick-glass
      ${theme === "dark" ? "bg-slate-900/40 border-white/10 text-white" : "bg-white/60 border-slate-200 text-slate-900"}
    `}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] pb-2 text-zinc-600 dark:text-zinc-300 text-left cursor-default">
            Total Balance
          </p>
          <div className="flex items-baseline gap-3">
            {/* 3. Добавили 'en-US' для запятой и font-mono для стиля */}
            <h2 className="text-3xl font-black font-mono tracking-normal cursor-default">
              $
              {totalBalance.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            <span
              className={`cursor-default text-lg font-bold font-sans ${isPositive ? "text-emerald-500" : "text-red-500"}`}
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
        <div
          className={`
                flex items-center justify-center w-12 h-10 text-sm font-black transition-all 
                border uppercase shadow-xl cursor-default rounded-2xl backdrop-blur-2xl py-5
                ${
                  theme === "dark"
                    ? "border-white/10 bg-slate-800/60 text-white/90"
                    : "border-slate-200 bg-white/80 text-slate-700"
                }
            `}
        >
          7D
        </div>
      </div>

      {/* 4. Улучшенный график */}
      <div className="h-65 w-full relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
              {/* Уменьшили прозрачность заливки до 0.1, чтобы она едва мерцала */}
              <stop offset="0%" stopColor={color} stopOpacity="0.1" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Заливка */}
          <path d={`${pathD} L 100 100 L 0 100 Z`} fill="url(#chartFade)" />

          {/* Основная линия: тонкая (1.0) и с нескалируемым эффектом */}
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="3"
            style={{ vectorEffect: "non-scaling-stroke" }} // Магия для изящности
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};
