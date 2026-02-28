import { useEffect, useState } from "react";
import "./App.css";

type MarketRow = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number | null;
};

function formatPrice(value: number): string {
  if (value >= 1000) {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (value >= 1) {
    return `$${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })}`;
}

function formatMarketCap(value: number): string {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  }
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  }
  if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  }
  return `$${value.toLocaleString("en-US")}`;
}

function App() {
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false"
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = (await response.json()) as MarketRow[];

        if (!cancelled) {
          setMarkets(data);
        }
      } catch (_err) {
        if (!cancelled) {
          setError("FAILED TO SYNC MARKET DATA");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-[#71717a] flex flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="font-bold tracking-tight text-white text-sm sm:text-base">
              [OMNISIGHT]
            </span>
          </div>

          <nav className="flex-1 flex justify-center">
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <a
                href="#"
                className="text-[#71717a] hover:text-white transition-colors"
              >
                MARKETS
              </a>
              <a
                href="#"
                className="text-[#71717a] hover:text-white transition-colors"
              >
                ANALYTICS
              </a>
              <a
                href="#"
                className="text-[#71717a] hover:text-white transition-colors"
              >
                PORTFOLIO
              </a>
            </div>
          </nav>

          <div className="flex items-center justify-end">
            <button className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium bg-white text-black border border-zinc-800 rounded-none hover:bg-zinc-100 transition-colors">
              CONNECT WALLET
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex justify-center px-6 py-6">
        <div className="w-full max-w-5xl mt-12">
          <div className="mb-3">
            <span className="text-[11px] font-semibold text-zinc-500 tracking-[0.2em]">
              MARKET OVERVIEW
            </span>
          </div>

          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-2 font-medium text-[#71717a] uppercase tracking-widest text-[10px]">
                  Asset
                </th>
                <th className="text-right px-4 py-2 font-medium text-[#71717a] uppercase tracking-widest text-[10px]">
                  Price
                </th>
                <th className="text-right px-4 py-2 font-medium text-[#71717a] uppercase tracking-widest text-[10px] hidden sm:table-cell">
                  MKT CAP
                </th>
                <th className="text-right px-4 py-2 font-medium text-[#71717a] uppercase tracking-widest text-[10px]">
                  24h
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-xs font-mono tracking-[0.2em] text-[#71717a]"
                  >
                    SYNCING DATA...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-xs font-mono tracking-[0.2em] text-[#71717a]"
                  >
                    {error}
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                markets.map((coin) => {
                  const change = coin.price_change_percentage_24h ?? 0;
                  const isNegative = change < 0;
                  const changeColor = isNegative
                    ? "text-[#dc2626]"
                    : "text-[#16a34a]";
                  const changeValue = `${change.toFixed(1)}%`;

                  return (
                    <tr key={coin.id} className="border-b border-zinc-800">
                      <td className="px-4 py-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xs font-medium text-white">
                            {coin.name}
                          </span>
                          <span className="text-[10px] font-mono text-[#71717a]">
                            {coin.symbol.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-mono">
                        {formatPrice(coin.current_price)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                        {formatMarketCap(coin.market_cap)}
                      </td>
                      <td className="px-4 py-2 text-right text-sm font-mono">
                        <span className={changeColor}>{changeValue}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
