"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import "./movement.css";

export interface Clip {
  url: string;
  name: string;
  caption: string;
  /** the section it belongs to ("Movement" for the reel, then "Brand films", ...) */
  group: string;
  /** running time in seconds and width / height, measured ahead of time (lib/movementClips.json) so the page does not have to open every video to lay out the timeline */
  duration?: number;
  aspect?: number;
}

const GAP = 3; // px between clips on the timeline
const TH = 112; // height of a clip's film strip on the timeline
const SECTION_SECONDS = 30; // ruler tick spacing

const two = (n: number) => String(n).padStart(2, "0");
/** 00:MM:SS:FF like an editing timecode (25 frames a second) */
const timecode = (t: number) => {
  const s = Math.max(0, t);
  return `00:${two(Math.floor(s / 60))}:${two(Math.floor(s % 60))}:${two(Math.floor((s % 1) * 25))}`;
};

interface Geometry {
  left: number[];
  width: number[];
  start: number[];
  total: number;
}

/** Lays the clips out along the timeline: each clip's width is its share of the total running time. */
function layout(durations: number[], lineWidth: number): Geometry {
  const n = durations.length;
  const total = durations.reduce((a, b) => a + b, 0);
  const avail = Math.max(0, lineWidth - GAP * (n - 1));
  const left: number[] = [];
  const width: number[] = [];
  const start: number[] = [];
  let x = 0;
  let acc = 0;
  durations.forEach((d) => {
    const w = (avail * d) / total;
    left.push(x);
    width.push(w);
    start.push(acc);
    x += w + GAP;
    acc += d;
  });
  return { left, width, start, total };
}

/**
 * Movement: the film fills the page and an editing timeline runs along its bottom edge. Every clip of the
 * page sits on the timeline in order (the reel first, then each section). Pointing at the timeline changes
 * nothing (the film keeps playing); clicking a clip plays it from that point, clicking a section name plays
 * that section from its first video. Clicking the film pauses it.
 * Clips do not loop: when one ends the next one follows, and after the last one it starts again from the
 * reel. Starts muted.
 */
