/**
 * Sizes for the full-screen photo viewer. Only a few standard widths are requested so each
 * one gets cached on Sanity's CDN after the first request, and no photo is ever asked for
 * with more pixels than the screen can show.
 */
export const VIEWER_SIZES = [1200, 1600, 2000, 2400, 3200] as const;
export const VIEWER_QUALITY = 85;

/** Side space (in px) around the photo in the viewer at a given screen width. */
export function viewerMargin(screenWidth: number): number {
  // Keep in step with --vm in components/gallery/editorial-collage.css
  return screenWidth <= 640 ? Math.min(48, Math.max(16, screenWidth * 0.06)) : Math.min(220, Math.max(16, screenWidth * 0.12));
}

/** The smallest standard width that still looks sharp at this screen size. */
export function viewerWidth(screenWidth: number, pixelRatio: number): number {
  const needed = (screenWidth - 2 * viewerMargin(screenWidth)) * Math.min(pixelRatio || 1, 2);
  return VIEWER_SIZES.find((w) => w >= needed) ?? VIEWER_SIZES[VIEWER_SIZES.length - 1];
}

/** A Sanity image URL (bare asset URL from urlFor(...).url()) resized by Sanity's CDN. */
export function resizedUrl(baseUrl: string, width: number, quality = VIEWER_QUALITY): string {
  const url = new URL(baseUrl);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}
