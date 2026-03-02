import { useTheme } from "./ThemeContext";
import { Sun, Moon } from "lucide-react";
import { flushSync } from "react-dom";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = async (e: React.MouseEvent) => {
    // Резервный вариант для старых браузеров
    if (!document.startViewTransition) {
      toggleTheme();
      return;
    }

    // 1. Считаем координаты и нужный радиус
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    // 2. Передаем координаты в CSS
    document.documentElement.style.setProperty("--click-x", `${x}px`);
    document.documentElement.style.setProperty("--click-y", `${y}px`);
    document.documentElement.style.setProperty("--circle-r", `${endRadius}px`);

    // 3. Если сейчас светлая тема, значит переходим в темную (нужно сужение)
    const isSwitchingToDark = theme === "light";

    // Активируем наши CSS правила
    document.documentElement.classList.add("theme-transition");
    if (isSwitchingToDark) {
      document.documentElement.classList.add("shrink");
    }

    // 4. Запускаем смену состояния
    const transition = document.startViewTransition(() => {
      flushSync(() => {
        toggleTheme();
      });
    });

    // 5. Как только анимация завершится — прибираемся за собой
    transition.finished.then(() => {
      document.documentElement.classList.remove("theme-transition", "shrink");
    });
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-3.5 flex items-center justify-center transition-all thick-glass refractive-distortion border shadow-lg active:scale-90 hover:brightness-110 rounded-full
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
