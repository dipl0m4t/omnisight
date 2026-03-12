import { useState, useEffect } from "react";

// ===============================================
// 1. SMART CACHE & CUSTOM HOOK (SWR Pattern)
// ===============================================
interface CacheItem {
  data: any;
  timestamp: number;
}

const apiCache: Record<string, CacheItem> = {};
const CACHE_TTL = 60 * 1000; // 60 sec

function useCachedApi(
  key: string,
  fetcher: (signal: AbortSignal) => Promise<any>,
) {
  // Initialize the state from the cache (if it's there)
  const [data, setData] = useState<any>(apiCache[key]?.data || null);
  // Call the loader ONLY if we don't have cache at all
  const [isLoading, setIsLoading] = useState(!apiCache[key]);
  // State for the errors
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const cached = apiCache[key];

    // CACHE CHECK: If there is data and it's < 60 sec old, hang up and don't download anything
    if (cached && now - cached.timestamp < CACHE_TTL) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    if (!data) setIsLoading(true); // Show the loader ONLY if we don't have any old data
    setIsError(false);

    // FETCHER CALL: loading logic
    fetcher(controller.signal)
      .then((result) => {
        // Save the result and CURRENT TIME in the cache
        apiCache[key] = { data: result, timestamp: Date.now() };
        setData(result);
        setIsError(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(`[API Error - ${key}]: `, err);
          // Show the error ONLY if we don't have any old data
          if (!apiCache[key]) setIsError(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [key]); // Hook will only restart if the key changes

  // The hook returns 3 things that widget needs to render
  return { data, isLoading, isError };
}

// ===============================================
// 2. UNIVERSAL WIDGET FRAMEWORK
// ===============================================
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
  return (
    <div
      className={`relative p-6 rounded-3xl border thick-glass overflow-hidden flex flex-col h-40 transition-all animate-content-reveal ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-zinc-200 bg-white/50"
      } ${className}`}
    >
      {isError ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10 opacity-80">
          <span className="text-red-500 font-black tracking-widest uppercase text-sm mb-1 animate-pulse">
            API Offline
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Connection Failed
          </span>
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex items-center justify-center z-10">
          <span className="animate-pulse text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Calibrating...
          </span>
        </div>
      ) : (
        <>
          <div
            className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-[64px] transition-colors duration-1000 pointer-events-none ${
              theme === "dark" ? "opacity-20" : "opacity-30"
            } ${bgClass}`}
          ></div>

          <div className="flex justify-between items-center z-10 w-full pr-2">
            <p className="text-[13px] sm:text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 z-10">
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
                className={`text-[13px] sm:text-xs font-bold tracking-widest uppercase leading-none ${colorClass}`}
              >
                {status}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ===============================================
// 2. WIDGETS
// ===============================================

export const FearAndGreedWidget = ({ theme }: { theme: string }) => {
  const { data, isLoading, isError } = useCachedApi("fng", async (signal) => {
    const res = await fetch("https://api.alternative.me/fng/", { signal });
    if (!res.ok) throw new Error("API failed");
    const json = await res.json();
    return json.data[0];
  });

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
      isError={isError}
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

export const MarketCapWidget = ({ theme }: { theme: string }) => {
  const { data, isLoading, isError } = useCachedApi(
    "global",
    async (signal) => {
      const res = await fetch("https://api.coingecko.com/api/v3/global", {
        signal,
      });
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      return json.data;
    },
  );

  const mcap = data ? (data.total_market_cap.usd / 1e12).toFixed(2) : "0";
  const vol = data ? (data.total_volume.usd / 1e9).toFixed(0) : "0";

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={isError}
      title="Total Market Cap"
      value={`$${mcap}`}
      denominator="Trillion"
      status={`Vol 24H: $${vol}B`}
      colorClass="text-blue-500"
      bgClass="bg-blue-500"
      className="md:col-span-7 lg:col-span-7"
    />
  );
};

export const DominanceWidget = ({ theme }: { theme: string }) => {
  const { data, isLoading, isError } = useCachedApi(
    "global_dom",
    async (signal) => {
      const res = await fetch("https://api.coingecko.com/api/v3/global", {
        signal,
      });
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      return json.data.market_cap_percentage;
    },
  );

  const btc = data ? data.btc.toFixed(1) : "0";
  const eth = data ? data.eth.toFixed(1) : "0";
  const others = data ? (100 - data.btc - data.eth).toFixed(1) : "0";

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={isError}
      title="Market Dominance"
      value={btc}
      denominator="% BTC"
      status={`ETH: ${eth}% | OTH: ${others}%`}
      colorClass="text-orange-500"
      bgClass="bg-orange-500"
      className="md:col-span-8 lg:col-span-8"
    />
  );
};

export const OpenInterestWidget = ({
  theme,
  className,
}: {
  theme: string;
  className?: string;
}) => {
  // 1. State for switching (starting from index 0)
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, isError } = useCachedApi(
    "hyperliquid_oi",
    async (signal) => {
      const res = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metaAndAssetCtxs" }),
        signal,
      });
      if (!res.ok) throw new Error("API failed");
      const j = await res.json();

      // 2. The list of coins that we want to scroll
      const targetCoins = ["BTC", "ETH", "SOL", "HYPE", "DOGE", "SUI"];
      const results: any[] = [];

      targetCoins.forEach((coinName) => {
        const idx = j[0].universe.findIndex((u: any) => u.name === coinName);
        if (idx !== -1) {
          results.push({
            symbol: coinName,
            oi:
              parseFloat(j[1][idx].openInterest) * parseFloat(j[1][idx].markPx),
          });
        }
      });

      // Return the ARRAY of objects: [{symbol: "BTC", oi: 1.8}, {symbol: "ETH", oi: 0.5}, ...]
      return results;
    },
  );

  // 3. Choose current coin from the array
  const currentCoin = data ? data[currentIndex] : null;
  const oiFormatted = currentCoin ? (currentCoin.oi / 1e9).toFixed(2) : "0";

  // 4. Coin switching function
  const handleNext = () => {
    if (data) {
      // Modular arithmetic: if we reach the end of the array, we return to 0
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }
  };

  const SwitchButton =
    data && data.length > 1 ? (
      <button
        onClick={handleNext}
        className={`px-2.5 py-1 rounded-lg text-[10px] thick-glass font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
          theme === "dark"
            ? "bg-white/10 hover:bg-white/20 text-white"
            : "bg-black/5 hover:bg-black/10 text-black"
        }`}
      >
        NEXT <span>➔</span>
      </button>
    ) : null;

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={isError}
      title={`${currentCoin?.symbol || "BTC"} Open Interest`}
      action={SwitchButton}
      value={`$${oiFormatted}`}
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
  className,
}: {
  theme: string;
  className?: string;
}) => {
  // 1. State for switching
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading, isError } = useCachedApi(
    "hyperliquid_funding",
    async (signal) => {
      const res = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "metaAndAssetCtxs" }),
        signal,
      });
      if (!res.ok) throw new Error("API failed");
      const j = await res.json();

      // 2. Coins search
      const targetCoins = ["BTC", "ETH", "SOL", "HYPE", "DOGE", "SUI"];
      const results: any[] = [];

      targetCoins.forEach((coinName) => {
        const idx = j[0].universe.findIndex((u: any) => u.name === coinName);
        if (idx !== -1) {
          results.push({
            symbol: coinName,
            rate: parseFloat(j[1][idx].funding) * 100,
            markPx: parseFloat(j[1][idx].markPx).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            }),
          });
        }
      });
      return results;
    },
  );

  // 3. Take the current coin
  const currentCoin = data ? data[currentIndex] : null;
  const rate = currentCoin ? currentCoin.rate : 0;

  const isLongHeavy = rate > 0;
  const colorClass = isLongHeavy ? "text-emerald-500" : "text-red-500";
  const bgClass = isLongHeavy ? "bg-emerald-500" : "bg-red-500";
  const displayRate = currentCoin ? Math.abs(rate).toFixed(4) : "0.0000";

  // 4. Button logic
  const handleNext = () => {
    if (data) setCurrentIndex((prev) => (prev + 1) % data.length);
  };

  const SwitchButton =
    data && data.length > 1 ? (
      <button
        onClick={handleNext}
        className={`px-2.5 py-1 rounded-lg text-[10px] thick-glass font-black cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 ${
          theme === "dark"
            ? "bg-white/10 hover:bg-white/20 text-white"
            : "bg-black/5 hover:bg-black/10 text-black"
        }`}
      >
        NEXT <span>➔</span>
      </button>
    ) : null;

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={isError}
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

export const BtcFeesWidget = ({ theme }: { theme: string }) => {
  const { data, isLoading, isError } = useCachedApi("fees", async (signal) => {
    const res = await fetch("https://mempool.space/api/v1/fees/recommended", {
      signal,
    });
    if (!res.ok) throw new Error("API failed");
    return res.json();
  });

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
      isError={isError}
      title="BTC Network Fees"
      value={fastest}
      denominator="sat/vB"
      status={`ECONOMY: ${economy} SAT/VB`}
      colorClass={colorClass}
      bgClass={bgClass}
      className="md:col-span-5 lg:col-span-5"
    />
  );
};

export const TrendingWidget = ({ theme }: { theme: string }) => {
  const { data, isLoading, isError } = useCachedApi(
    "trending",
    async (signal) => {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/search/trending",
        { signal },
      );
      if (!res.ok) throw new Error("API failed");
      const json = await res.json();
      return json.coins[0].item;
    },
  );

  const isPositive = data && data.data.price_change_percentage_24h.usd >= 0;
  const colorClass = isPositive ? "text-emerald-500" : "text-red-500";
  const bgClass = isPositive ? "bg-emerald-500" : "bg-red-500";

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={isError}
      title="#1 Trending Coin"
      value={data?.symbol?.toUpperCase() || "..."}
      denominator=""
      status={`24H: ${isPositive ? "+" : ""}${data?.data?.price_change_percentage_24h?.usd?.toFixed(2) || "0"}%`}
      colorClass={colorClass}
      bgClass={bgClass}
      className="md:col-span-10 lg:col-span-10"
    />
  );
};

export const DefiWidget = ({ theme }: { theme: string }) => {
  const { data, isLoading, isError } = useCachedApi("defi", async (signal) => {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/global/decentralized_finance_defi",
      { signal },
    );
    if (!res.ok) throw new Error("API failed");
    const json = await res.json();
    return json.data;
  });

  const mcap = data ? (parseFloat(data.defi_market_cap) / 1e9).toFixed(1) : "0";

  return (
    <WidgetCard
      theme={theme}
      isLoading={isLoading}
      isError={isError}
      title="DeFi Market Cap"
      value={`$${mcap}`}
      denominator="Billion"
      status={`TOP: ${data?.top_coin_name?.toUpperCase() || "..."}`}
      colorClass="text-cyan-500"
      bgClass="bg-cyan-500"
      className="md:col-span-10 lg:col-span-10"
    />
  );
};
