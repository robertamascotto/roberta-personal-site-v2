"use client";

import { useEffect, useRef, useState } from "react";
import HeadlineWords from "@/components/home/HeadlineWords";
import "./name-intro.css";

const STORAGE_KEY = "rmIntroSeen";

/**
 * Runs before first paint (it is inlined in the page HTML). Decides whether this
 * visitor sees the intro: not if they already saw it this browser session, not if
 * they asked for reduced motion, and not for crawlers or speed-test bots. Without
 * JavaScript the attribute is never set, so the intro simply never shows.
 * Adding ?intro=1 to the home page address always plays it (handy for testing).
 */
const DECIDE_SCRIPT = `(function(){var d=document.documentElement;try{var force=/[?&]intro=1(&|$)/.test(location.search);var skip=!force&&(sessionStorage.getItem("${STORAGE_KEY}")||window.matchMedia("(prefers-reduced-motion: reduce)").matches||/bot|crawl|spider|slurp|lighthouse|headless|prerender/i.test(navigator.userAgent));d.setAttribute("data-intro",skip?"off":"on")}catch(e){d.setAttribute("data-intro","off")}})();`;

const FLY_MS = 1250; // how long the words take to travel

/** Marks everything on the page except the intro's own branch as inert. */
function inertEverythingElse(root: HTMLElement | null): Element[] {
  const marked: Element[] = [];
  let node: HTMLElement | null = root;
  while (node && node !== document.body) {
    const parent: HTMLElement | null = node.parentElement;
    if (!parent) break;
    Array.from(parent.children).forEach((el) => {
      if (el === node || el.tagName === "SCRIPT" || el.hasAttribute("inert")) return;
      el.setAttribute("inert", "");
      marked.push(el);
    });
    node = parent;
  }
  return marked;
}

/**
 * Rendered by the home page only (the server can't reliably tell which page it is
 * building when Vercel rebuilds it in the background). It plays only when the inline
 * script above said "on", which only happens when the home page is the page the visitor
 * actually loaded, never on in-site navigation.
 */
export default function NameIntro({ headline }: { headline: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [go, setGo] = useState(false);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const inerted = useRef<Element[]>([]);
  const detach = useRef<() => void>(() => {});

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(fn, ms));
  }

  function finish() {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* private mode: it just plays again next time */
    }
    inerted.current.forEach((el) => el.removeAttribute("inert"));
    inerted.current = [];
    detach.current(); // scrolling works again
    const html = document.documentElement;
    html.setAttribute("data-intro", "off"); // the real headline appears exactly where the words landed
    html.removeAttribute("data-intro-go");
    setGone(true);
  }

  function enter() {
    if (busy.current) return;
    busy.current = true;

    const words = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-ni-word]") ?? []);
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-intro-word]"));

    // Each word travels from the middle of the screen to its spot in the home headline.
    if (words.length > 0 && words.length === targets.length) {
      words.forEach((word, i) => {
        const from = word.getBoundingClientRect();
        const to = targets[i].getBoundingClientRect();
        word.style.transition = `transform ${FLY_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`;
        void word.offsetWidth;
        word.style.transform = `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`;
      });
    } else {
      // Unusual headline shape: no flight, just a fade.
      words.forEach((word) => {
        word.style.transition = "opacity 0.6s ease";
        word.style.opacity = "0";
      });
    }

    document.documentElement.setAttribute("data-intro-go", ""); // the page fades in
    setGo(true); // the white fades away
    later(finish, FLY_MS + 50);
  }

  useEffect(() => {
    // The inline script decides; if it said "off" (or never ran), there is nothing to do.
    if (document.documentElement.getAttribute("data-intro") !== "on") {
      setGone(true);
      return;
    }

    // Keep the page behind the intro out of reach of keyboards and screen readers.
    inerted.current = inertEverythingElse(rootRef.current);
    rootRef.current?.querySelector<HTMLButtonElement>("[data-ni-enter]")?.focus({ preventScroll: true });

    // The page must be at the top (a reload can restore a scrolled position) and stay there.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
    const stop = (e: Event) => {
      if ((e as WheelEvent).ctrlKey) return; // let pinch / Ctrl-scroll zoom through
      e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        enter();
        return;
      }
      const scrollKeys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      const onButton = (e.target as HTMLElement | null)?.hasAttribute?.("data-ni-enter");
      if (scrollKeys.includes(e.key) && !(e.key === " " && onButton)) e.preventDefault();
    };
    window.addEventListener("wheel", stop, { passive: false });
    window.addEventListener("touchmove", stop, { passive: false });
    window.addEventListener("keydown", onKey);
    detach.current = () => {
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchmove", stop);
      window.removeEventListener("keydown", onKey);
    };

    return () => {
      detach.current();
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      inerted.current.forEach((el) => el.removeAttribute("inert"));
      inerted.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  // One span per word, so they can travel separately. (Same markup as the home headline.)
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: DECIDE_SCRIPT }} />
      <div
        ref={rootRef}
        className={`ni${go ? " ni-go" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Welcome"
        onClick={enter}
      >
        <p className="ni-line" aria-hidden="true">
          <HeadlineWords headline={headline} wordClassName="ni-w" wordData={{ "data-ni-word": "" }} />
        </p>
        <button type="button" className="ni-btn" data-ni-enter>
          Enter site
        </button>
      </div>
    </>
  );
}
