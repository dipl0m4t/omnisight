export const LongShortWidget = ({
  theme,
  data,
  isLoading,
  className,
}: {
  theme: string;
  data: any;
  isLoading: boolean;
  className?: string;
}) => {
  if (isLoading || !data) {
    return (
      <div
        className={`p-6 rounded-[24px] border thick-glass h-[180px] flex flex-col items-center justify-center ${theme === "dark" ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white/50"} ${className}`}
      >
        <span className="animate-pulse text-[12px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Loading Sentiment...
        </span>
      </div>
    );
  }

  // Settings for the SVG Donut Chart
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const longOffset = circumference - (data.longs / 100) * circumference;
  const shortOffset = circumference - (data.shorts / 100) * circumference;

  return (
    <div
      className={`relative p-6 rounded-[24px] border thick-glass transition-colors duration-300 ${theme === "dark" ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white/50"} ${className}`}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-5 relative z-10">
        <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-300">
          Global Accounts L/S
        </p>
        <div
          className={`flex items-center gap-1 justify-center px-3 py-2 text-[13px] font-black tracking-[0.15em] transition-all border uppercase shadow-sm cursor-default rounded-xl backdrop-blur-2xl 
            ${
              theme === "dark"
                ? "border-white/10 bg-zinc-900/10 text-white/90"
                : "border-zinc-200 bg-white/80 text-zinc-800"
            }`}
        >
          <span
            className={`mr-2 ${theme === "dark" ? "text-white" : "text-black"}`}
          >
            L/S RATIO:
          </span>
          <span
            className={`px-2 py-0.5 rounded-md
              ${
                Number(data.ratio) > 1
                  ? "text-emerald-500 bg-emerald-500/10"
                  : Number(data.ratio) < 1
                    ? "text-red-500 bg-red-500/10"
                    : "text-zinc-500"
              }`}
          >
            {data.ratio}
          </span>
        </div>
      </div>

      {/* Two cards (Longs & Shorts) */}
      <div className="flex flex-col sm:flex-row gap-6 relative z-10">
        {/* LONGS Card */}
        <div
          className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border ${theme === "dark" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}
        >
          {/* Circle indicator */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-270" viewBox="0 0 100 100">
              {/* BG circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="15"
                className="text-emerald-500/20"
              />
              {/* Full donut */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={longOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-emerald-500">
                {data.longs}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-emerald-500/70 mb-1">
              Accounts
            </p>
            <p className="text-xl font-black text-emerald-500">LONGS</p>
          </div>
        </div>

        {/* SHORTS Card */}
        <div
          className={`flex-1 flex items-center gap-4 p-4 rounded-2xl border ${theme === "dark" ? "bg-red-500/10 border-red-500/20" : "bg-red-500/5 border-red-500/20"}`}
        >
          {/* Donut chart */}
          <div className="relative w-32 h-32 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth="15"
                className="text-red-500/20"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="transparent"
                stroke="#ef4444"
                strokeWidth="13"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={shortOffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-red-500">
                {data.shorts}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm font-black uppercase tracking-widest text-red-500/70 mb-1">
              Accounts
            </p>
            <p className="text-xl font-black text-red-500">SHORTS</p>
          </div>
        </div>
      </div>

      {/* Background light */}
      <div
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-full rounded-full blur-[100px] pointer-events-none ${theme === "dark" ? "bg-indigo-500/5" : "bg-indigo-500/10"}`}
      ></div>
    </div>
  );
};
