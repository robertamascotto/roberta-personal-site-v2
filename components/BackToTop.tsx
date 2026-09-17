"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function BackToTop() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Absent from the design's Home page — only appears on interior pages.
  if (pathname === "/") return null;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      tabIndex={isVisible ? 0 : -1}
      aria-hidden={!isVisible}
      className={`fixed z-[95] bottom-7 right-[clamp(20px,5vw,64px)] inline-flex items-center font-body text-[11px] tracking-[0.1em] uppercase text-ink px-3.5 py-2.5 border border-ink/[0.14] backdrop-blur-[8px] transition-all duration-300 ${
        isVisible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      style={{ backgroundColor: "rgba(253,253,252,0.86)" }}
    >
      Top &#8593;
    </button>
  );
}
