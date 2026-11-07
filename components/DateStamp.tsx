"use client";

import { useEffect, useState } from "react";

/**
 * The date and the live time, pinned small in the corner of the screen like the stamp old digital
 * cameras printed on photos. It stays put while the page scrolls and shows the visitor's own clock,
 * so it only appears once the page has loaded in the browser.
 */
export default function DateStamp() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!now) return null;
  const two = (n: number) => String(n).padStart(2, "0");
  const date = `\u2019${two(now.getFullYear() % 100)} ${two(now.getMonth() + 1)} ${two(now.getDate())}`;
  const time = `${two(now.getHours())}:${two(now.getMinutes())}:${two(now.getSeconds())}`;

  return (
    <span aria-hidden="true" className="date-stamp">
      {date}&nbsp;&nbsp;{time}
    </span>
  );
}
