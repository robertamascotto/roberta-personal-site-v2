export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.robertamascotto.com";

export const CATEGORIES = [
  { slug: "e-commerce", label: "E-Commerce" },
  { slug: "campaigns", label: "Campaigns" },
  { slug: "branded-content", label: "Branded Content" },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const DEFAULT_NAVIGATION_LINKS = [
  { href: "/portfolio/e-commerce", label: "E-Commerce" },
  { href: "/portfolio/campaigns", label: "Campaigns" },
  { href: "/portfolio/branded-content", label: "Branded Content" },
  { href: "/contact", label: "Contact" },
];
