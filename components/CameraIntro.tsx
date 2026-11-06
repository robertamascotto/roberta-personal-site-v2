"use client";

import { useEffect, useRef, useState } from "react";
import { VT323 } from "next/font/google";
import { SITE_NAME } from "@/lib/constants";
import "./camera-intro.css";

const vt323 = VT323({ subsets: ["latin"], weight: "400", display: "swap" });

const STORAGE_KEY = "rmIntroSeen";

/**
 * Runs before first paint (it is inlined in the page HTML). Decides whether this
 * visitor sees the intro: not if they already saw it this browser session, not if
 * they asked for reduced motion, and not for crawlers or speed-test bots. Without
 * JavaScript the attribute is never set, so the intro simply never shows.
 * Adding ?intro=1 to the home page address always plays it (handy for testing).
 */
const DECIDE_SCRIPT = `(function(){var d=document.documentElement;try{var force=/[?&]intro=1(&|$)/.test(location.search);var skip=!force&&(sessionStorage.getItem("${STORAGE_KEY}")||window.matchMedia("(prefers-reduced-motion: reduce)").matches||/bot|crawl|spider|slurp|lighthouse|headless|prerender/i.test(navigator.userAgent));d.setAttribute("data-intro",skip?"off":"on")}catch(e){d.setAttribute("data-intro","off")}})();`;

function setIntroAttr(value: "on" | "off") {
  document.documentElement.setAttribute("data-intro", value);
}

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
 * Rendered by the home page only, so the server never has to work out which page it is
 * building (it can't do that reliably when Vercel rebuilds the page in the background).
 * It only plays when the inline script below ran, which only happens when the home page
 * is the page the visitor actually loaded, never on in-site navigation.
 */
export default function CameraIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const [phase, setPhase] = useState<"idle" | "shot" | "fade" | "fadeFast">("idle");
  const [locked, setLocked] = useState(false);
  const [stamp, setStamp] = useState("");
  const busy = useRef(false);
  const timers = useRef<number[]>([]);
  const inerted = useRef<Element[]>([]);

  const [first, ...rest] = SITE_NAME.split(" ");
  const restName = rest.join(" ");

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
    setIntroAttr("off");
    setGone(true);
  }

  function shoot() {
    if (busy.current) return;
    busy.current = true;
    setPhase("shot"); // everything goes black
    later(() => setPhase("fade"), 150); // a blink of black, then a slow dissolve into the page
    later(finish, 1500);
  }

  function skip() {
    if (busy.current) return;
    busy.current = true;
    setPhase("fadeFast");
    later(finish, 550);
  }

  useEffect(() => {
    // The inline script decides; if it said "off" (or never ran), there is nothing to do.
    if (document.documentElement.getAttribute("data-intro") !== "on") {
      setGone(true);
      return;
    }

    const d = new Date();
    const p = (n: number) => String(n).padStart(2, "0");
    setStamp(`'${p(d.getFullYear() % 100)} ${p(d.getMonth() + 1)} ${p(d.getDate())}`);

    // Keep the page behind the intro out of reach of keyboards and screen readers.
    const root = rootRef.current;
    inerted.current = inertEverythingElse(root);

    root?.querySelector<HTMLButtonElement>("[data-ci-shoot]")?.focus({ preventScroll: true });

    later(() => setLocked(true), 2400); // the focus frame finds the name and locks

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      inerted.current.forEach((el) => el.removeAttribute("inert"));
      inerted.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  const cls = [
    "ci",
    "ci-boot",
    phase === "shot" || phase === "fade" ? "ci-shot" : "",
    phase === "fade" ? "ci-fade" : "",
    phase === "fadeFast" ? "ci-fade-fast" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: DECIDE_SCRIPT }} />
      <div ref={rootRef} className={cls} role="dialog" aria-modal="true" aria-label="Welcome" onClick={shoot}>
        <div className="ci-grid" />
        <div className="ci-subject">
          <p className="ci-word">
            {first}
            {restName ? (
              <>
                {" "}
                <br />
                {restName}
              </>
            ) : null}
          </p>
        </div>
        <div className={`ci-af hunt${locked ? " lock" : ""}`} aria-hidden="true">
          <b />
          <b />
          <b />
          <b />
        </div>

        <div className="ci-hud ci-tl" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M13 2 5 13h6l-1 9 8-12h-6z" /></svg>
          <span className="ci-box">A</span>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8" /><path d="M12 9v4l3 2M9 2h6" /></svg>
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="12" r="3.5" /></svg>
        </div>
        <div className="ci-hud ci-tr" aria-hidden="true">
          <span className="ci-box">12M</span>
          <span className="ci-sd"><svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6z" /><path d="M10 2v5M13 2v5" /></svg></span>
          <span className="ci-sd">0128</span>
          <span className="ci-bat"><i /><i /><i /></span>
        </div>
        <div className="ci-hud ci-hist" aria-hidden="true">
          <svg viewBox="0 0 60 28" style={{ height: "max(26px,3.4cqw)", strokeWidth: 1, fill: "#f1f1ee33" }}>
            <path d="M1 27V24l5-1 4-8 5 4 5-13 5 9 5-3 5 8 4-4 5 5 5-10 5 12 3-2v8z" />
          </svg>
        </div>
        <div className="ci-hud ci-mode" aria-hidden="true">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.6" /><path d="M5 21c1-4.5 4-6.5 7-6.5s6 2 7 6.5" /></svg>
          <svg viewBox="0 0 24 24"><path d="M2 20 9 8l4.5 7 3-4L22 20z" /><circle cx="17" cy="5.5" r="1.8" /></svg>
        </div>
        <div className="ci-hud ci-zm" aria-hidden="true">
          <span>T</span>
          <span className="ci-zbar"><i /></span>
          <span>W</span>
        </div>

        <div className="ci-hud ci-bl" aria-hidden="true">
          <span>1/250</span>
          <span>F2.8</span>
          <span className="ci-iso">ISO AUTO</span>
        </div>
        <div className="ci-hud ci-tc ci-ev" aria-hidden="true">
          <span>AE</span>
          <span className="ci-sc"><i /></span>
          <span>±0</span>
        </div>
        <div className="ci-hud ci-bc">
          <button type="button" className="ci-btn" data-ci-shoot>
            Click to take the shot
          </button>
        </div>
        <div className="ci-hud ci-sk">
          <button
            type="button"
            className="ci-btn"
            onClick={(e) => {
              e.stopPropagation();
              skip();
            }}
          >
            Skip &#9656;
          </button>
        </div>
        <div className="ci-hud ci-br" aria-hidden="true">
          <span className="ci-rec" />
          <span className={`ci-stamp ${vt323.className}`}>{stamp}</span>
        </div>

        <div className="ci-black" />
      </div>
    </>
  );
}
