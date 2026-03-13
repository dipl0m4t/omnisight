import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./theme/ThemeToggle";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setCurrentPage: (page: number) => void;
  isScrolled: boolean;
  isHidden: boolean;
  theme: string;
}

export const Header = ({
  activeTab,
  setActiveTab,
  setCurrentPage,
  isScrolled,
  isHidden,
  theme,
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="absolute md:sticky top-0 z-[100] w-full h-0 pointer-events-none">
      <div
        className={`w-full flex justify-center transition-all duration-500 ease-out 
        ${isScrolled ? "pt-3" : "pt-6"} 
        ${isHidden ? "-translate-y-[150%] opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <header
          className={`pointer-events-auto thick-glass refractive-distortion transition-all duration-500 ease-out border flex flex-col overflow-hidden mx-auto
  ${isScrolled ? "w-[90%] md:w-[70%] rounded-[40px]" : "w-[95%] md:w-[80%] rounded-[40px]"}
  ${
    theme === "dark"
      ? isScrolled
        ? "border-white/10 bg-zinc-900/80 backdrop-blur-2xl shadow-2xl"
        : "border-white/[0.08] bg-white/[0.02] shadow-none"
      : isScrolled
        ? "border-zinc-300 bg-white/95 shadow-xl"
        : "border-zinc-200 bg-white/80 shadow-none"
  }`}
        >
          {/* === TOP LINE === */}
          <div
            className={`w-full flex items-center justify-between transition-all duration-500 ease-out ${isScrolled ? "px-5 py-2.5" : "px-6 sm:px-10 py-4"}`}
          >
            {/* 1. LEFT BLOCK: LOGO */}
            <div className="flex-1 flex justify-start">
              <div
                className={`transition-transform duration-500 origin-left ${isScrolled ? "scale-[0.85]" : "scale-100"}`}
              >
                <Logo />
              </div>
            </div>

            {/* 2. CENTER BLOCK: NAVIGATION */}
            <nav
              className={`hidden lg:flex flex-none justify-center text-[13px] font-black tracking-[0.3em] text-zinc-600 dark:text-zinc-500 uppercase transition-all duration-500 ease-out
              ${isScrolled ? "gap-6" : "gap-6 xl:gap-8"}`}
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

            {/* 3. RIGHT BLOCK: WALLET & THEME */}
            <div className="flex-1 flex justify-end">
              <div
                className={`flex items-center transition-all duration-500 ease-out ${isScrolled ? "gap-3" : "gap-4 xl:gap-6"}`}
              >
                <div
                  className={`transition-transform duration-500 ${isScrolled ? "scale-[0.9]" : "scale-100"}`}
                >
                  <ThemeToggle />
                </div>

                {/* DESKTOP: WALLET BUTTON */}
                <button
                  className={`hidden md:block shrink-0 whitespace-nowrap font-black transition-all duration-500 thick-glass refractive-distortion border tracking-[0.15em] uppercase shadow-lg active:scale-95 cursor-pointer
                  ${isScrolled ? "px-5 py-2.5 text-[12px] rounded-[30px]" : "px-6 py-3.5 text-[13px] rounded-4xl"}
                  ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1]" : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100"}`}
                >
                  <span className="text-zinc-400 dark:text-zinc-600 mr-1.5">
                    [
                  </span>
                  <span className="text-black dark:text-white uppercase">
                    CONNECT WALLET
                  </span>
                  <span className="text-zinc-400 dark:text-zinc-600 ml-1.5">
                    ]
                  </span>
                </button>

                {/* MOBILE (BURGER-BUTTON) */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
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
          </div>

          {/* === MOBILE MENU === */}
          <div
            className={`lg:hidden flex flex-col items-center gap-6 overflow-hidden transition-all duration-500 ease-in-out ${isMobileMenuOpen ? "max-h-[400px] opacity-100 pb-8" : "max-h-0 opacity-0 pb-0"}`}
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
            <button
              className={`px-4 py-4 min-w-[200px] text-xs font-black transition-all thick-glass refractive-distortion border tracking-[0.15em] uppercase shadow-lg active:scale-95 cursor-pointer rounded-4xl ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white" : "border-zinc-300 bg-white/80 text-black"}`}
            >
              <span className="text-zinc-400 dark:text-zinc-600 mr-1.5">[</span>
              <span className="text-black dark:text-white uppercase">
                CONNECT WALLET
              </span>
              <span className="text-zinc-400 dark:text-zinc-600 ml-1.5">]</span>
            </button>
          </div>
        </header>
      </div>
    </div>
  );
};
