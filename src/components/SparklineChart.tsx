import { useRef, useLayoutEffect } from "react";

export const SparklineChart = ({ d, color }: { d: string; color?: string }) => {
  const pathRef = useRef<SVGPathElement>(null);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    // Браузер теперь точно знает, что это SVG-путь
    const length = path.getTotalLength();
    path.style.transition = "none";
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (path) {
          path.style.transition = "stroke-dashoffset 1s ease-in-out";
          path.style.strokeDashoffset = "0";
        }
      });
    });
  }, [d]);

  return (
    // Вот этой обертки не хватало!
    <svg
      className="w-full h-12"
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ stroke: color, opacity: 0.9 }}
      />
    </svg>
  );
};
