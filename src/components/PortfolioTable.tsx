import { SortableHeader } from "./Table/SortableHeader";
import type { PortfolioItem, MarketRow } from "../types/crypto";

interface PortfolioTableProps {
  currentPortfolio: PortfolioItem[];
  marketMap: Map<string, MarketRow>;
  sortKey: string;
  sortDirection: string;
  handleSort: (key: string) => void;
  setEditingAsset: (asset: any) => void;
  setIsEditModalOpen: (isOpen: boolean) => void;
  setAssetToDelete: (id: number) => void;
}

export const PortfolioTable = ({
  currentPortfolio,
  marketMap,
  sortKey,
  sortDirection,
  handleSort,
  setEditingAsset,
  setIsEditModalOpen,
  setAssetToDelete,
}: PortfolioTableProps) => {
  const tableHeaderClass = `border-b border-zinc-100 dark:border-white/[0.05] bg-zinc-50/50 dark:bg-white/[0.02] text-xs font-bold uppercase tracking-[0.2em] py-4 px-6 text-zinc-600 dark:text-zinc-500`;
  const tableCellClass = "px-6 py-5 transition-colors";

  return (
    <table className="w-full text-left border-collapse table-fixed">
      <thead>
        <tr>
          {/* ASSET */}
          <SortableHeader
            label="Asset"
            sortKey="name"
            currentSortKey={sortKey}
            direction={sortDirection}
            onSort={handleSort}
            className={`${tableHeaderClass} w-56 text-left`}
          />

          {/* HOLDINGS */}
          <th className={`${tableHeaderClass} w-32 text-right cursor-default`}>
            Holdings
          </th>

          {/* BUY PRICE */}
          <th
            className={`${tableHeaderClass} w-40 text-right hidden sm:table-cell cursor-default`}
          >
            Buy Price
          </th>

          {/* INVESTED */}
          <SortableHeader
            label="Invested"
            sortKey="invested"
            currentSortKey={sortKey}
            direction={sortDirection}
            onSort={handleSort}
            className={`${tableHeaderClass} text-right w-44 hidden sm:table-cell`}
          />

          {/* VALUE */}
          <SortableHeader
            label="Value"
            sortKey="value"
            currentSortKey={sortKey}
            direction={sortDirection}
            onSort={handleSort}
            className={`${tableHeaderClass} text-right w-44 hidden sm:table-cell`}
          />

          {/* PROFIT | LOSS */}
          <SortableHeader
            label="Profit | Loss"
            sortKey="profit_loss"
            currentSortKey={sortKey}
            direction={sortDirection}
            onSort={handleSort}
            className={`${tableHeaderClass} text-right w-48 pr-10 sm:table-cell`}
          />

          <th className={`${tableHeaderClass} px-4 py-4 w-16`}></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.03]">
        {currentPortfolio.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-24 text-center">
              <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
                Asset not found in portfolio
              </span>
            </td>
          </tr>
        ) : (
          currentPortfolio.map((pos) => {
            const coin = marketMap.get(pos.coinId);
            if (!coin) return null;
            const invested = pos.amount * pos.buyPrice;
            const val = coin.current_price * pos.amount;
            const pl = val - invested;
            const isProfit = pl >= 0;

            return (
              <tr
                key={pos.id}
                className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-[background-color] font-mono group"
              >
                {/* 1. ASSET */}
                <td className={tableCellClass}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black text-zinc-950 dark:text-zinc-100 tracking-wide">
                      {coin.name}
                    </span>
                    <span className="text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest">
                      {coin.symbol.toUpperCase()}
                    </span>
                  </div>
                </td>

                {/* 2. HOLDINGS (Красивое округление до 6 знаков) */}
                <td
                  className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100`}
                >
                  {pos.amount.toLocaleString("en-US", {
                    maximumFractionDigits: 6,
                  })}
                </td>

                {/* 3. BUY PRICE (Строго 2 знака) */}
                <td
                  className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100`}
                >
                  $
                  {pos.buyPrice.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                {/* 4. INVESTED (Строго 2 знака) */}
                <td
                  className={`${tableCellClass} text-right text-base font-bold text-zinc-500 dark:text-zinc-400 tracking-tight`}
                >
                  $
                  {invested.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                {/* 5. VALUE (Строго 2 знака) */}
                <td
                  className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight`}
                >
                  $
                  {val.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                {/* 6. PROFIT/LOSS (Строго 2 знака) */}
                <td
                  className={`px-6 py-5 text-right text-base font-black pr-10 ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                >
                  {isProfit ? "+" : "-"}$
                  {Math.abs(pl).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>

                {/* 7. ACTIONS */}
                <td className="px-4 py-4 text-right align-middle">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => {
                        setEditingAsset({
                          id: pos.id,
                          coinId: pos.coinId,
                          invested: (pos.amount * pos.buyPrice).toString(),
                          buyPrice: pos.buyPrice.toString(),
                        });
                        setIsEditModalOpen(true);
                      }}
                      className="text-zinc-400 hover:text-emerald-500 transition-colors cursor-pointer"
                      title="Edit Asset"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => setAssetToDelete(pos.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Delete Asset"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
