"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const reducedMotion = useReducedMotion();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (reducedMotion) return;

    setIsVisible(false);
    const outer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });
    return () => cancelAnimationFrame(outer);
  }, [pathname, reducedMotion]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <div
      className="transition-opacity duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transitionTimingFunction: "var(--ease-luxe)",
      }}
    >
      {children}
    </div>
  );
}
