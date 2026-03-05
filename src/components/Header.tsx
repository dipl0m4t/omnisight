import { Logo } from "./Logo";
import { ThemeToggle } from "./theme/ThemeToggle";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isScrolled: boolean;
  theme: string;
}

export const Header = ({
  activeTab,
  setActiveTab,
  isScrolled,
  theme,
}: HeaderProps) => {
  return (
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
                className={`px-6 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase shadow-lg active:scale-95 cursor-pointer
          ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1] rounded-4xl" : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100 rounded-4xl"}`}
              >
                [ CONNECT WALLET ]
              </button>
            </div>
          </div>
        </header>
      </div>
    </div>
  );
};
