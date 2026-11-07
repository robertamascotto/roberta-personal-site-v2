/**
 * Planning for the editorial collage: the photos are dealt into columns so that every
 * column comes out the same height, which makes the whole collage a clean rectangle.
 * Photos are trimmed a little (top and bottom) to make that exact.
 *
 * The plan is plain numbers, computed on the server, and the page lays it out with
 * CSS alone (flex-grow in each column), so there is no layout jump and no JavaScript is
 * needed for the layout.
 */

export interface PhotoShape {
  /** width / height of the photo as shot */
  ar: number;
}

export interface PlannedTile {
  /** position in the shoot's original order (used by the full-screen viewer) */
  index: number;
  /** how much of the column's height this photo gets (its natural height, in relative units) */
  grow: number;
}

export interface ColumnPlan {
  columns: PlannedTile[][];
  /** width / height of the whole rectangle */
  aspect: number;
}

type SanityImage = {
  asset?: { _ref?: string };
  crop?: { top?: number; bottom?: number; left?: number; right?: number };
  hotspot?: { x?: number; y?: number };
};

/** The photo's real size, read from its Sanity asset id (e.g. image-abc123-3456x5184-jpg). */
export function imageDimensions(image: unknown): { w: number; h: number } | null {
  const img = image as SanityImage | null | undefined;
  const ref = img?.asset?._ref;
  const m = ref?.match(/-(\d+)x(\d+)-[a-z0-9]+$/i);
  if (!m) return null;
  let w = Number(m[1]);
  let h = Number(m[2]);
  const c = img?.crop;
  if (c) {
    w *= 1 - (c.left ?? 0) - (c.right ?? 0);
    h *= 1 - (c.top ?? 0) - (c.bottom ?? 0);
  }
  return w > 0 && h > 0 ? { w, h } : null;
}

/** Where the photo should stay centred when it has to be trimmed (the editor's focal point if set). */
export function focalPoint(image: unknown): [number, number] {
  const hs = (image as SanityImage | null | undefined)?.hotspot;
  if (hs && typeof hs.x === "number" && typeof hs.y === "number") return [hs.x * 100, hs.y * 100];
  return [50, 35]; // portraits usually have the face in the upper part
}

// A small seeded random generator, so the same photos always give the same arrangement.
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deal the photos into `columnCount` columns of (almost) equal height.
 * `refWidth` and `gap` describe the collage in pixels; they only matter for the small
 * effect the gaps have on the heights.
 */
export function planColumns(
  shapes: PhotoShape[],
  columnCount: number,
  refWidth = 920,
  gap = 8
): ColumnPlan {
  const n = shapes.length;
  const nc = Math.max(1, Math.min(columnCount, n));
  const cw = (refWidth - (nc - 1) * gap) / nc;
  const nat = shapes.map((s) => cw / s.ar);

  type Candidate = { dev: number; assign: number[]; mean: number };
  const evaluate = (assign: number[]): Candidate | null => {
    const sums = new Array(nc).fill(0);
    const counts = new Array(nc).fill(0);
    assign.forEach((c, i) => {
      sums[c] += nat[i];
      counts[c] += 1;
    });
    if (counts.some((x) => x < 1)) return null;
    const totals = sums.map((s, c) => s + (counts[c] - 1) * gap);
    const mean = totals.reduce((a, b) => a + b, 0) / nc;
    // how far each column has to be stretched or squeezed to reach the common height
    const dev = Math.max(...sums.map((s, c) => Math.abs(Math.log((mean - (counts[c] - 1) * gap) / s))));
    return { dev, assign, mean };
  };

  // Start from the usual "put it in the shortest column", then try many random deals.
  const heights = new Array(nc).fill(0);
  const greedy = shapes.map((_, i) => {
    const c = heights.indexOf(Math.min(...heights));
    heights[c] += nat[i] + gap;
    return c;
  });
  let best = evaluate(greedy);
  const rnd = seededRandom(1234567);
  for (let t = 0; t < 6000; t++) {
    const candidate = evaluate(shapes.map(() => Math.floor(rnd() * nc)));
    if (candidate && (!best || candidate.dev < best.dev)) best = candidate;
  }
  if (!best) best = { dev: 0, assign: shapes.map((_, i) => i % nc), mean: 1 };

  const columns: PlannedTile[][] = Array.from({ length: nc }, () => []);
  best.assign.forEach((c, i) => columns[c].push({ index: i, grow: nat[i] }));
  return { columns, aspect: refWidth / best.mean };
}
