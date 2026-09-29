"use client";

import { useEffect, useState } from "react";

const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

const partOfDay = (h: number) => (h < 5 ? "Late night" : h < 12 ? "Morning" : h < 17 ? "Afternoon" : h < 21 ? "Evening" : "Night");

export function MumbaiClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now ? fmt.format(now) : "--:--:--";
  const hour = now ? Number(time.slice(0, 2)) : 12;
  return (
    <span className="tabular-nums">
      Mumbai {time} IST <span className="muted">· {now ? partOfDay(hour) : ""}</span>
    </span>
  );
}
