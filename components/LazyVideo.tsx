"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";

interface LazyVideoProps extends VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
}

/**
 * An autoplaying <video> that doesn't start downloading until it's about to
 * scroll into view. Without this, every ambient/looping video on a page
 * starts fetching on mount regardless of whether it's ever seen.
 */
export default function LazyVideo({ src, ...props }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <video ref={ref} src={shouldLoad ? src : undefined} preload={shouldLoad ? "auto" : "none"} {...props} />;
}
