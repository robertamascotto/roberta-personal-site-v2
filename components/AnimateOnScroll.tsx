"use client";

import { useInView } from "@/lib/useInView";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function AnimateOnScroll({ children, delay = 0, className = "" }: AnimateOnScrollProps) {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        transitionTimingFunction: "var(--ease-luxe)",
        transitionDelay: `${delay}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  );
}
