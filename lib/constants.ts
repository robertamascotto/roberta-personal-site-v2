export const SITE_NAME = "Roberta Mascotto";

export const DEFAULT_SITE_URL = "https://www.robertamascotto.com";

export const HOME_TITLE = "Roberta Mascotto | Fashion and Editorial Photographer";

export const HOME_DESCRIPTION =
  "Fashion and editorial photographer based in New York. Editorial, campaign and product photography, plus content strategy for fashion and lifestyle brands.";

// Canonical URLs, the sitemap, robots.txt and structured data all derive from
// this. NEXT_PUBLIC_SITE_URL may override it (e.g. localhost in dev), but a
// missing, malformed or *.vercel.app value falls back to the real domain so a
// Vercel address can never leak into canonical tags or the sitemap.
function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return DEFAULT_SITE_URL;
  try {
    const { hostname, origin } = new URL(raw);
    if (hostname.endsWith(".vercel.app")) return DEFAULT_SITE_URL;
    return origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

// Pages that are switched off for now. They disappear from the menu, footer, home
// page and sitemap, and visiting them sends people (temporarily) to the home page.
// The page code and its Sanity content are untouched: to bring a page back, just
// remove its path from this list.
export const HIDDEN_PAGES: readonly string[] = ["/strategy"];

export function isHiddenHref(href: string | null | undefined): boolean {
  if (!href) return false;
  const path = href.split(/[?#]/)[0].replace(/\/+$/, "") || "/";
  return HIDDEN_PAGES.includes(path);
}

// Editorials that are switched off for now: they disappear from the Editorials page
// and the sitemap, and their address sends people to the Editorials page. Their
// content stays in Sanity untouched; remove a slug from this list to bring it back.
export const HIDDEN_EDITORIALS: readonly string[] = ["in-session"];

export function isHiddenEditorial(slug: string | null | undefined): boolean {
  return !!slug && HIDDEN_EDITORIALS.includes(slug);
}

export const DEFAULT_NAVIGATION_LINKS = [
  { href: "/editorials", label: "Editorials" },
  { href: "/products", label: "Products" },
  { href: "/movement", label: "Movement" },
  { href: "/strategy", label: "Strategy" },
  { href: "/contact", label: "Contact" },
];
