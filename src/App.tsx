import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { ThemeToggle } from "./components/theme/ThemeToggle";
import BackgroundGeometry from "./components/BackgroundGeometry";
import "./App.css";
import { useTheme } from "./components/theme/ThemeContext";
import { Logo } from "./components/Logo";

// [EN] MOCK DATA: A static array simulating a database response. Later, Prisma will provide this.
// [RU] ФЕЙКОВЫЕ ДАННЫЕ: Статичный массив, имитирующий ответ от базы данных. Позже это будет приходить от Prisma.
const mockPortfolio = [
  { id: 1, coinId: "bitcoin", amount: 0.5, buyPrice: 60000 },
  { id: 2, coinId: "ethereum", amount: 5, buyPrice: 2000 },
  { id: 3, coinId: "solana", amount: 50, buyPrice: 100 },
];

// [EN] SVG CHART COMPONENT: Uses `useLayoutEffect` to measure the length of the SVG path BEFORE the browser paints it.
// [EN] This allows us to animate the line drawing from 0 to its full length smoothly.
// [RU] КОМПОНЕНТ SVG-ГРАФИКА: Использует `useLayoutEffect`, чтобы измерить длину SVG-пути ДО того, как браузер его отрисует.
// [RU] Это позволяет нам плавно анимировать отрисовку линии от 0 до её полной длины.
const SparklinePath = ({ d, color }: { d: string; color?: string }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useLayoutEffect(() => {
    if (pathRef.current && d !== "M 0 20 L 100 20") {
      const length = pathRef.current.getTotalLength();
      setPathLength(length);
    }
  }, [d]);

  return (
    <path
      ref={pathRef}
      d={d}
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        stroke: color,
        opacity: 0.9,
        strokeDasharray: pathLength || 1000,
        strokeDashoffset: pathLength ? 0 : 1000,
        transition: "stroke-dashoffset 2s ease-in-out",
      }}
    />
  );
};

type MarketRow = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
};

// [EN] MATH HELPER: Converts an array of raw prices into X,Y coordinates for the SVG path.
// [RU] МАТЕМАТИЧЕСКАЯ ФУНКЦИЯ: Преобразует массив сырых цен в X,Y координаты для SVG-линии.
function generateSparklinePath(prices?: number[]): string {
  if (!prices || prices.length < 2) return "M 0 20 L 100 20";
  const smoothPrices = prices.filter((_, i) => i % 4 === 0);
  const min = Math.min(...smoothPrices);
  const max = Math.max(...smoothPrices);
  const range = max - min || 1;
  const width = 100;
  const height = 40;
  const padding = 4;

  const points = smoothPrices.map((price, index) => {
    const x = (index / (smoothPrices.length - 1)) * width;
    const y =
      height - padding - ((price - min) / range) * (height - 2 * padding);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `M ${points.join(" L ")}`;
}

function formatPrice(v: number) {
  return v >= 1
    ? `$${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : `$${v.toFixed(6)}`;
}

function formatMarketCap(v: number) {
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${(v / 1e6).toFixed(1)}M`;
}

// [EN] COMPONENT ISOLATION: The clock updates every second. If we put this logic directly inside `App`,
// [EN] the entire 100-coin table would re-render every second! Isolating it here keeps performance high.
// [RU] ИЗОЛЯЦИЯ КОМПОНЕНТА: Часы обновляются каждую секунду. Если бы мы поместили эту логику прямо в `App`,
// [RU] вся таблица на 100 монет перерисовывалась бы ежесекундно! Изоляция здесь сохраняет высокую производительность.
const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="pt-20">
      LAST SYNC: {time.toLocaleDateString()} {time.toLocaleTimeString()}
    </span>
  );
};

