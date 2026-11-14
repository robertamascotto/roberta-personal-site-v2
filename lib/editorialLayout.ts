/**
 * How each editorial sits on the Editorials page. Every project gets the same 2:1 rectangle:
 *  - "single": its big photo fills the rectangle; the other photos follow to the right in two rows (scroll or drag sideways)
 *  - "fit":    all photos in two rows, trimmed a little so they fill the rectangle edge to edge
 *  - "scroll": two rows you scroll or drag sideways
 * `pick` is the photo shown big (its position in the shoot), `pos` where to keep it when it is trimmed, and
 * `rows` the exact photos in each row (their positions in the shoot). `photoCount` guards `rows`: if photos were
 * added or removed in Sanity, the page falls back to an automatic arrangement.
 * Projects not listed here use "scroll" and go after the listed ones.
 */
export const EDITORIAL_ORDER = ["bloom-in-the-dark", "tinted", "strike", "portrait-series", "busy-signal", "west-village"];

export type EditorialMode = "single" | "fit" | "scroll";

export interface EditorialPlan {
  mode: EditorialMode;
  pick?: number;
  pos?: string;
  rows?: number[][];
  photoCount?: number;
}

export const EDITORIAL_PLAN: Record<string, EditorialPlan> = {
  // her whole head in the frame: trim more from the bottom, less from the top
  "bloom-in-the-dark": { mode: "single", pick: 0, pos: "50% 3%" },
  // blue and bright photos mixed in both rows, a dark photo under "View all"
  // (8 photos since her own pairs replaced the verticals; blue and bright alternate in both rows)
  tinted: { mode: "fit", rows: [[0, 2, 3, 4], [1, 5, 6, 7]], photoCount: 8 },
  // the close-up (second photo of the lower row)
  strike: { mode: "single", pick: 2 },
  // a darker portrait under "View all"
  "portrait-series": {
    mode: "scroll",
    rows: [
      [0, 2, 4, 6, 8, 10],
      [1, 9, 5, 7, 3, 11],
    ],
    photoCount: 12,
  },
  "busy-signal": { mode: "single", pick: 0 },
  "west-village": { mode: "scroll" },
};

export function sortEditorials<T extends { slug: string }>(items: T[]): T[] {
  const rank = (slug: string) => {
    const i = EDITORIAL_ORDER.indexOf(slug);
    return i === -1 ? EDITORIAL_ORDER.length : i;
  };
  return items
    .map((item, index) => ({ item, index }))
    .sort((a, b) => rank(a.item.slug) - rank(b.item.slug) || a.index - b.index)
    .map(({ item }) => item);
}
