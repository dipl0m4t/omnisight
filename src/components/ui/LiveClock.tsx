import { useState, useEffect } from "react";

export const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="pt-20 cursor-default">
      LAST SYNC: {time.toLocaleDateString()} {time.toLocaleTimeString()}
    </span>
  );
};
