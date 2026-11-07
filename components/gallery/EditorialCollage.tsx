"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { ColumnPlan } from "@/lib/collage";
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

interface Props {
  title: string;
  photos: CollagePhoto[];
  /** arrangement for wide screens (4 columns) */
  wide: ColumnPlan;
  /** arrangement for phones and tablets (2 columns) */
  narrow: ColumnPlan;
}

export default function EditorialCollage({ title, photos, wide, narrow }: Props) {
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

  const openAt = (index: number, el: HTMLElement) => {
    openerRef.current = el;
    setOpen(index);
  };
  const close = useCallback(() => setOpen(null), []);

  // When the viewer closes, give keyboard focus back to the photo that opened it.
  // (Done after the viewer has gone, once the page behind it is no longer locked.)
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open === null && wasOpen.current) openerRef.current?.focus({ preventScroll: true });
    wasOpen.current = open !== null;
  }, [open]);

  const renderGrid = (plan: ColumnPlan, sizes: string) => (
    <div
      className="ec-grid"
      style={{ gridTemplateColumns: `repeat(${plan.columns.length}, minmax(0, 1fr))`, aspectRatio: plan.aspect }}
    >
      {plan.columns.map((column, ci) => (
        <div className="ec-col" key={ci}>
          {column.map((tile) => {
            const photo = photos[tile.index];
            return (
              <button
                key={tile.index}
                type="button"
                className="ec-tile"
                style={{ flexGrow: tile.grow }}
                aria-label={`Open photo ${tile.index + 1} of ${photos.length}: ${title}`}
                onClick={(e) => openAt(tile.index, e.currentTarget)}
                onPointerEnter={() => warm(tile.index)}
                onFocus={() => warm(tile.index)}
                onTouchStart={() => warm(tile.index)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={sizes}
                  className="object-cover"
                  style={{ objectPosition: `${photo.focal[0]}% ${photo.focal[1]}%` }}
                />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="ec-wide">{renderGrid(wide, "(min-width: 901px) 18vw, 46vw")}</div>
      <div className="ec-narrow">{renderGrid(narrow, "46vw")}</div>
      {open !== null && (
        <Viewer title={title} photos={photos} index={open} onIndex={setOpen} onClose={close} warm={warm} />
      )}
    </>
  );
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
      <span className="ec-btn ec-count" aria-hidden="true">
        {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </span>
      <button type="button" className="ec-btn ec-close" aria-label="Close" onClick={onClose}>
        &#215;
      </button>
      <button type="button" className="ec-btn ec-arrow ec-prev" aria-label="Previous photo" onClick={() => go(index - 1)}>
        &#8249;
      </button>
      <button type="button" className="ec-btn ec-arrow ec-next" aria-label="Next photo" onClick={() => go(index + 1)}>
        &#8250;
      </button>
    </div>
  );
}
