import { useEffect, useState } from "react";
import { PortfolioSummary } from "./components/PortfolioSummary";
import "./App.css";

// --- TYPE & UTILS ---
import type { MarketRow, PortfolioItem } from "./types/crypto";
import { useTheme } from "./components/theme/ThemeContext";

// --- COMPONENTS ---
import BackgroundGeometry from "./components/BackgroundGeometry";
import { Header } from "./components/Header";
import { ControlBar } from "./components/ControlBar";
import { MarketsTable } from "./components/MarketsTable";
import { PortfolioTable } from "./components/PortfolioTable";
import { TablePagination } from "./components/TablePagination";
import {
  AddAssetModal,
  EditAssetModal,
  DeleteModal,
} from "./components/Modals";
import {
  useDashboardData,
  FearAndGreedWidget,
  MarketCapWidget,
  DominanceWidget,
  OpenInterestWidget,
  BtcFundingWidget,
  DefiWidget,
  TrendingWidget,
  BtcFeesWidget,
} from "./components/AnalyticsWidgets";
import { LiquidationMapWidget } from "./components/LiquidationMapWidget";
import { LongShortWidget } from "./components/LongShortWidget";
import { StablecoinWidget } from "./components/StablecoinWidget";

function App() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [activeTab, setActiveTab] = useState("markets");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useDashboardData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("crypto_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    coinId: "",
    invested: "",
    buyPrice: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<{
    id: number;
    coinId: string;
    invested: string;
    buyPrice: string;
  } | null>(null);

  const [assetToDelete, setAssetToDelete] = useState<number | null>(null);

  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [selectedCoinName, setSelectedCoinName] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; name: string; symbol: string; thumb: string }[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);

  const [sortKey, setSortKey] = useState("market_cap");
  const [sortDirection, setSortDirection] = useState("desc");

  // ==========================================
  // 2. EFFECTS & LIFECYCLES
  // ==========================================
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 80);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem("crypto_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    // Create the controller to cancel a request
    const controller = new AbortController();

    async function load(isFirstTime = false) {
      try {
        if (isFirstTime) setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=true",
          { signal: controller.signal }, // Linking fetch to the controller
        );
        const data = await res.json();

        if (Array.isArray(data)) {
          setMarkets(data);
          setError(null);
        } else {
          setError(
            "API RATE LIMIT: Wait a bit and then refresh the page please.",
          );
        }
      } catch (error: any) {
        // If the request was killed by us (AbortError), we simply ignore the error
        if (error.name === "AbortError") return;
        activeTab === "markets" && setError("SYNC_ERROR");
      } finally {
        // Remove the download only if the component is still alive.
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load(true);
    const intervalId = setInterval(() => load(false), 60000);

    return () => {
      // CLEANER: Kill the current request and stop the timer
      controller.abort();
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // Create cancel controller
    const controller = new AbortController();

    async function fetchPortfolio() {
      try {
        const res = await fetch("http://localhost:3001/api/portfolio", {
          signal: controller.signal, // Bind the signal
        });
        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setPortfolio(data);
      } catch (error: any) {
        // Die quietly if the loading was interrupted intentionally
        if (error.name === "AbortError") return;
        console.error(
          "SYNC_ERROR: Failed to load portfolio from database",
          error,
        );
      }
    }
    fetchPortfolio();

    return () => controller.abort();
  }, []);

  // Debounce-search for modal form (500ms delay for Rate Limit protection)
  useEffect(() => {
    if (modalSearchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${modalSearchQuery}`,
        );
        const data = await res.json();
        setSearchResults(data.coins ? data.coins.slice(0, 5) : []);
      } catch (error) {
        console.error("Coin search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [modalSearchQuery]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let upwardAccumulator = 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const delta = currentScrollY - lastScrollY;

          setIsScrolled(currentScrollY > 100);
          if (delta > 2) {
            upwardAccumulator = 0;
            if (currentScrollY > 400) setIsHidden(true);
          } else if (delta < -2) {
            upwardAccumulator += Math.abs(delta);

            if (upwardAccumulator > window.innerHeight * 0.4) {
              setIsHidden(false);
              upwardAccumulator = 0;
            }
          }

          if (currentScrollY < 100) {
            setIsHidden(false);
            upwardAccumulator = 0;
          }

          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ===========================================
  // 3. DATA PROCESSING (FILTRATION AND SORTING)
  // ===========================================
  const filteredMarkets = markets.filter((coin) => {
    if (showFavoritesOnly && !favorites.includes(coin.id)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        coin.name.toLowerCase().includes(query) ||
        coin.symbol.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const filteredPortfolio = portfolio.filter((pos) => {
    if (!searchQuery) return true;
    const coin = markets.find((m) => m.id === pos.coinId);
    if (!coin) return false;
    const query = searchQuery.toLowerCase();
    return (
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
    );
  });

  const sortedMarkets = [...filteredMarkets].sort((a, b) => {
    const pricesA = a?.sparkline_in_7d?.price || [];
    const pricesB = b?.sparkline_in_7d?.price || [];
    const valueA =
      sortKey === "trend"
        ? pricesA[pricesA.length - 1] - pricesA[0]
        : (a[sortKey as keyof typeof a] ?? 0);
    const valueB =
      sortKey === "trend"
        ? pricesB[pricesB.length - 1] - pricesB[0]
        : (b[sortKey as keyof typeof b] ?? 0);

    return sortDirection === "asc"
      ? valueA < valueB
        ? -1
        : 1
      : valueA < valueB
        ? 1
        : -1;
  });

  const marketMap = new Map(markets.map((m) => [m.id, m]));

  const sortedPortfolio = [...filteredPortfolio].sort((a, b) => {
    const currentPriceA = marketMap.get(a.coinId)?.current_price ?? 0;
    const currentPriceB = marketMap.get(b.coinId)?.current_price ?? 0;

    const valueA = (() => {
      if (sortKey === "name") return marketMap.get(a.coinId)?.name || "";
      if (sortKey === "value") return a.amount * currentPriceA;
      if (sortKey === "invested") return a.amount * a.buyPrice;
      if (sortKey === "profit_loss")
        return (currentPriceA - a.buyPrice) * a.amount;
      return 0;
    })();

    const valueB = (() => {
      if (sortKey === "name") return marketMap.get(b.coinId)?.name || "";
      if (sortKey === "value") return b.amount * currentPriceB;
      if (sortKey === "invested") return b.amount * b.buyPrice;
      if (sortKey === "profit_loss")
        return (currentPriceB - b.buyPrice) * b.amount;
      return 0;
    })();

    return sortDirection === "asc"
      ? valueA < valueB
        ? -1
        : 1
      : valueA < valueB
        ? 1
        : -1;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCoins = sortedMarkets.slice(startIndex, endIndex);
  const currentPortfolio = sortedPortfolio.slice(startIndex, endIndex);
  const totalItems =
    activeTab === "markets"
      ? filteredMarkets.length
      : activeTab === "portfolio"
        ? filteredPortfolio.length
        : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // ==========================================
  // 4. EVENT HANDLERS
  // ==========================================
  const toggleFavorite = (id: string) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setCurrentPage(1);
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortKey(key);
      setCurrentPage(1);
      setSortDirection("desc");
    }
  };

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();

    const investedAmount = Number(newAsset.invested);
    const buyPrice = Number(newAsset.buyPrice);

    if (investedAmount <= 0 || buyPrice <= 0) {
      alert(
        "Please enter valid positive numbers for Invested Amount and Buy Price.",
      );
      return;
    }

    const calculatedAmount = investedAmount / buyPrice;

    const existingAsset = portfolio.find((p) => p.coinId === newAsset.coinId);

    try {
      if (existingAsset) {
        const currentInvested = existingAsset.amount * existingAsset.buyPrice;
        const totalInvested = currentInvested + investedAmount;
        const newTotalAmount = existingAsset.amount + calculatedAmount;
        const averageBuyPrice = totalInvested / newTotalAmount; // New average price

        const res = await fetch(
          `http://localhost:3001/api/portfolio/${existingAsset.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: newTotalAmount,
              buyPrice: averageBuyPrice,
            }),
          },
        );

        if (!res.ok) throw new Error("Error updating database");
        const updatedItem = await res.json();

        setPortfolio((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
        );
      } else {
        const res = await fetch("http://localhost:3001/api/portfolio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            coinId: newAsset.coinId,
            amount: calculatedAmount,
            buyPrice: buyPrice,
          }),
        });

        if (!res.ok) throw new Error("Error saving to DB");
        const addedItem = await res.json();
        setPortfolio((prev) => [...prev, addedItem]);
      }

      // Reset the modal
      setIsAddModalOpen(false);
      setNewAsset({ coinId: "", invested: "", buyPrice: "" });
      setModalSearchQuery("");
      setSelectedCoinName("");
      setSearchResults([]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;

    // Calculate new amount of coins
    const investedAmount = Number(editingAsset.invested);
    const buyPrice = Number(editingAsset.buyPrice);

    if (investedAmount <= 0 || buyPrice <= 0) return;

    const calculatedAmount = investedAmount / buyPrice;

    try {
      const res = await fetch(
        `http://localhost:3001/api/portfolio/${editingAsset.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: calculatedAmount, // Send the calculated amount
            buyPrice: buyPrice,
          }),
        },
      );
      if (!res.ok) throw new Error("Database error");
      const updatedItem = await res.json();

      setPortfolio((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      );

      setIsEditModalOpen(false);
      setEditingAsset(null);
    } catch (error) {
      console.error(error);
    }
  };

  const confirmDeleteAsset = async () => {
    if (assetToDelete === null) return;
    try {
      const res = await fetch(
        `http://localhost:3001/api/portfolio/${assetToDelete}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error("Database error");
      setPortfolio((prev) => prev.filter((item) => item.id !== assetToDelete));
      setAssetToDelete(null);
    } catch (error) {
      console.error(error);
    }
  };

  // ======================
  // 5. INTERFACE RENDER
  // ======================
  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-300 flex flex-col ${theme === "dark" ? "bg-black text-zinc-300" : "bg-white text-zinc-900"}`}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundGeometry theme={theme} />
      </div>

      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
        isScrolled={isScrolled}
        isHidden={isHidden}
        theme={theme}
      />

      <main className="relative z-10 mx-auto w-full md:w-[80%] px-4 sm:px-0 pt-[120px] pb-20">
        <ControlBar
          activeTab={activeTab}
          error={error}
          theme={theme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          setIsAddModalOpen={setIsAddModalOpen}
          setCurrentPage={setCurrentPage}
        />

        <div
          className={`border thick-glass refractive-distortion overflow-hidden rounded-[24px] transition-all animate-content-reveal 
            ${
              theme === "dark"
                ? "border-white/[0.05] bg-white/[0.01] shadow-none"
                : "border-zinc-200 bg-white/70 shadow-2xl shadow-zinc-200/50"
            }`}
        >
          {/* Favorite Toggle */}
          {activeTab === "markets" && (
            <div className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100 dark:border-white/[0.05] animate-content-reveal">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                Show Favorites
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showFavoritesOnly}
                  onChange={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    setCurrentPage(1);
                  }}
                />
                <div
                  className={`w-12 h-6 rounded-full transition-all duration-100 backdrop-blur-xl border thick-glass shadow-inner ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05]" : "border-zinc-300 bg-white/80"} peer-checked:border-yellow-500/50 peer-checked:bg-yellow-500/10`}
                ></div>
                <div
                  className={`absolute top-[3px] left-[3px] rounded-full h-[18px] w-[18px] transition-all duration-500 ease-in-out transform shadow-md ${theme === "dark" ? "bg-zinc-400 border border-white/20" : "bg-zinc-100 border border-zinc-300"} peer-checked:translate-x-6 peer-checked:bg-yellow-400 peer-checked:shadow-[0_0_15px_rgba(250,204,21,0.8)] peer-checked:border-white/40`}
                ></div>
              </label>
            </div>
          )}

          {activeTab === "markets" && (
            <MarketsTable
              theme={theme}
              currentCoins={currentCoins}
              sortKey={sortKey}
              sortDirection={sortDirection}
              handleSort={handleSort}
              loading={loading}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              itemsPerPage={itemsPerPage}
            />
          )}
          {activeTab === "analytics" && (
            <div className="p-8 min-h-[500px] cursor-default">
              <h2 className="text-2xl font-black tracking-widest uppercase mb-8">
                Market Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-20 lg:grid-cols-20 xl:grid-cols-20 gap-6">
                <MarketCapWidget
                  theme={theme}
                  data={dashboardData?.marketCap}
                  isLoading={isDashboardLoading}
                />
                <DominanceWidget
                  theme={theme}
                  data={dashboardData?.dominance}
                  isLoading={isDashboardLoading}
                />
                <FearAndGreedWidget
                  theme={theme}
                  data={dashboardData?.fearAndGreed}
                  isLoading={isDashboardLoading}
                />

                <LongShortWidget
                  theme={theme}
                  data={dashboardData?.longShort}
                  isLoading={isDashboardLoading}
                  className="md:col-span-20"
                />

                <TrendingWidget
                  theme={theme}
                  data={dashboardData?.trending}
                  isLoading={isDashboardLoading}
                />
                <DefiWidget
                  theme={theme}
                  data={dashboardData?.defi}
                  isLoading={isDashboardLoading}
                />

                <StablecoinWidget
                  theme={theme}
                  data={dashboardData?.stablecoins}
                  isLoading={isDashboardLoading}
                  className="md:col-span-20"
                />

                <OpenInterestWidget
                  theme={theme}
                  data={dashboardData?.hyperliquid}
                  isLoading={isDashboardLoading}
                />
                <BtcFundingWidget
                  theme={theme}
                  data={dashboardData?.hyperliquid}
                  isLoading={isDashboardLoading}
                />
                <BtcFeesWidget
                  theme={theme}
                  data={dashboardData?.fees}
                  isLoading={isDashboardLoading}
                />

                <LiquidationMapWidget
                  theme={theme}
                  className="md:col-span-20"
                />
              </div>
            </div>
          )}
          {activeTab === "portfolio" && (
            <div className="flex flex-col gap-6">
              {/* DASHBOARD */}
              <PortfolioSummary
                portfolio={portfolio}
                marketMap={marketMap}
                theme={theme}
              />
              <PortfolioTable
                currentPortfolio={currentPortfolio}
                marketMap={marketMap}
                sortKey={sortKey}
                sortDirection={sortDirection}
                handleSort={handleSort}
                setEditingAsset={setEditingAsset}
                setIsEditModalOpen={setIsEditModalOpen}
                setAssetToDelete={setAssetToDelete}
              />
            </div>
          )}
          {totalPages > 1 && (
            <TablePagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              endIndex={endIndex}
              totalItems={totalItems}
              totalPages={totalPages}
              theme={theme}
            />
          )}
        </div>
      </main>

      <footer
        className={`relative z-10 border-t transition-colors duration-300 py-8 sm:py-12 mt-auto text-[10px] sm:text-[12px] font-mono font-bold tracking-widest sm:tracking-[0.4em] uppercase ${theme === "dark" ? "border-white/[0.05] bg-black/60 text-zinc-500" : "border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur-md"}`}
      >
        <div className="mx-auto w-full md:w-[80%] px-4 sm:px-0 flex flex-col sm:flex-row justify-between items-center gap-4 cursor-default text-center">
          <span>© {new Date().getFullYear()} OMNISIGHT</span>
          <span className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM_STATUS: STABLE
          </span>
        </div>
      </footer>

      {/* ===== MODAL FORMS (PORTALS) ===== */}
      {isAddModalOpen && (
        <AddAssetModal
          theme={theme}
          handleAddAsset={handleAddAsset}
          setIsAddModalOpen={setIsAddModalOpen}
          newAsset={newAsset}
          setNewAsset={setNewAsset}
          modalSearchQuery={modalSearchQuery}
          setModalSearchQuery={setModalSearchQuery}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          isSearching={isSearching}
          selectedCoinName={selectedCoinName}
          setSelectedCoinName={setSelectedCoinName}
        />
      )}
      {isEditModalOpen && editingAsset && (
        <EditAssetModal
          theme={theme}
          editingAsset={editingAsset}
          setEditingAsset={setEditingAsset}
          handleUpdateAsset={handleUpdateAsset}
          setIsEditModalOpen={setIsEditModalOpen}
        />
      )}
      {assetToDelete !== null && (
        <DeleteModal
          theme={theme}
          confirmDeleteAsset={confirmDeleteAsset}
          setAssetToDelete={setAssetToDelete}
        />
      )}
    </div>
  );
}

export default App;
