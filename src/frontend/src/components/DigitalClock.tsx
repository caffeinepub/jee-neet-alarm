import { useEffect, useState } from "react";

export function DigitalClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = String(time.getHours()).padStart(2, "0");
  const minutes = String(time.getMinutes()).padStart(2, "0");
  const seconds = String(time.getSeconds()).padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="text-center py-6">
      <div className="font-mono text-6xl md:text-7xl font-bold tracking-wider text-teal drop-shadow-lg">
        {hours}:{minutes}
        <span className="text-4xl md:text-5xl text-muted-foreground ml-2">
          {seconds}
        </span>
      </div>
      <p className="text-muted-foreground text-sm mt-2 tracking-wide">
        {dateStr}
      </p>
    </div>
  );
}
