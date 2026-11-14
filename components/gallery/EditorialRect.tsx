"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import type { EditorialMode } from "@/lib/editorialLayout";
import { usePhotoViewer, type CollagePhoto } from "./PhotoViewer";
import "./editorial-collage.css";
import "./editorial-rect.css";

export interface RectPhoto extends CollagePhoto {
  /** width / height of the photo */
  ar: number;
}

interface Props {
  slug: string;
  title: string;
  description?: string;
  photos: RectPhoto[];
  /** tall photos made for phones; when present, phones show these (a tall card + their own viewer) */
  mobilePhotos?: RectPhoto[];
  mode: EditorialMode;
  pick?: number;
  pos?: string;
  rows?: number[][];
}

/** Deal photos into two rows of nearly equal total width, keeping the shoot's order inside each row. */
function balancedRows(photos: RectPhoto[]): number[][] {
  const n = photos.length;
  if (n >= 4 && n <= 16) {
    let best: { d: number; rows: number[][] } | null = null;
    for (let m = 0; m < 1 << n; m++) {
      const a: number[] = [];
      const b: number[] = [];
      let sa = 0;
      let sb = 0;
      for (let i = 0; i < n; i++) {
        if ((m >> i) & 1) {
          a.push(i);
          sa += photos[i].ar;
        } else {
          b.push(i);
          sb += photos[i].ar;
        }
      }
      if (a.length < 2 || b.length < 2) continue;
      const d = Math.abs(sa - sb);
      if (!best || d < best.d) best = { d, rows: [a, b] };
    }
    if (best) return best.rows;
  }
  return greedyRows(photos, photos.map((_, i) => i));
}

/** Put each photo in the shorter row, in order. */
function greedyRows(photos: RectPhoto[], indexes: number[]): number[][] {
  const rows = [
    { w: 0, items: [] as number[] },
    { w: 0, items: [] as number[] },
  ];
  for (const i of indexes) {
    const r = rows[0].w <= rows[1].w ? rows[0] : rows[1];
    r.w += photos[i].ar;
    r.items.push(i);
  }
  return rows.map((r) => r.items);
}

export default function EditorialRect({ slug, title, description, photos, mobilePhotos, mode, pick = 0, pos, rows }: Props) {
  const { openAt, warm, viewer } = usePhotoViewer(title, photos);
  const mobile = usePhotoViewer(title, mobilePhotos ?? photos);
  const hasMobile = !!mobilePhotos?.length;
  // The preview on the page is the same everywhere; only what opens full screen differs: on a phone, a shoot that has
  // tall phone photos opens those (in the order Roberta set), otherwise the normal photos.
  const onPhone = () => hasMobile && typeof window !== "undefined" && window.matchMedia("(max-width: 700px)").matches;
  const open = (i: number, el: HTMLElement) => (onPhone() ? mobile.openAt(0, el) : openAt(i, el));
  const heat = (i: number) => (onPhone() ? mobile.warm(0) : warm(i));
  const blockRef = useRef<HTMLDivElement>(null);
  const count = photos.length;

  // drag with the mouse to move sideways (touch and trackpads already scroll)
  useEffect(() => {
    const el = blockRef.current;
    if (!el || mode === "fit") return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;
    const onDown = (e: MouseEvent) => {
      down = true;
      moved = false;
      startX = e.pageX;
      startLeft = el.scrollLeft;
      el.classList.add("drag");
    };
    const onMove = (e: MouseEvent) => {
      if (!down) return;
      const dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
      el.classList.remove("drag");
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };
    el.addEventListener("mousedown", onDown);
    el.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("mousedown", onDown);
      el.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [mode]);

  // Scrolling while the pointer is over the title or "View all" always moves the page
  // (and sideways movement slides the photos), exactly as it does over the photos.
  const twRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = twRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch-zoom
      e.preventDefault();
      const k = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1;
      window.scrollBy(0, e.deltaY * k);
      if (mode !== "fit" && blockRef.current) blockRef.current.scrollLeft += e.deltaX * k;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [mode]);

  const tile = (i: number, className: string, style: CSSProperties, sizes: string, objectPosition?: string) => (
    <button
      key={i}
      type="button"
      className={`ec-tile ed-tile ${className}`}
      style={style}
      aria-label={`Open photo ${i + 1} of ${count}: ${title}`}
      onClick={(e) => open(i, e.currentTarget)}
      onPointerEnter={() => heat(i)}
      onFocus={() => heat(i)}
      onTouchStart={() => heat(i)}
    >
      <Image
        src={photos[i].src}
        alt={photos[i].alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{ objectPosition: objectPosition ?? `${photos[i].focal[0]}% ${photos[i].focal[1]}%` }}
      />
    </button>
  );

  const small = "(min-width: 1001px) 420px, 60vw";
  let body: React.ReactNode;
  if (mode === "single") {
    const bigIndex = pick >= 0 && pick < count ? pick : 0;
    const rest = photos.map((_, i) => i).filter((i) => i !== bigIndex);
    const grp = greedyRows(photos, rest);
    body = (
      <div className="ed-rows">
        {tile(bigIndex, "big", {}, "(min-width: 1001px) 1100px, 100vw", pos)}
        {count > 1 && (
          <div className="ed-grp">
            {grp.map((r, ri) => (
              <div className="ed-r" key={ri}>
                {r.map((i) => tile(i, "", { aspectRatio: String(photos[i].ar) }, small))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } else if (mode === "fit") {
    const layout = rows ?? balancedRows(photos);
    body = (
      <div className="ed-rows">
        {layout.map((r, ri) => (
          <div className="ed-r" key={ri}>
            {r.map((i) => tile(i, "", { flex: `${photos[i].ar} 1 0` }, small))}
          </div>
        ))}
      </div>
    );
  } else {
    const layout = rows ?? greedyRows(photos, photos.map((_, i) => i));
    body = (
      <div className="ed-rows">
        {layout.map((r, ri) => (
          <div className="ed-r" key={ri}>
            {r.map((i) => tile(i, "", { aspectRatio: String(photos[i].ar) }, small))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <section id={slug} className="ed-proj">
      <div className="ed-wrap">
        <div ref={blockRef} className={`ed-blk ${mode}`}>
          {body}
        </div>
        <div ref={twRef} className="ed-tw">
          <h2 className="m-0">
            <button type="button" className="ed-ttl" onClick={(e) => open(0, e.currentTarget)} onPointerEnter={() => heat(0)}>
              {title}
            </button>
          </h2>
          {count > 1 && (
            <button type="button" className="ed-vw" onClick={(e) => open(0, e.currentTarget)}>
              View all
            </button>
          )}
        </div>
      </div>
      {description && (
        <div className="ed-info">
          <p>{description}</p>
        </div>
      )}
      {viewer}
      {mobile.viewer}
    </section>
  );
}
