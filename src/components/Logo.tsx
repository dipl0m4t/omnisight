import React, { useEffect, useState } from "react";

export const Logo = () => {
  const [showObserver, setShowObserver] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowObserver(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center w-48 h-12 cursor-pointer select-none"
      onMouseEnter={() => setShowObserver(true)}
      onMouseLeave={() => setShowObserver(false)}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out
        ${showObserver ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}`}
      >
        <svg
          width="100"
          height="40"
          viewBox="0 0 100 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        >
          <path
            d="M15,35 Q20,15 50,15 Q80,15 85,35"
            className="text-zinc-400 dark:text-zinc-600"
          />

          <path d="M40,15 Q40,5 50,5 Q60,5 60,15" className="text-zinc-500" />

          <circle
            cx="43"
            cy="22"
            r="6"
            className="text-black dark:text-white"
          />
          <circle
            cx="57"
            cy="22"
            r="6"
            className="text-black dark:text-white"
          />

          <path d="M25,35 L38,24" strokeLinecap="round" />
          <path d="M75,35 L62,24" strokeLinecap="round" />
        </svg>
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out font-mono font-black tracking-tighter text-2xl
        ${!showObserver ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"}`}
      >
        <span className="text-zinc-400 dark:text-zinc-600 mr-1.5">[</span>
        <span className="text-black dark:text-white uppercase tracking-widest">
          Omnisight
        </span>
        <span className="text-zinc-400 dark:text-zinc-600 ml-1.5">]</span>
      </div>
    </div>
  );
};
