interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string;
  direction: string;
  onSort: (key: string) => void;
  className?: string;
}

export const SortableHeader = ({
  label,
  sortKey,
  currentSortKey,
  direction,
  onSort,
  className = "",
}: SortableHeaderProps) => {
  return (
    <th
      className={`${className} cursor-pointer select-none`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span
        className={`inline-flex ml-1 w-3 transition-all duration-300 ${
          currentSortKey === sortKey ? "opacity-100" : "opacity-0"
        } ${direction === "asc" ? "rotate-0" : "rotate-180"}`}
      >
        ↑
      </span>
    </th>
  );
};