export default function MovementCinema({ clips }: { clips: Clip[] }) {
  const n = clips.length;
  const vids = useRef<(HTMLVideoElement | null)[]>([]);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const frames = useRef<({ images: HTMLImageElement[]; tw: number } | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timecodeRef = useRef<HTMLSpanElement>(null);

  const sel = useRef(0); // the clip that is playing
  const act = useRef(0); // the clip on screen
  const durRef = useRef<number[]>(clips.map((c) => c.duration ?? 15));
  const geoRef = useRef<Geometry | null>(null);

  const [shown, setShown] = useState(0);
  const [paused, setPaused] = useState(false); // the film is stopped: show a play mark so it never looks frozen
  const pz = useRef({ since: 0, shown: false });
  const [sound, setSound] = useState(false);
  const [aspects, setAspects] = useState<number[]>(() => clips.map((c) => c.aspect ?? 16 / 9)); // width / height of every clip
  const [durations, setDurations] = useState<number[]>(() => clips.map((c) => c.duration ?? 15));
  const [lineWidth, setLineWidth] = useState(0);
  const [framesVersion, setFramesVersion] = useState(0);

  const geo = useMemo(() => (lineWidth > 0 ? layout(durations, lineWidth) : null), [durations, lineWidth]);
  geoRef.current = geo;

  const show = useCallback((i: number) => {
    act.current = i;
    setShown(i);
  }, []);

  const playSel = useCallback(() => {
    vids.current.forEach((v, k) => {
      if (v && k !== sel.current) v.pause();
    });
    show(sel.current);
    vids.current[sel.current]?.play().catch(() => {});
  }, [show]);

  // A clip's video is only opened when it is about to be needed (playing now, or next in line), never all at once.
  const ensureSrc = useCallback(
    (i: number) => {
      const v = vids.current[i];
      if (v && !v.getAttribute("src")) {
        v.preload = "auto";
        v.src = clips[i].url;
      }
    },
    [clips]
  );

  const choose = useCallback(
    (i: number, fr: number) => {
      sel.current = i;
      show(i);
      vids.current.forEach((v, k) => {
        if (v && k !== i) v.pause();
      });
      ensureSrc(i);
      const v = vids.current[i];
      if (v) {
        v.currentTime = fr * (durRef.current[i] ?? 0);
        v.play().catch(() => {});
      }
    },
    [show, ensureSrc]
  );

  // on a phone the timeline scrolls sideways: keep the clip that is playing in view
  useEffect(() => {
    const bar = barRef.current;
    const g = geoRef.current;
    if (!bar || !g || bar.scrollWidth <= bar.clientWidth + 2) return;
    bar.scrollTo({ left: Math.max(0, g.left[shown] - 20), behavior: "smooth" });
  }, [shown]);

  // keep the timeline's width up to date
  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;
    const update = () => setLineWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // start the first clip, make the film strips, and correct a clip's length / shape if the real file differs
  useEffect(() => {
    let cancelled = false;
    const list = vids.current.filter((v): v is HTMLVideoElement => !!v);
    const cleanups: (() => void)[] = [];
    list.forEach((v, i) => {
      const onMeta = () => {
        const d = v.duration;
        if (isFinite(d) && d > 0 && Math.abs(d - durRef.current[i]) > 0.2) {
          durRef.current[i] = d;
          setDurations([...durRef.current]);
        }
        const ar = v.videoWidth / v.videoHeight;
        if (ar > 0) setAspects((prev) => (Math.abs((prev[i] ?? 0) - ar) < 0.01 ? prev : prev.map((x, k) => (k === i ? ar : x))));
      };
      v.addEventListener("loadedmetadata", onMeta);
      cleanups.push(() => v.removeEventListener("loadedmetadata", onMeta));
    });

    ensureSrc(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) playSel();

    // the film strips are small pictures made ahead of time (scripts/build-movement-thumbs.mjs), so the page never
    // has to read the videos for them; a clip without pictures simply shows a plain dark block
    clips.forEach((clip, i) => {
      const hash = clip.url.split("/").pop()?.replace(/\.mp4$/, "");
      if (!hash) return;
      const images = [0, 1, 2].map(() => new Image());
      let loaded = 0;
      images.forEach((img, k) => {
        img.onload = () => {
          if (cancelled || ++loaded < 3) return;
          frames.current[i] = { images, tw: Math.max(20, images[0].naturalWidth) };
          setFramesVersion((x) => x + 1);
        };
        img.src = `/movement/thumbs/${hash}-${k}.jpg`;
      });
    });

    return () => {
      cancelled = true;
      cleanups.forEach((f) => f());
      list.forEach((v) => v.pause());
    };
  }, [clips, playSel, ensureSrc]);

  // draw the film strips on the timeline
  useLayoutEffect(() => {
    frames.current.forEach((f, i) => {
      const cv = canvases.current[i];
      if (!f || !cv) return;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      const count = Math.ceil(cv.width / f.tw);
      for (let k = 0; k < count; k++) ctx.drawImage(f.images[Math.min(2, Math.floor((k / count) * 3))], k * f.tw, 0);
    });
  }, [geo, framesVersion]);

  // the red playhead follows what is playing; if a clip stops moving for 8 seconds (a very slow connection or a
  // slow video host) the next clip starts instead of the page freezing for good
  const stall = useRef({ i: -1, t: -1, at: 0 });
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const g = geoRef.current;
      const v = vids.current[act.current];

      // show the play mark only when the film has really been stopped for a moment (not between two clips)
      const stopped = !!v && v.paused && !v.ended;
      const z = pz.current;
      if (stopped) {
        if (!z.since) z.since = performance.now();
        else if (!z.shown && performance.now() - z.since > 350) {
          z.shown = true;
          setPaused(true);
        }
      } else {
        z.since = 0;
        if (z.shown) {
          z.shown = false;
          setPaused(false);
        }
      }

      if (g && v) {
        const i = act.current;
        // with a few seconds to go, get the next clip ready so it can follow straight away
        if (v.duration - v.currentTime < 6) ensureSrc((i + 1) % vids.current.length);
        const d = durRef.current[i] || 1;
        if (playheadRef.current) playheadRef.current.style.left = `${g.left[i] + g.width[i] * (v.currentTime / d)}px`;
        if (timecodeRef.current) timecodeRef.current.textContent = timecode(g.start[i] + v.currentTime);

        const s = stall.current;
        if (v.paused || v.ended || s.i !== i || Math.abs(v.currentTime - s.t) > 0.05) {
          stall.current = { i, t: v.currentTime, at: performance.now() };
        } else if (v.currentTime > 0.5 && performance.now() - s.at > 8000) {
          stall.current = { i: -1, t: -1, at: 0 };
          choose((i + 1) % vids.current.length, 0);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [choose, ensureSrc]);

  const pointer = (e: React.MouseEvent) => {
    const g = geoRef.current;
    const line = lineRef.current;
    if (!g || !line) return null;
    const r = line.getBoundingClientRect();
    const px = (e.clientX - r.left) * (line.clientWidth / r.width);
    let j = g.left.findIndex((l, i) => px >= l && px <= l + g.width[i] + GAP);
    if (j < 0) j = px < 0 ? 0 : g.left.length - 1;
    return { px, j, fr: Math.max(0, Math.min(1, (px - g.left[j]) / g.width[j])), g };
  };

  const onClickLine = (e: React.MouseEvent) => {
    const p = pointer(e);
    if (p) choose(p.j, p.fr);
  };
  /** the right-hand edge of the section that starts at clip `i` */
  const sectionEnd = (i: number, g: Geometry) => {
    let j = i;
    while (j + 1 < n && clips[j + 1].group === clips[i].group) j++;
    return g.left[j] + g.width[j];
  };
  const toggleFilm = () => {
    const v = vids.current[act.current];
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") choose((sel.current + 1) % n, 0);
    else if (e.key === "ArrowLeft") choose((sel.current - 1 + n) % n, 0);
    else if (e.key === " " && e.target === e.currentTarget) {
      e.preventDefault();
      toggleFilm();
    }
  };

  // ruler ticks and section names
  const ruler = useMemo(() => {
    if (!geo) return [];
    const ticks: { px: number; label: string }[] = [];
    for (let t = 0; t <= geo.total; t += SECTION_SECONDS) {
      let i = geo.start.findIndex((s, k) => t < s + (durations?.[k] ?? 0));
      if (i < 0) i = geo.left.length - 1;
      const px = geo.left[i] + geo.width[i] * ((t - geo.start[i]) / (durations?.[i] ?? 1));
      ticks.push({ px, label: timecode(t).slice(3, 8) });
    }
    return ticks;
  }, [geo, durations]);

  return (
    <section className="mv-cin" aria-label="Movement: video work" tabIndex={0} onKeyDown={onKey}>
      <div className="mv-mon" onClick={toggleFilm}>
        {clips.map((c, i) => (
          <video
            key={c.url}
            ref={(el) => {
              vids.current[i] = el;
            }}
            className={`mv-v${shown === i ? " on" : ""}${(aspects[i] ?? 2) < 1 ? " v" : ""}`}
            muted={!sound}
            onEnded={() => {
              // keep going: the next clip follows (after the last one it starts again from the reel)
              if (sel.current === i) choose((i + 1) % n, 0);
            }}
            playsInline
            aria-label={c.name}
          />
        ))}
        <span className={`mv-play${paused ? " on" : ""}`} aria-hidden="true" />
      </div>

      <span className="mv-tc" ref={timecodeRef} aria-hidden="true">
        00:00:00:00
      </span>
      <button
        type="button"
        className="mv-snd"
        aria-pressed={sound}
        onClick={(e) => {
          e.stopPropagation();
          setSound((s) => !s);
        }}
      >
        Sound {sound ? "on" : "off"}
      </button>

      {/* on a vertical clip the writing stays in the black strip beside the picture (its width is worked out from the clip's shape) */}
      <div
        className={`mv-info${(aspects[shown] ?? 2) < 1 ? " v" : ""}`}
        style={{ "--ar": aspects[shown] ?? 1.78 } as CSSProperties}
      >
        <b>{clips[shown]?.name}</b>
        <p>{clips[shown]?.caption}</p>
      </div>

      <div className="mv-bar" ref={barRef}>
        <div
          className="mv-line"
          ref={lineRef}
          onClick={onClickLine}
          style={{ "--tot": durations.reduce((a, b) => a + b, 0) } as CSSProperties}
        >
          <div className="mv-ruler" aria-hidden="true">
            {ruler.map((t) => (
              <span key={t.px}>
                <i style={{ left: t.px }} />
                <em style={{ left: t.px + 4 }}>{t.label}</em>
              </span>
            ))}
          </div>
          <div className="mv-trk">
            {geo &&
              clips.map((c, i) => (
                <span key={c.url}>
                  {(i === 0 || clips[i - 1].group !== c.group) && (
                    <button
                      type="button"
                      className="mv-gl"
                      style={{ left: geo.left[i], width: sectionEnd(i, geo) - geo.left[i] }}
                      onClick={(e) => {
                        e.stopPropagation();
                        choose(i, 0);
                      }}
                    >
                      {c.group}
                    </button>
                  )}
                  <div className={`mv-clip${shown === i ? " sel" : ""}`} style={{ left: geo.left[i], width: geo.width[i] }}>
                    <canvas
                      ref={(el) => {
                        canvases.current[i] = el;
                      }}
                      width={Math.ceil(geo.width[i])}
                      height={TH}
                    />
                  </div>
                </span>
              ))}
          </div>
          <div className="mv-ph" ref={playheadRef} aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
