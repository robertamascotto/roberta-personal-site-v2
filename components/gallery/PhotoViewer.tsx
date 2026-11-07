"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { resizedUrl, viewerWidth } from "@/lib/sanityResize";
import { inertEverythingElse } from "@/lib/inert";
import "./editorial-collage.css";

export interface CollagePhoto {
  /** bare Sanity asset URL (urlFor(image).url()) */
  src: string;
  alt: string;
  /** where to keep the photo centred when it has to be trimmed, in % */
  focal: [number, number];
}

/**
 * The white full-screen photo viewer used by the Editorials collages and the Products
 * pages: a little white at the sides, tall photos scroll, arrow keys / swipe / Esc, only
 * the sharp photo is shown (never a stretched small one), neighbours are preloaded.
 *
 *   const { openAt, warm, viewer } = usePhotoViewer(title, photos);
 *   ...  onClick={(e) => openAt(index, e.currentTarget)}  onPointerEnter={() => warm(index)} ...
 *   ...  {viewer}
 */
export function usePhotoViewer(title: string, photos: CollagePhoto[]) {
  const [open, setOpen] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const warmed = useRef<Set<string>>(new Set());

  // Start fetching the sharp full-screen version as soon as someone points at a photo,
  // so it is usually ready by the time they click.
  const warm = useCallback(
    (index: number) => {
      if (typeof window === "undefined") return;
      const photo = photos[index];
      if (!photo) return;
      const url = resizedUrl(photo.src, viewerWidth(window.innerWidth, window.devicePixelRatio));
      if (warmed.current.has(url)) return;
      warmed.current.add(url);
      const img = new window.Image();
      img.src = url;
    },
    [photos]
  );

  const openAt = useCallback((index: number, el: HTMLElement) => {
    openerRef.current = el;
    setOpen(index);
  }, []);
  const close = useCallback(() => setOpen(null), []);

  // When the viewer closes, give keyboard focus back to the photo that opened it.
  // (Done after the viewer has gone, once the page behind it is no longer locked.)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open === null && wasOpen.current) openerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open !== null;
  }, [open]);

  const viewer: ReactNode =
    open !== null ? (
      <Viewer title={title} photos={photos} index={open} onIndex={setOpen} onClose={close} warm={warm} />
    ) : null;

  return { openAt, warm, viewer };
}

function Viewer({
  title,
  photos,
  index,
  onIndex,
  onClose,
  warm,
}: {
  title: string;
  photos: CollagePhoto[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  warm: (i: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const count = photos.length;
  const go = useCallback((i: number) => onIndex((i + count) % count), [onIndex, count]);

  // Lock the page behind the viewer and keep keyboard focus inside it.
  useEffect(() => {
    const inerted = inertEverythingElse(rootRef.current);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    scrollRef.current?.focus({ preventScroll: true });
    return () => {
      inerted.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Show the sharp version as soon as it has arrived (never a stretched small one),
  // and start fetching the neighbours.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSrc(null);
    const url = resizedUrl(photos[index].src, viewerWidth(window.innerWidth, window.devicePixelRatio));
    const img = new window.Image();
    const show = (u: string) => {
      if (cancelled) return;
      setSrc(u);
      setLoading(false);
      scrollRef.current?.scrollTo({ top: 0 });
    };
    img.onload = () => show(url);
    img.onerror = () => show(url);
    img.src = url;
    // If the sharp one is very slow, fall back to a smaller one rather than leave a blank screen.
    const fallback = window.setTimeout(() => {
      if (!cancelled && !img.complete) show(resizedUrl(photos[index].src, 1200));
    }, 9000);
    warm((index + 1) % count);
    warm((index - 1 + count) % count);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, [index, photos, count, warm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") go(index - 1);
      else if (e.key === "ArrowRight") go(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go, onClose]);

  // Swipe sideways to change photo; up and down still scrolls a tall photo.
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.6 * Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  };

  return (
    <div
      ref={rootRef}
      className="ec-viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: photo ${index + 1} of ${count}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className={`ec-load${loading ? " ec-load-on" : ""}`} aria-hidden="true" />
      <div ref={scrollRef} className="ec-scroll" tabIndex={-1}>
        {src && (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={src} className="ec-img" src={src} alt={photos[index].alt} draggable={false} />
        )}
      </div>
      {count > 1 && (
        <span className="ec-btn ec-count" aria-hidden="true">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
      )}
      <button type="button" className="ec-btn ec-close" aria-label="Close" onClick={onClose}>
        &#215;
      </button>
      {count > 1 && (
        <>
          <button type="button" className="ec-btn ec-arrow ec-prev" aria-label="Previous photo" onClick={() => go(index - 1)}>
            &#8249;
          </button>
          <button type="button" className="ec-btn ec-arrow ec-next" aria-label="Next photo" onClick={() => go(index + 1)}>
            &#8250;
          </button>
        </>
      )}
    </div>
  );
}
