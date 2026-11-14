"use client";

import { useEffect, useRef } from "react";
import NameMark from "@/components/home/NameMark";

const STORAGE_KEY = "rmIntroSeen";
const COUNT = 25; // /public/intro/01.jpg .. 25.jpg, sorted darkest to brightest
const START = 250; // ms of plain black before the squares
const RUN = START + 1300; // ms until the squares stop
const BLACK_BEAT = 420; // ms of plain black after the wall, before the name: the "boom" breath
const NAME_HOLD = 2200; // ms the name stays on black before it goes in by itself (unless the visitor clicks first)
const TILE = 150; // px, the little squares
const GAP = 2;

/**
 * Runs before first paint (it is inlined in the page HTML). Decides whether this visitor sees the
 * intro: not if they already saw it this browser session, not for crawlers or speed-test bots.
 * Without JavaScript the attribute is never set, so the intro simply never shows.
 * Adding ?intro=1 to the home page address always plays it (handy for testing).
 */
const DECIDE_SCRIPT = `(function(){var d=document.documentElement;try{var force=/[?&]intro=1(&|$)/.test(location.search);var skip=!force&&(sessionStorage.getItem("${STORAGE_KEY}")||/bot|crawl|spider|slurp|lighthouse|headless|prerender/i.test(navigator.userAgent));d.setAttribute("data-intro",skip?"off":"on")}catch(e){d.setAttribute("data-intro","off")}})();`;

const PHOTOS = Array.from({ length: COUNT }, (_, i) => `/intro/${String(i + 1).padStart(2, "0")}.jpg`);

/**
 * The opening: black, then a full screen of small squares shimmering through Roberta's photos,
 * then a beat of black, her name, and one hard cut (no fade) to the home page.
 *
 * The name stays about two seconds, then the cut. A click, Enter, Space or Esc goes in sooner.
 *
 * Slow shimmer: every square changes at its own moment, at most about 3 times a second, and only to
 * a photo of similar brightness (the photos are sorted from dark to bright and each square walks
 * up and down that list), so the screen never flashes. People who ask their device to reduce motion
 * get no animation at all: just the name, then the cut.
 */
export default function TileIntro({ headline }: { headline: string }) {
  const nameRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    if (html.getAttribute("data-intro") !== "on") return;

    let done = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const finish = () => {
      if (done) return;
      done = true;
      timers.forEach((t) => window.clearTimeout(t));
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* private mode: it just plays again next time */
      }
      html.setAttribute("data-intro", "off"); // the black and the squares vanish in one frame
    };
    // On a phone there is no photo wall: just the name on black, and it waits until the visitor taps.
    const phone = window.matchMedia("(max-width: 700px)").matches;
    const showName = () => {
      if (nameRef.current) nameRef.current.style.visibility = "visible";
      if (phone && hintRef.current) hintRef.current.style.visibility = "visible";
    };
    // after the name is up: go in by itself
    const afterName = (ms: number) => later(finish, ms);
    const onKey = (e: KeyboardEvent) => {
      if (done) return; // the intro is over: keys belong to the page again
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener("keydown", onKey);
    const cleanup = () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("keydown", onKey);
    };

    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    if (phone) {
      later(showName, 250);
      return cleanup;
    }

    // Reduced motion: no flashing, just the name on black, then the cut.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      later(showName, 300);
      afterName(300 + NAME_HOLD);
      return cleanup;
    }

    // Load the tiny photos first. If they are not ready quickly, skip the intro: never make anyone wait.
    const loadAll = Promise.all(
      PHOTOS.map(
        (src) =>
          new Promise<HTMLImageElement | null>((resolve) => {
            const im = new Image();
            im.onload = () => resolve(im);
            im.onerror = () => resolve(null);
            im.src = src;
          })
      )
    );
    const timeout = new Promise<null>((resolve) => later(() => resolve(null), 2500));

    Promise.race([loadAll, timeout]).then((result) => {
      if (done) return;
      const imgs = (result ?? []).filter((im): im is HTMLImageElement => !!im);
      const cv = canvasRef.current;
      if (!result || imgs.length < 8 || !cv) {
        finish();
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth;
      const H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const ctx = cv.getContext("2d");
      if (!ctx) {
        finish();
        return;
      }
      ctx.scale(dpr, dpr);

      const target = W < 700 ? 100 : TILE; // smaller squares on phones
      const cols = Math.max(4, Math.round(W / target));
      const tile = (W - GAP * (cols - 1)) / cols;
      const rows = Math.ceil(H / (tile + GAP)) + 1;
      const y0 = (H - (rows * (tile + GAP) - GAP)) / 2;

      // every square walks 0 -> last -> 0 along the brightness-sorted list, starting at its own random place
      const n = imgs.length;
      const ping = [...Array(n).keys()].concat([...Array(n).keys()].slice(1, -1).reverse());
      const N = cols * rows;
      const pos = Array.from({ length: N }, () => Math.floor(Math.random() * ping.length));
      const nextChange = Array.from({ length: N }, () => START + Math.random() * 420);

      const clear = () => {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);
      };
      const begin = performance.now();
      let running = true;
      const loop = () => {
        if (done || !running) return;
        const now = performance.now() - begin;
        if (now >= RUN) {
          // the wall is over: pure black, and nothing draws on it again
          running = false;
          clear();
          return;
        }
        clear();
        for (let i = 0; i < N; i++) {
          if (now >= nextChange[i]) {
            pos[i] = (pos[i] + 1) % ping.length;
            nextChange[i] = now + 340 + Math.random() * 140; // never more than ~3 changes a second
          }
          if (now >= START) {
            ctx.drawImage(imgs[ping[pos[i]]], (i % cols) * (tile + GAP), y0 + Math.floor(i / cols) * (tile + GAP), tile, tile);
          }
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      const t = RUN;
      later(() => {
        running = false;
        clear(); // the wall disappears: a full black screen
      }, t);
      later(showName, t + BLACK_BEAT); // the name, on black
      afterName(t + BLACK_BEAT + NAME_HOLD); // BOOM: one hard cut to the home page (or wait for the click)
    });

    return cleanup;
  }, []);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: DECIDE_SCRIPT }} />
      <div
        className="ti"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome"
        onClick={() => {
          try {
            sessionStorage.setItem(STORAGE_KEY, "1");
          } catch {
            /* private mode */
          }
          document.documentElement.setAttribute("data-intro", "off");
        }}
      >
        <canvas ref={canvasRef} aria-hidden="true" />
        <h2 ref={nameRef} className="rm-name" aria-hidden="true">
          <NameMark headline={headline} />
        </h2>
        <span ref={hintRef} className="ti-hint" aria-hidden="true">
          Tap to enter
        </span>
      </div>
    </>
  );
}
