interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number | ((prev: number) => number)) => void;
  endIndex: number;
  totalItems: number;
  totalPages: number;
  theme: string;
}

export const TablePagination = ({
  currentPage,
  setCurrentPage,
  endIndex,
  totalItems,
  totalPages,
  theme,
}: PaginationProps) => {
  const tableFooterClass = `border-t border-zinc-100 dark:border-white/[0.05] bg-zinc-50/50 dark:bg-white/[0.02] py-4 px-6 flex justify-end items-center gap-3 rounded-b-xl`;

  return (
    <div className={tableFooterClass}>
      <span className="text-sm text-gray-500 font-bold self-center pr-4 tracking-[0.2em] uppercase">
        Page {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => prev - 1)}
        disabled={currentPage === 1}
        className={`px-3.5 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase rounded-4xl
            ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white" : "border-zinc-300 bg-white/80 text-black"} 
            ${currentPage === 1 ? "opacity-30 cursor-not-allowed grayscale" : `shadow-lg active:scale-95 cursor-pointer ${theme === "dark" ? "hover:bg-white/[0.1]" : "hover:bg-zinc-100"}`}`}
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

      <button
        onClick={() => setCurrentPage((prev) => prev + 1)}
        disabled={endIndex >= totalItems}
        className={`px-3.5 py-3.5 text-sm font-black transition-all thick-glass refractive-distortion border tracking-widest uppercase rounded-4xl
            ${theme === "dark" ? "border-white/[0.15] bg-white/[0.05] text-white" : "border-zinc-300 bg-white/80 text-black"}
            ${endIndex >= totalItems ? "opacity-30 cursor-not-allowed grayscale" : `shadow-lg active:scale-95 cursor-pointer ${theme === "dark" ? "hover:bg-white/[0.1]" : "hover:bg-zinc-100"}`}`}
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
  );
};
