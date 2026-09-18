/**
 * Next.js custom image loader for Sanity-hosted images.
 *
 * `src` is a bare Sanity asset URL (no sizing params — see `urlFor(image).url()`).
 * Next calls this per responsive breakpoint it needs; we hand sizing off to
 * Sanity's own CDN so every visitor gets an appropriately sized file instead
 * of one fixed-resolution image for everyone.
 */
module.exports = function sanityImageLoader({ src, width }) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", "92");
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
};
