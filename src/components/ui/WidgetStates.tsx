// Loader
export const WidgetLoader = ({
  theme,
  text = "LOADING DATA...",
}: {
  theme: string;
  text?: string;
}) => (
  <div
    className={`h-full w-full min-h-[150px] flex items-center justify-center rounded-[24px] border thick-glass ${theme === "dark" ? "border-white/10 bg-white/5" : "border-zinc-200 bg-white/50"}`}
  >
    <span className="animate-pulse text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
      {text}
    </span>
  </div>
);

// Error
export const WidgetError = ({
  theme,
  text = "API UNAVAILABLE",
}: {
  theme: string;
  text?: string;
}) => (
  <div
    className={`h-full w-full min-h-[150px] flex flex-col items-center justify-center rounded-[24px] border thick-glass ${theme === "dark" ? "border-red-500/20 bg-red-500/5" : "border-red-500/20 bg-red-50/50"}`}
  >
    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-red-500/70 mb-2">
      Connection Error
    </span>
    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
      {text}
    </span>
  </div>
);
