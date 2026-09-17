import { sanitizeUrl } from "@/lib/urlSanitizer";

export interface NavigationLink {
  label?: string | null;
  href?: string | null;
}

export interface ValidNavigationLink {
  label: string;
  href: string;
}

export interface SocialLink {
  platform?: string | null;
  url?: string | null;
}

export interface ValidSocialLink {
  platform: string;
  url: string;
}

export function toValidNavLinks(
  links: (NavigationLink | null)[]
): ValidNavigationLink[] {
  return links
    .filter(
      (link): link is NavigationLink =>
        link !== null && !!link?.href && !!link?.label
    )
    .map((link) => ({
      label: link.label as string,
      href: sanitizeUrl(link.href),
    }))
    .filter((link): link is ValidNavigationLink => !!link.href);
}

export function toValidSocialLinks(
  links: (SocialLink | null)[]
): ValidSocialLink[] {
  return links
    .filter(
      (link): link is SocialLink => link !== null && !!link?.url
    )
    .map((link) => ({
      platform: link.platform || "Other",
      url: sanitizeUrl(link.url),
    }))
    .filter((link): link is ValidSocialLink => !!link.url);
}
