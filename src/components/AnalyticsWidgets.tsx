import { useState, useEffect } from "react";

const apiCache: Record<string, any> = {};

// ==========================================
// 1. UNIVERSAL WIDGET FRAMEWORK
// ==========================================
const WidgetCard = ({
  theme,
  title,
  value,
  denominator,
  status,
  colorClass,
  bgClass,
  isLoading,
  className = "",
  valueSize = "text-6xl",
}: any) => {
  return (
    <div
      className={`relative p-6 rounded-3xl border thick-glass overflow-hidden flex flex-col h-40 transition-all animate-content-reveal ${
        theme === "dark"
          ? "border-white/10 bg-white/5"
          : "border-zinc-200 bg-white/50"
      } ${className}`}
    >
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center z-10">
          <span className="animate-pulse text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
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

          <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-400 z-10">
            {title}
          </p>

          <div className="flex items-stretch gap-3 z-10 mt-auto">
            <span
              className={`${valueSize} font-black tracking-tighter leading-none ${colorClass}`}
            >
              {value}
            </span>

            <div className="flex flex-col justify-between pt-1.5 pb-1.5">
              <span
                className={`text-xl font-black opacity-40 leading-none ${colorClass}`}
              >
                {denominator}
              </span>
              <span
                className={`text-xs sm:text-sm font-bold tracking-widest uppercase leading-none whitespace-nowrap ${colorClass}`}
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

/// ==========================================
// 2. WIDGETS
// ==========================================

export const FearAndGreedWidget = ({ theme }: { theme: string }) => {
  const [data, setData] = useState<any>(apiCache["fng"] || null);
  useEffect(() => {
    if (apiCache["fng"]) return;
    const c = new AbortController();
    fetch("https://api.alternative.me/fng/", { signal: c.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          apiCache["fng"] = j.data[0];
          setData(j.data[0]);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

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
      isLoading={!data}
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
  const [data, setData] = useState<any>(apiCache["global"] || null);
  useEffect(() => {
    if (apiCache["global"]) return;
    const c = new AbortController();
    fetch("https://api.coingecko.com/api/v3/global", { signal: c.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          apiCache["global"] = j.data;
          setData(j.data);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

  const mcap = data ? (data.total_market_cap.usd / 1e12).toFixed(2) : "0";
  const vol = data ? (data.total_volume.usd / 1e9).toFixed(0) : "0";
  return (
    <WidgetCard
      theme={theme}
      isLoading={!data}
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
  const [data, setData] = useState<any>(
    apiCache["global"]?.market_cap_percentage || null,
  );
  useEffect(() => {
    if (apiCache["global"]) {
      setData(apiCache["global"].market_cap_percentage);
      return;
    }
    const c = new AbortController();
    fetch("https://api.coingecko.com/api/v3/global", { signal: c.signal })
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          apiCache["global"] = j.data;
          setData(j.data.market_cap_percentage);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

  const btc = data ? data.btc.toFixed(1) : "0";
  const eth = data ? data.eth.toFixed(1) : "0";
  const others = data ? (100 - data.btc - data.eth).toFixed(1) : "0";
  return (
    <WidgetCard
      theme={theme}
      isLoading={!data}
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

export const BtcOpenInterestWidget = ({ theme }: { theme: string }) => {
  const [data, setData] = useState<number | null>(apiCache["btc_oi"] || null);
  useEffect(() => {
    if (apiCache["btc_oi"]) return;
    const c = new AbortController();
    fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
      signal: c.signal,
    })
      .then((r) => r.json())
      .then((j) => {
        const btcIndex = j[0].universe.findIndex((u: any) => u.name === "BTC");
        if (btcIndex !== -1) {
          const oi =
            parseFloat(j[1][btcIndex].openInterest) *
            parseFloat(j[1][btcIndex].markPx);
          apiCache["btc_oi"] = oi;
          setData(oi);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

  const oiFormatted = data ? (data / 1e9).toFixed(2) : "0";
  return (
    <WidgetCard
      theme={theme}
      isLoading={!data}
      title="BTC Open Interest"
      value={`$${oiFormatted}`}
      denominator="Billion"
      status="HYPERLIQUID PERPS"
      colorClass="text-purple-500"
      bgClass="bg-purple-500"
      className="md:col-span-7 lg:col-span-7"
    />
  );
};

export const BtcFundingWidget = ({ theme }: { theme: string }) => {
  const [data, setData] = useState<any>(apiCache["btc_funding"] || null);
  useEffect(() => {
    if (apiCache["btc_funding"]) return;
    const c = new AbortController();
    fetch("https://api.hyperliquid.xyz/info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "metaAndAssetCtxs" }),
      signal: c.signal,
    })
      .then((r) => r.json())
      .then((j) => {
        const btcIndex = j[0].universe.findIndex((u: any) => u.name === "BTC");
        if (btcIndex !== -1) {
          const res = {
            rate: parseFloat(j[1][btcIndex].funding) * 100,
            markPx: parseFloat(j[1][btcIndex].markPx).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            }),
          };
          apiCache["btc_funding"] = res;
          setData(res);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

  const rate = data ? data.rate : 0;
  const isLongHeavy = rate > 0;
  const colorClass = isLongHeavy ? "text-emerald-500" : "text-red-500";
  const bgClass = isLongHeavy ? "bg-emerald-500" : "bg-red-500";
  const displayRate = data ? Math.abs(rate).toFixed(4) : "0.0000";
  return (
    <WidgetCard
      theme={theme}
      isLoading={!data}
      title="BTC Funding Rate"
      value={`${isLongHeavy ? "+" : "-"}${displayRate}`}
      denominator="%"
      status={`PRICE: $${data?.markPx || 0}`}
      colorClass={colorClass}
      bgClass={bgClass}
      className="md:col-span-8 lg:col-span-8"
    />
  );
};

export const BtcFeesWidget = ({ theme }: { theme: string }) => {
  const [data, setData] = useState<any>(apiCache["fees"] || null);
  useEffect(() => {
    if (apiCache["fees"]) return;
    const c = new AbortController();
    fetch("https://mempool.space/api/v1/fees/recommended", { signal: c.signal })
      .then((r) => r.json())
      .then((j) => {
        apiCache["fees"] = j;
        setData(j);
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

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
      isLoading={!data}
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
  const [data, setData] = useState<any>(apiCache["trending"] || null);
  useEffect(() => {
    if (apiCache["trending"]) return;
    const c = new AbortController();
    fetch("https://api.coingecko.com/api/v3/search/trending", {
      signal: c.signal,
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.coins) {
          apiCache["trending"] = j.coins[0].item;
          setData(j.coins[0].item);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

  const isPositive = data && data.data.price_change_percentage_24h.usd >= 0;
  const colorClass = isPositive ? "text-emerald-500" : "text-red-500";
  const bgClass = isPositive ? "bg-emerald-500" : "bg-red-500";
  return (
    <WidgetCard
      theme={theme}
      isLoading={!data}
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
  const [data, setData] = useState<any>(apiCache["defi"] || null);
  useEffect(() => {
    if (apiCache["defi"]) return;
    const c = new AbortController();
    fetch(
      "https://api.coingecko.com/api/v3/global/decentralized_finance_defi",
      { signal: c.signal },
    )
      .then((r) => r.json())
      .then((j) => {
        if (j.data) {
          apiCache["defi"] = j.data;
          setData(j.data);
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") console.error(e);
      });
    return () => c.abort();
  }, []);

  const mcap = data ? (parseFloat(data.defi_market_cap) / 1e9).toFixed(1) : "0";
  return (
    <WidgetCard
      theme={theme}
      isLoading={!data}
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
