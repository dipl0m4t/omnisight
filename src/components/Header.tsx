import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme/ThemeToggle";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setCurrentPage: (page: number) => void;
  isScrolled: boolean;
  theme: string;
}

export const Header = ({
  activeTab,
  setActiveTab,
  setCurrentPage,
  isScrolled,
  theme,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="absolute md:sticky top-0 z-[100] w-full h-0 pointer-events-none">
      <div
        className={`w-full flex justify-center px-4 sm:px-8 transition-all duration-500 ${isScrolled ? "pt-3" : "pt-6"}`}
      >
        <header
          className={`pointer-events-auto thick-glass refractive-distortion transition-all duration-500 border w-full flex flex-col overflow-hidden
          ${isScrolled ? "max-w-5xl rounded-[40px]" : "max-w-7xl rounded-[40px]"}
          ${theme === "dark" ? "border-white/[0.08] bg-white/[0.02] shadow-[0_15px_40px_rgba(0,0,0,0.5)]" : "border-zinc-300 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"}`}
        >
          {/* === TOP LINE === */}
          <div
            className={`w-full flex items-center justify-between transition-all duration-500 ${isScrolled ? "px-6 py-2.5" : "px-6 sm:px-10 py-4"}`}
          >
            {/* LOGO */}
            <div
              className={`transition-transform duration-500 origin-left ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
            >
              <Logo />
            </div>

            {/* DESKTOP: NAVIGATION */}
            <nav
              className={`hidden md:flex gap-8 text-[14px] font-black tracking-[0.3em] text-zinc-600 dark:text-zinc-500 uppercase transition-transform duration-500 origin-center ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
            >
              <button
                onClick={() => {
                  setActiveTab("markets");
                  setCurrentPage(1);
                }}
                className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "markets" ? "text-black dark:text-white" : ""}`}
              >
                MARKETS
              </button>
              <button
                onClick={() => {
                  setActiveTab("analytics");
                  setCurrentPage(1);
                }}
                className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "analytics" ? "text-black dark:text-white" : ""}`}
              >
                ANALYTICS
              </button>
              <button
                onClick={() => {
                  setActiveTab("portfolio");
                  setCurrentPage(1);
                }}
                className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "portfolio" ? "text-black dark:text-white" : ""}`}
              >
                PORTFOLIO
              </button>
            </nav>

            {/* RIGHT BLOCK: THEME, WALLET (DESKTOP), BURGER (MOBILE) */}
            <div
              className={`flex items-center gap-4 md:gap-6 transition-transform duration-500 origin-right ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
            >
              <ThemeToggle />

              {/* DESKTOP: WALLET BUTTON (Hidden on phones by using hidden md:block!) */}
              <button
                className={`hidden md:block px-6 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95 cursor-pointer
                ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1] rounded-4xl" : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100 rounded-4xl"}`}
              >
                [ CONNECT WALLET ]
              </button>

              {/* MOBILE (BURGER-BUTTON) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {isMobileMenuOpen ? (
                    <path d="M18 6 6 18M6 6l12 12" />
                  ) : (
                    <path d="M4 12h16M4 6h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* === MOBILE MENU: SMOOTH TRANSITION) === */}
          <div
            className={`md:hidden flex flex-col items-center gap-6 overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-[400px] opacity-100 pb-8" : "max-h-0 opacity-0 pb-0"}`}
          >
            <nav className="flex flex-col items-center gap-6 text-[14px] font-black tracking-[0.3em] text-zinc-600 dark:text-zinc-500 uppercase mt-2">
              <button
                onClick={() => {
                  setActiveTab("markets");
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "markets" ? "text-black dark:text-white" : ""}`}
              >
                MARKETS
              </button>
              <button
                onClick={() => {
                  setActiveTab("analytics");
                  setCurrentPage(1);
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "analytics" ? "text-black dark:text-white" : ""}`}
              >
                ANALYTICS
              </button>
              <button
                onClick={() => {
                  setActiveTab("portfolio");
                  setCurrentPage(1);
                  setIsMobileMenuOpen(false);
                }}
                className={`hover:text-black dark:hover:text-white transition-all cursor-pointer ${activeTab === "portfolio" ? "text-black dark:text-white" : ""}`}
              >
                PORTFOLIO
              </button>
            </nav>

            {/* MOBILE: WALLET BUTTON */}
            <button
              className={`px-4 py-4 min-w-[200px] text-xs font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95 cursor-pointer rounded-4xl
              ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white" : "border-zinc-300 bg-white/80 text-black"}`}
            >
              [ CONNECT WALLET ]
            </button>
          </div>
        </header>
      </div>
    </div>
  );
};
