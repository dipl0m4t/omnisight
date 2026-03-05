import { LiveClock } from "./LiveClock";

interface ControlBarProps {
  activeTab: string;
  error: string | null;
  theme: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (v: boolean) => void;
  setIsAddModalOpen: (v: boolean) => void;
  setCurrentPage: (p: number) => void;
}

export const ControlBar = ({
  activeTab,
  error,
  theme,
  searchQuery,
  setSearchQuery,
  isSearchOpen,
  setIsSearchOpen,
  setIsAddModalOpen,
  setCurrentPage,
}: ControlBarProps) => {
  return (
    <div className="relative mb-10 flex flex-col gap-3">
      <div
        className={`absolute -inset-y-6 -inset-x-10 z-0 blur-3xl transition-colors duration-500 pointer-events-none rounded-full ${theme === "dark" ? "bg-black/70" : "bg-white/80"}`}
      ></div>

      <div className="relative z-10 text-xs font-mono font-black text-zinc-700 dark:text-zinc-500 tracking-widest uppercase flex justify-between">
        <LiveClock />
        {error && (
          <span className="text-red-500 font-bold animate-pulse">{error}</span>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between gap-5 w-full">
        <div className="flex items-center gap-5 shrink-0">
          <div className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
            {activeTab === "markets" ? "Market Overview" : "Your Portfolio"}
          </h2>
          {activeTab === "portfolio" && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-3.5 text-[12px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/30 rounded-full hover:bg-emerald-500/10 transition-colors cursor-pointer shadow-lg active:scale-95 thick-glass"
            >
              + Add Asset
            </button>
          )}
        </div>

        <div className="h-[1px] flex-1 bg-zinc-300 dark:bg-white/10" />

        <div className="flex items-center justify-end shrink-0">
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center ${isSearchOpen ? "w-56 opacity-100 mr-3" : "w-0 opacity-0 mr-0"}`}
          >
            <input
              type="text"
              placeholder="Search asset..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`w-full px-4 py-3.5 rounded-full text-sm font-mono font-bold outline-none transition-all thick-glass border shadow-inner ${theme === "dark" ? "bg-white/[0.05] border-white/[0.15] text-white placeholder-zinc-500" : "bg-white/80 border-zinc-300 text-zinc-800 placeholder-zinc-400"}`}
            />
          </div>
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery("");
            }}
            className={`px-3.5 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95 cursor-pointer ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1] rounded-4xl" : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100 rounded-4xl"}`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-500"
              style={{
                transform: isSearchOpen ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              {isSearchOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
