import "./App.css";

function App() {
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
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Bitcoin
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      BTC
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $95,230
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $1.86T
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#16a34a] font-medium">+2.4%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Ethereum
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      ETH
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $2,745
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $327B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#dc2626] font-medium">-1.1%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Solana
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      SOL
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $178.40
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $82.4B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#16a34a] font-medium">+3.7%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">BNB</span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      BNB
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $412.30
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $61.9B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#16a34a] font-medium">+0.9%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Cardano
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      ADA
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $0.64
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $22.3B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#dc2626] font-medium">-0.8%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">XRP</span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      XRP
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $0.58
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $31.5B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#16a34a] font-medium">+1.6%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Avalanche
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      AVAX
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $47.20
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $17.9B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#dc2626] font-medium">-2.3%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Dogecoin
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      DOGE
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $0.18
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $25.2B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#16a34a] font-medium">+5.1%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Polkadot
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      DOT
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $9.32
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $12.8B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#dc2626] font-medium">-1.9%</span>
                </td>
              </tr>
              <tr className="border-b border-zinc-800">
                <td className="px-4 py-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium text-white">
                      Chainlink
                    </span>
                    <span className="text-[10px] font-mono text-[#71717a]">
                      LINK
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  $18.75
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono text-[#71717a] hidden sm:table-cell">
                  $11.2B
                </td>
                <td className="px-4 py-2 text-right text-sm font-mono">
                  <span className="text-[#16a34a] font-medium">+0.4%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default App;
