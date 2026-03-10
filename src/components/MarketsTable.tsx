import { SparklineChart } from "./SparklineChart";
import { SortableHeader } from "./Table/SortableHeader";
import {
  formatPrice,
  formatMarketCap,
  generateSparklinePath,
} from "../utils/helpers";
import type { MarketRow } from "../types/crypto";

interface MarketsTableProps {
  theme: string;
  currentCoins: MarketRow[];
  sortKey: string;
  sortDirection: string;
  handleSort: (key: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  itemsPerPage: number;
  loading: boolean;
}

export const MarketsTable = ({
  theme,
  currentCoins,
  sortKey,
  sortDirection,
  handleSort,
  favorites,
  toggleFavorite,
  itemsPerPage,
  loading,
}: MarketsTableProps) => {
  const tableHeaderClass = `border-b border-zinc-100 dark:border-white/[0.05] bg-zinc-50/50 dark:bg-white/[0.02] text-xs font-bold uppercase tracking-[0.2em] py-4 px-6 text-zinc-600 dark:text-zinc-500`;
  const tableCellClass = "px-6 py-5 transition-colors";

  return (
    <div className="w-full overflow-x-auto hide-scrollbar pb-2">
      <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
        <thead>
          <tr>
            <th className={`${tableHeaderClass} w-14`}></th>
            <SortableHeader
              label="Asset"
              sortKey="name"
              currentSortKey={sortKey}
              direction={sortDirection}
              onSort={handleSort}
              className={`${tableHeaderClass} w-60 text-left`}
            />
            <SortableHeader
              label="Price"
              sortKey="current_price"
              currentSortKey={sortKey}
              direction={sortDirection}
              onSort={handleSort}
              className={`${tableHeaderClass} w-36 text-right`}
            />
            <SortableHeader
              label="24H Change, %"
              sortKey="price_change_percentage_24h"
              currentSortKey={sortKey}
              direction={sortDirection}
              onSort={handleSort}
              className={`${tableHeaderClass} w-44 text-right hidden sm:table-cell`}
            />
            <SortableHeader
              label="Market Cap"
              sortKey="market_cap"
              currentSortKey={sortKey}
              direction={sortDirection}
              onSort={handleSort}
              className={`${tableHeaderClass} w-44 text-right hidden sm:table-cell`}
            />
            <SortableHeader
              label="Trend (1W)"
              sortKey="trend"
              currentSortKey={sortKey}
              direction={sortDirection}
              onSort={handleSort}
              className={`${tableHeaderClass} w-44 text-right pr-10 hidden sm:table-cell`}
            />
          </tr>
        </thead>

        <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.03]">
          {/* === DISPLAY LOGIC === */}
          {loading ? (
            // IF LOADING
            <tr>
              <td colSpan={6} className="py-24 text-center">
                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest animate-pulse">
                  Initializing Sync...
                </span>
              </td>
            </tr>
          ) : currentCoins.length === 0 ? (
            // IF LOADING IS DONE, BUT NO COINS
            <tr>
              <td colSpan={6} className="py-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    No matching assets
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            // IF EVERYTHING'S PERFECT AND WE HAVE THE DATA — DRAW THE TABLE
            currentCoins.map((coin) => {
              const isNeg = (coin.price_change_percentage_24h ?? 0) < 0;
              const sparkline = coin.sparkline_in_7d?.price;
              const is7dNeg = sparkline
                ? sparkline[sparkline.length - 1] < sparkline[0]
                : false;

              return (
                <tr
                  key={coin.id}
                  className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-[background-color] font-mono"
                >
                  <td className={`${tableCellClass} w-16`}>
                    <button
                      onClick={() => toggleFavorite(coin.id)}
                      className={`p-2.5 flex items-center justify-center transition-all thick-glass refractive-distortion border shadow-lg active:scale-90 hover:brightness-110 rounded-full ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1]" : "border-zinc-300 bg-white/80 hover:bg-zinc-100"} ${favorites.includes(coin.id) ? "text-yellow-400" : "text-zinc-500"}`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={
                          favorites.includes(coin.id) ? "currentColor" : "none"
                        }
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className={
                          favorites.includes(coin.id) ? "animate-star-glow" : ""
                        }
                      >
                        <path d="M12 2.5l2.84 5.75 6.35.92-4.6 4.48 1.09 6.32L12 17l-5.68 2.97 1.09-6.32-4.6-4.48 6.35-.92L12 2.5z" />
                      </svg>
                    </button>
                  </td>
                  <td className={tableCellClass}>
                    <div className="flex items-center gap-3">
                      {coin.market_cap_rank <= 10 ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 tracking-widest whitespace-nowrap">
                          TOP-{coin.market_cap_rank}
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-zinc-400 dark:text-zinc-600 w-8 text-center">
                          {coin.market_cap_rank}
                        </span>
                      )}
                      <span className="text-lg font-black text-zinc-950 dark:text-zinc-100 tracking-wide">
                        {coin.name}
                      </span>
                      <span className="text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wide">
                        {coin.symbol.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className={`${tableCellClass} text-right`}>
                    <span className="text-base font-bold text-zinc-950 dark:text-zinc-200 tracking-m">
                      {formatPrice(coin.current_price)}
                    </span>
                  </td>
                  <td
                    className={`${tableCellClass} text-right text-sm font-extrabold text-zinc-700 dark:text-zinc-500 sm:table-cell tracking-wide`}
                  >
                    <span
                      className={`text-[18px] font-mono font-black mt-0.5 ${isNeg ? "text-red-500" : "text-emerald-500"}`}
                    >
                      {isNeg ? "▼" : "▲"}{" "}
                      {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(
                        2,
                      )}
                      %
                    </span>
                  </td>
                  <td
                    className={`${tableCellClass} text-right text-m font-extrabold text-zinc-700 dark:text-zinc-500 sm:table-cell tracking-wider`}
                  >
                    {formatMarketCap(coin.market_cap)}
                  </td>
                  <td className={tableCellClass}>
                    <div className="flex justify-end">
                      <SparklineChart
                        key={`${coin.id}-${currentCoins.length}-${sortKey}-${sortDirection}`}
                        d={generateSparklinePath(sparkline)}
                        color={is7dNeg ? "#ef4444" : "#10b981"}
                      />
                    </div>
                  </td>
                </tr>
              );
            })
          )}

          {/* Spacers for empty lines (only show if NOT loading and there are coins but there are less then 10 of em ) */}
          {!loading &&
            currentCoins.length > 0 &&
            currentCoins.length < itemsPerPage &&
            Array.from({ length: itemsPerPage - currentCoins.length }).map(
              (_, index) => (
                <tr key={`empty-${index}`} className="h-[89px]">
                  <td
                    colSpan={6}
                    className="border-b border-zinc-100 dark:border-white/[0.05]"
                  ></td>
                </tr>
              ),
            )}
        </tbody>
      </table>
    </div>
  );
};
