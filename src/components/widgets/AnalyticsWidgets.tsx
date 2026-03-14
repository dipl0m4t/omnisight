import { useState, useEffect } from "react";
import { WidgetLoader, WidgetError } from "../ui/WidgetStates";

// ===============================
// 1. SMART CACHE & CUSTOM HOOK
// ===============================
interface CacheItem {
  data: any;
  timestamp: number;
}

const apiCache: Record<string, CacheItem> = {};
const CACHE_TTL = 60 * 1000; // 60 sec

export function useDashboardData() {
  const key = "main_dashboard";
  const [data, setData] = useState<any>(apiCache[key]?.data || null);
  const [isLoading, setIsLoading] = useState(!apiCache[key]);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const cached = apiCache[key];

    if (cached && now - cached.timestamp < CACHE_TTL) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    if (!data) setIsLoading(true);
    setIsError(false);

    fetch("http://localhost:3001/api/dashboard", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Dashboard API failed");
        return res.json();
      })
      .then((result) => {
        apiCache[key] = { data: result, timestamp: Date.now() };
        setData(result);
        setIsError(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(`[API Error - Dashboard]: `, err);
          if (!apiCache[key]) setIsError(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  return { data, isLoading, isError };
}

// ================================
// 2. UNIVERSAL WIDGET FRAMEWORK
// ================================
const WidgetCard = ({
  theme,
  title,
  value,
  denominator,
  status,
  colorClass,
  bgClass,
  isLoading,
  isError,
  action,
  className = "",
  valueSize = "text-5xl sm:text-5xl lg:text-6xl",
}: any) => {
  if (isLoading)
    return <WidgetLoader theme={theme} text={`LOADING ${title}...`} />;
  if (isError)
    return <WidgetError theme={theme} text={`${title} UNAVAILABLE`} />;

  return (
    <div
      className={`relative p-6 rounded-3xl border thick-glass overflow-hidden flex flex-col h-40 transition-all animate-content-reveal ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-zinc-200 bg-white/50"
      } ${className}`}
    >
      <div
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[64px] transition-colors duration-1000 pointer-events-none ${
          theme === "dark" ? "opacity-20" : "opacity-30"
        } ${bgClass}`}
      ></div>

      <div className="flex justify-between items-center z-10 w-full pr-2">
        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-300 z-10">
          {title}
        </p>
        {action && action}
      </div>

      <div className="flex items-stretch gap-3 z-10 mt-auto">
        <span
          className={`${valueSize} font-black tracking-tighter leading-none ${colorClass}`}
        >
          {value}
        </span>

        <div className="flex flex-col justify-between pt-1 sm:pt-1.5 pb-1 sm:pb-1.5 ">
          <span
            className={`text-2xl font-black opacity-40 leading-none ${colorClass}`}
          >
            {denominator}
          </span>
          <span
            className={`text-[13px] sm:text-sm font-black tracking-widest uppercase leading-none ${colorClass}`}
          >
            {status}
          </span>
        </div>
      </div>
    </div>
  );
};

// =============
// 3. WIDGETS
// =============

export const FearAndGreedWidget = ({ theme, data, isLoading }: any) => {
  const value = data ? parseInt(data.value) : 0;
  let colorClass = "text-zinc-500",
    bgClass = "bg-zinc-500";

  if (data) {
    if (value <= 24) {
      colorClass = "text-red-500";
      bgClass = "bg-red-500";
    } else if (value <= 46) {
      colorClass = "text-orange-500";
      bgClass = "bg-orange-500";
    } else if (value <= 52) {
      colorClass = "text-yellow-500";
      bgClass = "bg-yellow-500";
    } else {
      colorClass = "text-emerald-500";
      bgClass = "bg-emerald-500";
    }
  }

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title="Fear & Greed Index"
      value={data?.value}
      denominator="/ 100"
      status={data?.value_classification}
      colorClass={colorClass}
      bgClass={bgClass}
      className="md:col-span-5 lg:col-span-5"
    />
  );
};

export const MarketCapWidget = ({ theme, data, isLoading }: any) => {
  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title="Total Market Cap"
      value={`$${data?.total || "0"}`}
      denominator="Trillion"
      status={`Vol 24H: $${data?.volume24h || "0"}B`}
      colorClass="text-blue-500"
      bgClass="bg-blue-500"
      className="md:col-span-7 lg:col-span-7"
    />
  );
};

export const DominanceWidget = ({ theme, data, isLoading }: any) => {
  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title="Market Dominance"
      value={data?.btc || "0"}
      denominator="% BTC"
      status={`ETH: ${data?.eth || "0"}% | OTH: ${data?.others || "0"}%`}
      colorClass="text-orange-500"
      bgClass="bg-orange-500"
      className="md:col-span-8 lg:col-span-8"
    />
  );
};

export const OpenInterestWidget = ({
  theme,
  data,
  isLoading,
  className,
}: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCoin = data ? data[currentIndex] : null;

  const handleNext = () => {
    if (data) setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const SwitchButton =
    data && data.length > 1 ? (
      <button
        onClick={handleNext}
        className={`px-2.5 py-1 rounded-lg text-[12px] thick-glass font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-zinc-200" : "bg-black/5 hover:bg-black/10 text-zinc-600"}`}
      >
        NEXT <span>➔</span>
      </button>
    ) : null;

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title={`${currentCoin?.symbol || "BTC"} Open Interest`}
      action={SwitchButton}
      value={`$${currentCoin?.oi || "0"}`}
      denominator="Billion"
      status="HYPERLIQUID PERPS"
      colorClass="text-purple-500"
      bgClass="bg-purple-500"
      className={`md:col-span-7 lg:col-span-7 ${className}`}
    />
  );
};

export const BtcFundingWidget = ({
  theme,
  data,
  isLoading,
  className,
}: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCoin = data ? data[currentIndex] : null;
  const rate = currentCoin ? parseFloat(currentCoin.rate) : 0;

  const isLongHeavy = rate > 0;
  const colorClass = isLongHeavy ? "text-emerald-500" : "text-red-500";
  const bgClass = isLongHeavy ? "bg-emerald-500" : "bg-red-500";
  const displayRate = currentCoin ? Math.abs(rate).toFixed(4) : "0.0000";

  const handleNext = () => {
    if (data) setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const SwitchButton =
    data && data.length > 1 ? (
      <button
        onClick={handleNext}
        className={`px-2.5 py-1 rounded-lg text-[12px] thick-glass font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${theme === "dark" ? "bg-white/10 hover:bg-white/20 text-zinc-200" : "bg-black/5 hover:bg-black/10 text-zinc-600"}`}
      >
        NEXT <span>➔</span>
      </button>
    ) : null;

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title={`${currentCoin?.symbol || "BTC"} Funding Rate`}
      action={SwitchButton}
      value={`${isLongHeavy ? "+" : "-"}${displayRate}`}
      denominator="%"
      status={`PRICE: $${currentCoin?.markPx || 0}`}
      colorClass={colorClass}
      bgClass={bgClass}
      className={`md:col-span-8 lg:col-span-8 ${className}`}
    />
  );
};

export const BtcFeesWidget = ({ theme, data, isLoading }: any) => {
  const fastest = data ? data.fastestFee : 0;
  const economy = data ? data.economyFee : 0;
  const colorClass =
    fastest > 50
      ? "text-red-500"
      : fastest > 20
        ? "text-yellow-500"
        : "text-emerald-500";
  const bgClass =
    fastest > 50
      ? "bg-red-500"
      : fastest > 20
        ? "bg-yellow-500"
        : "bg-emerald-500";

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title="BTC Network Fees"
      value={fastest}
      denominator="sat/vB"
      status={`ECONOMY: ${economy}`}
      colorClass={colorClass}
      bgClass={bgClass}
      className="md:col-span-5 lg:col-span-5"
    />
  );
};

export const TrendingWidget = ({ theme, data, isLoading }: any) => {
  const isPositive = data && data.isPositive;
  const colorClass = isPositive ? "text-emerald-500" : "text-red-500";
  const bgClass = isPositive ? "bg-emerald-500" : "bg-red-500";

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title="#1 Trending Coin"
      value={data?.symbol || "..."}
      denominator=""
      status={`24H: ${isPositive ? "+" : ""}${data?.change24h || "0"}%`}
      colorClass={colorClass}
      bgClass={bgClass}
      className="md:col-span-10 lg:col-span-10"
    />
  );
};

export const DefiWidget = ({ theme, data, isLoading }: any) => {
  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={!data && !isLoading}
      title="DeFi Market Cap"
      value={`$${data?.mcap || "0"}`}
      denominator="Billion"
      status={`TOP: ${data?.topCoin || "..."}`}
      colorClass="text-cyan-500"
      bgClass="bg-cyan-500"
      className="md:col-span-10 lg:col-span-10"
    />
  );
};
