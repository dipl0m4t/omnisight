import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";
import { flushSync } from "react-dom";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    // 1. Берем размеры и позицию самой кнопки
    const rect = e.currentTarget.getBoundingClientRect();

    // 2. Вычисляем координаты ИДЕАЛЬНОГО центра кнопки
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.style.setProperty("--click-x", `${x}px`);
    document.documentElement.style.setProperty("--click-y", `${y}px`);
    document.documentElement.style.setProperty("--circle-r", `${endRadius}px`);

    // [RU] Если сейчас темная тема, мы переключаемся на светлую -> нужно сужение
    const isSwitchingToDark = theme === "light";

    document.documentElement.classList.add("theme-transition");
    if (isSwitchingToDark) {
      document.documentElement.classList.add("shrink");
    }

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove("theme-transition", "shrink");
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-3.5 flex items-center justify-center transition-all thick-glass refractive-distortion border shadow-lg active:scale-90 hover:brightness-110 rounded-full cursor-pointer
      ${
        theme === "dark"
          ? "border-white/[0.15] bg-white/[0.05] text-white hover:bg-white/[0.1]"
          : "border-zinc-300 bg-white/80 text-black hover:bg-zinc-100"
      }`}
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon size={22} /> : <Sun size={22} />}
    </button>
  );
};