function App() {
  // ==========================================
  // 1. STATE MANAGEMENT (СОСТОЯНИЯ)
  // State variables trigger a UI re-render whenever they change.
  // Переменные состояния запускают перерисовку интерфейса при любом изменении.
  // ==========================================

  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [activeTab, setActiveTab] = useState("markets");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { theme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // [EN] LAZY INITIALIZATION: We read from localStorage only ONCE when the app first loads.
  // [RU] ЛЕНИВАЯ ИНИЦИАЛИЗАЦИЯ: Мы читаем из localStorage только ОДИН раз при первой загрузке приложения.
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("crypto_favorites");
    return saved ? JSON.parse(saved) : [];
  });

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ==========================================
  // 2. EFFECTS & LIFECYCLES (ЭФФЕКТЫ И ЖИЗНЕННЫЙ ЦИКЛ)
  // ==========================================

  // [EN] SCROLL LISTENER: Uses `requestAnimationFrame` to prevent the browser from lagging.
  // [EN] It ensures we only update state when the screen is actually ready to draw the next frame.
  // [RU] СЛУШАТЕЛЬ СКРОЛЛА: Использует `requestAnimationFrame` для предотвращения лагов браузера.
  // [RU] Гарантирует, что состояние обновляется только тогда, когда экран готов отрисовать следующий кадр.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY;
          setIsScrolled((prev) => {
            if (currentScroll > 80 && !prev) return true;
            if (currentScroll < 80 && prev) return false;
            return prev;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // [EN] LOCALSTORAGE SYNC: Automatically saves favorites to browser memory whenever the array changes.
  // [RU] СИНХРОНИЗАЦИЯ LOCALSTORAGE: Автоматически сохраняет избранное в память браузера при любом изменении массива.
  useEffect(() => {
    localStorage.setItem("crypto_favorites", JSON.stringify(favorites));
  }, [favorites]);

  // [EN] API FETCH: Fetches data on mount and sets up a 60s polling interval.
  // [EN] The 'cancelled' flag prevents memory leaks if the user leaves the page before the fetch finishes.
  // [RU] ЗАПРОС К API: Загружает данные при запуске и устанавливает интервал обновления в 60 сек.
  // [RU] Флаг 'cancelled' предотвращает утечки памяти, если юзер уйдет со страницы до завершения загрузки.
  useEffect(() => {
    let cancelled = false;
    async function load(isFirstTime = false) {
      try {
        if (isFirstTime) setLoading(true);
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=true",
        );
        const data = await res.json();
        if (!cancelled) {
          setMarkets(data);
          setError(null);
        }
      } catch {
        if (!cancelled) setError("SYNC_ERROR");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load(true);
    const intervalId = setInterval(() => load(false), 60000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, []);

  const tableHeaderClass = `border-b border-zinc-100 dark:border-white/[0.05] bg-zinc-50/50 dark:bg-white/[0.02] text-xs font-bold uppercase tracking-[0.2em] py-4 px-6 text-zinc-600 dark:text-zinc-500`;
  const tableFooterClass = `border-t border-zinc-100 dark:border-white/[0.05] bg-zinc-50/50 dark:bg-white/[0.02] py-4 px-6 flex justify-end items-center gap-3 rounded-b-xl`;
  const tableCellClass = "px-6 py-5 transition-colors";

  // ==========================================
  // 3. DATA PROCESSING FUNNEL (ВОРОНКА ОБРАБОТКИ ДАННЫХ)
  // Data flows through filters before reaching the pagination slicer.
  // Данные проходят через фильтры, прежде чем попасть в нарезку пагинации.
  // ==========================================

  const filteredMarkets = markets.filter((coin) => {
    // Check 1: Is Favorites toggle ON? If yes, keep only favored coins.
    if (showFavoritesOnly && !favorites.includes(coin.id)) return false;

    // Check 2: Does the coin match the search query?
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = coin.name.toLowerCase().includes(query);
      const matchesSymbol = coin.symbol.toLowerCase().includes(query);
      if (!matchesName && !matchesSymbol) return false;
    }
    return true;
  });

  const filteredPortfolio = mockPortfolio.filter((pos) => {
    if (!searchQuery) return true;
    const coin = markets.find((m) => m.id === pos.coinId);
    if (!coin) return false;
    const query = searchQuery.toLowerCase();
    return (
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query)
    );
  });

  // [EN] PAGINATION: Calculates array indexes based on current page.
  // [RU] ПАГИНАЦИЯ: Вычисляет индексы массива на основе текущей страницы.
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // [EN] Grab exactly 10 coins for the current view.
  // [RU] Берем ровно 10 монет для текущего отображения.
  const currentCoins = filteredMarkets.slice(startIndex, endIndex);

  // [EN] Toggles an ID inside the favorites array.
  // [RU] Переключает наличие ID внутри массива избранного.
  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // ==========================================
  // 4. UI RENDER (ОТРИСОВКА ИНТЕРФЕЙСА)
  // ==========================================
  return (
    <div
      className={`relative min-h-screen font-sans transition-colors duration-300 flex flex-col ${theme === "dark" ? "bg-black text-zinc-300" : "bg-white text-zinc-900"}`}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <BackgroundGeometry theme={theme} />
      </div>

      {/* HEADER SECTION */}
      <div className="sticky top-0 z-[100] w-full h-0 pointer-events-none">
        <div
          className={`w-full flex justify-center px-4 sm:px-8 transition-all duration-500 ${isScrolled ? "pt-3" : "pt-6"}`}
        >
          <header
            className={`pointer-events-auto thick-glass refractive-distortion transition-all duration-500 border w-full
            ${isScrolled ? "max-w-5xl rounded-[40px]" : "max-w-7xl rounded-[40px]"}
            ${theme === "dark" ? "border-white/[0.08] bg-white/[0.02] shadow-[0_15px_40px_rgba(0,0,0,0.5)]" : "border-zinc-300 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"}`}
          >
            <div
              className={`w-full flex items-center justify-between transition-all duration-500 ${isScrolled ? "px-6 py-2.5" : "px-10 py-4"}`}
            >
              <div
                className={`transition-transform duration-500 origin-left ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
              >
                <Logo />
              </div>

              <nav
                className={`hidden sm:flex gap-8 text-[14px] font-black tracking-[0.3em] text-zinc-600 dark:text-zinc-500 uppercase transition-transform duration-500 origin-center ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
              >
                <button
                  onClick={() => setActiveTab("markets")}
                  className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "markets" ? "text-black dark:text-white" : ""}`}
                >
                  MARKETS
                </button>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-all"
                >
                  ANALYTICS
                </a>
                <button
                  onClick={() => setActiveTab("portfolio")}
                  className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "portfolio" ? "text-black dark:text-white" : ""}`}
                >
                  PORTFOLIO
                </button>
              </nav>

              <div
                className={`flex items-center gap-6 transition-transform duration-500 origin-right ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
              >
                <ThemeToggle />
                <button
                  className={`px-6 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95
                  ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1] rounded-4xl" : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100 rounded-4xl"}`}
                >
                  [ CONNECT WALLET ]
                </button>
              </div>
            </div>
          </header>
        </div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-8 pt-[120px] pb-20">
        {/* CONTROL BAR (Title & Search) */}
        <div className="relative mb-10 flex flex-col gap-3">
          <div
            className={`absolute -inset-y-6 -inset-x-10 z-0 blur-3xl transition-colors duration-500 pointer-events-none rounded-full ${theme === "dark" ? "bg-black/70" : "bg-white/80"}`}
          ></div>

          <div className="relative z-10 text-xs font-mono font-black text-zinc-700 dark:text-zinc-500 tracking-widest uppercase flex justify-between">
            <LiveClock />
            {error && (
              <span className="text-red-500 font-bold animate-pulse">
                {error}
              </span>
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
            </div>

            {/* [EN] Decorative line. 'flex-1' pushes the search bar to the right. */}
            {/* [RU] Декоративная линия. 'flex-1' расталкивает элементы, прижимая поиск вправо. */}
            <div className="h-[1px] flex-1 bg-zinc-300 dark:bg-white/10" />

            <div className="flex items-center justify-end shrink-0">
              {/* Expandable Search Input */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out flex items-center ${isSearchOpen ? "w-56 opacity-100 mr-3" : "w-0 opacity-0 mr-0"}`}
              >
                <input
                  type="text"
                  placeholder="Search asset..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // [EN] Always reset pagination on search / [RU] Всегда сбрасываем пагинацию при поиске
                  }}
                  className={`w-full px-4 py-3.5 rounded-full text-sm font-mono font-bold outline-none transition-all thick-glass border shadow-inner
                    ${theme === "dark" ? "bg-white/[0.05] border-white/[0.15] text-white placeholder-zinc-500" : "bg-white/80 border-zinc-300 text-zinc-800 placeholder-zinc-400"}`}
                />
              </div>

              <button
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (isSearchOpen) setSearchQuery("");
                }}
                className={`px-3.5 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95
                  ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1] rounded-4xl" : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100 rounded-4xl"}`}
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

        {/* MAIN TABLE CONTAINER */}
        <div
          className={`border thick-glass refractive-distortion overflow-hidden rounded-[24px] transition-all animate-content-reveal
          ${theme === "dark" ? "border-white/[0.05] bg-white/[0.01] shadow-none" : "border-zinc-200 bg-white/70 shadow-2xl shadow-zinc-200/50"}`}
        >
          {activeTab === "markets" && (
            <div className="flex items-center gap-4 px-6 py-4">
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
                  className={`w-12 h-6 rounded-full transition-all duration-300 backdrop-blur-xl border thick-glass shadow-inner
                  ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05]" : "border-zinc-300 bg-white/80"}
                  peer-checked:border-yellow-500/50 peer-checked:bg-yellow-500/10`}
                ></div>
                <div
                  className={`absolute top-[3px] left-[3px] rounded-full h-[18px] w-[18px] transition-all duration-500 ease-in-out transform shadow-md
                  ${theme === "dark" ? "bg-zinc-400 border border-white/20" : "bg-zinc-100 border border-zinc-300"}
                  peer-checked:translate-x-6 peer-checked:bg-yellow-400 peer-checked:shadow-[0_0_15px_rgba(250,204,21,0.8)] peer-checked:border-white/40`}
                ></div>
              </label>
            </div>
          )}

          {/* [EN] TABLE STRUCTURE: 'table-fixed' is mandatory to keep columns from collapsing when empty. */}
          {/* [RU] СТРУКТУРА ТАБЛИЦЫ: 'table-fixed' обязателен, чтобы колонки не схлопывались, когда таблица пуста. */}
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr>
                {activeTab === "markets" && (
                  <th className={`${tableHeaderClass} w-14`}></th>
                )}
                <th className={`${tableHeaderClass} w-56 text-left`}>Asset</th>
                <th className={`${tableHeaderClass} w-44 text-right`}>
                  {activeTab === "markets" ? "Price / 24H Change" : "Holdings"}
                </th>
                <th
                  className={`${tableHeaderClass} text-right w-44 hidden sm:table-cell`}
                >
                  {activeTab === "markets" ? "Market Cap" : "Value"}
                </th>
                <th className={`${tableHeaderClass} text-right w-52`}>
                  {activeTab === "markets" ? "Trend (7d)" : "Profit/Loss"}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.03]">
              {loading ? (
                <tr>
                  <td
                    colSpan={activeTab === "markets" ? 5 : 4}
                    className="py-24 text-center font-mono text-xs text-zinc-400 uppercase tracking-widest animate-pulse"
                  >
                    Initializing Sync...
                  </td>
                </tr>
              ) : activeTab === "markets" ? (
                <>
                  {/* [EN] Iterating over current page coins to build rows. */}
                  {/* [RU] Перебираем монеты текущей страницы для сборки строк таблицы. */}
                  {currentCoins.map((coin) => {
                    const isNeg = (coin.price_change_percentage_24h ?? 0) < 0;
                    const sparkline = coin.sparkline_in_7d?.price;
                    const is7dNeg = sparkline
                      ? sparkline[sparkline.length - 1] < sparkline[0]
                      : false;

                    return (
                      <tr
                        key={coin.id}
                        className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all font-mono"
                      >
                        <td className={`${tableCellClass} w-16`}>
                          <button
                            onClick={() => toggleFavorite(coin.id)}
                            className={`p-2.5 flex items-center justify-center transition-all thick-glass refractive-distortion border shadow-lg active:scale-90 hover:brightness-110 rounded-full
                            ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] hover:bg-white/[0.1]" : "border-zinc-300 bg-white/80 hover:bg-zinc-100"}
                            ${favorites.includes(coin.id) ? "text-yellow-400" : "text-zinc-500"}`}
                          >
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill={
                                favorites.includes(coin.id)
                                  ? "currentColor"
                                  : "none"
                              }
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                              strokeLinecap="round"
                              className={
                                favorites.includes(coin.id)
                                  ? "animate-star-glow"
                                  : ""
                              }
                            >
                              <path d="M12 2.5l2.84 5.75 6.35.92-4.6 4.48 1.09 6.32L12 17l-5.68 2.97 1.09-6.32-4.6-4.48 6.35-.92L12 2.5z" />
                            </svg>
                          </button>
                        </td>
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
                        <td className={`${tableCellClass} text-right`}>
                          <div className="flex flex-col items-end">
                            <span className="text-base font-bold text-zinc-950 dark:text-zinc-200 tracking-tight">
                              {formatPrice(coin.current_price)}
                            </span>
                            <span
                              className={`text-xs font-sans font-black mt-0.5 ${isNeg ? "text-red-500" : "text-emerald-500"}`}
                            >
                              {isNeg ? "▼" : "▲"}{" "}
                              {Math.abs(
                                coin.price_change_percentage_24h ?? 0,
                              ).toFixed(2)}
                              %
                            </span>
                          </div>
                        </td>
                        <td
                          className={`${tableCellClass} text-right text-sm font-extrabold text-zinc-700 dark:text-zinc-500 sm:table-cell tracking-wide`}
                        >
                          {formatMarketCap(coin.market_cap)}
                        </td>
                        <td className={tableCellClass}>
                          <div className="flex justify-end">
                            <svg
                              className="w-44 h-12"
                              viewBox="0 0 100 40"
                              preserveAspectRatio="none"
                            >
                              <SparklinePath
                                d={generateSparklinePath(sparkline)}
                                color={is7dNeg ? "#ef4444" : "#10b981"}
                              />
                            </svg>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* [EN] EMPTY STATES & ALIGNMENT PILLARS */}
                  {/* [RU] ПУСТЫЕ СОСТОЯНИЯ И РАСПОРКИ */}
                  {currentCoins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <svg
                            className="w-8 h-8 text-zinc-400/50 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                            />
                          </svg>
                          <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
                            No matching assets
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // [EN] Renders empty rows to keep the table height consistent even if there are < 10 coins.
                    // [RU] Отрисовывает пустые строки, чтобы высота таблицы не скакала, если монет < 10.
                    currentCoins.length < itemsPerPage &&
                    Array.from({
                      length: itemsPerPage - currentCoins.length,
                    }).map((_, index) => (
                      <tr key={`empty-${index}`} className="h-[89px]">
                        <td
                          colSpan={5}
                          className="border-b border-zinc-100 dark:border-white/[0.05]"
                        ></td>
                      </tr>
                    ))
                  )}
                </>
              ) : filteredPortfolio.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <svg
                        className="w-8 h-8 text-zinc-400/50 mb-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                        />
                      </svg>
                      <span className="font-mono text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Asset not found in portfolio
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPortfolio.map((pos) => {
                  const coin = markets.find((m) => m.id === pos.coinId);
                  if (!coin) return null;
                  const val = coin.current_price * pos.amount;
                  const pl = val - pos.amount * pos.buyPrice;
                  const isProfit = pl >= 0;

                  return (
                    <tr
                      key={pos.id}
                      className="group hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors font-mono"
                    >
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
                      <td
                        className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100`}
                      >
                        {pos.amount}
                      </td>
                      <td
                        className={`${tableCellClass} text-right text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight`}
                      >
                        $
                        {val.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td
                        className={`px-6 py-5 text-right text-base font-black pr-10 ${isProfit ? "text-emerald-500" : "text-red-500"}`}
                      >
                        {isProfit ? "+" : "-"}$
                        {Math.abs(pl).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* [EN] PAGINATION CONTROLS */}
          {/* [RU] ЭЛЕМЕНТЫ УПРАВЛЕНИЯ ПАГИНАЦИЕЙ */}
          <div className={tableFooterClass}>
            <span className="text-sm text-gray-500 font-bold self-center pr-4 tracking-[0.2em] uppercase">
              Page {currentPage}
            </span>

            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className={`px-3.5 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase rounded-4xl
                ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white" : "border-zinc-300 bg-white/80 text-black"} 
                ${
                  currentPage === 1
                    ? "opacity-30 cursor-not-allowed grayscale"
                    : `shadow-lg active:scale-95 cursor-pointer ${theme === "dark" ? "hover:bg-white/[0.1]" : "hover:bg-zinc-100"}`
                }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 19L8 12L15 5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={endIndex >= filteredMarkets.length}
              className={`px-3.5 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase rounded-4xl
                ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white" : "border-zinc-300 bg-white/80 text-black"}
                ${
                  endIndex >= filteredMarkets.length
                    ? "opacity-30 cursor-not-allowed grayscale"
                    : `shadow-lg active:scale-95 cursor-pointer ${theme === "dark" ? "hover:bg-white/[0.1]" : "hover:bg-zinc-100"}`
                }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 5L16 12L9 19"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </main>

      <footer
        className={`relative z-10 border-t transition-colors duration-300 py-12 mt-auto text-[12px] font-mono font-bold tracking-[0.4em] uppercase
        ${theme === "dark" ? "border-white/[0.05] bg-black/60 text-zinc-500" : "border-zinc-200 bg-white/80 text-zinc-600 backdrop-blur-md"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex justify-between items-center w-full">
          <span>© {new Date().getFullYear()} OMNISIGHT_TERMINAL</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM_STATUS: STABLE
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
