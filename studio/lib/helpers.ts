import type { SanityClient } from "sanity";
import { getClient } from "../client";
import { siteConfigQuery, tagsQuery, photosQuery, photosByCategoryQuery } from "./queries";
import { generateSlug } from "./validators";

export interface SiteConfig {
  siteName?: string;
  email?: string;
  socialLinks?: { platform?: string; url?: string }[];
  footerTagline?: string;
  footerCTA?: { heading?: string; linkText?: string; linkUrl?: string };
  navigationLinks?: { label?: string; href?: string }[];
  mobileTagline?: string;
  homePage?: {
    heroTagline?: string;
    heroImage?: unknown;
    heroImageLqip?: string;
    heroHeadline?: string;
    heroSubtitle?: string;
    heroTaglineColor?: string;
    heroHeadlineColor?: string;
    heroSubtitleColor?: string;
  };
  contactPage?: {
    sectionLabel?: string;
    heading?: string;
    introText?: string;
    location?: string;
    availability?: string;
    quote?: string;
    formLabels?: { name?: string; email?: string; projectType?: string; message?: string; submitButton?: string };
    formPlaceholders?: { name?: string; email?: string; projectType?: string; message?: string };
    projectTypes?: string[];
    successMessage?: string;
    errorMessage?: string;
    contactInfoHeading?: string;
    emailLabel?: string;
    locationLabel?: string;
    availabilityLabel?: string;
    socialLabel?: string;
  };
  footerLabels?: { navigationHeading?: string; contactHeading?: string; copyrightText?: string };
  uiLabels?: {
    portfolioHeading?: string;
    allPhotosLabel?: string;
    noPhotos?: string;
    noImages?: string;
  };
  siteMetadata?: { siteDescription?: string; siteTitleTemplate?: string };
  theme?: { themePreset?: string; backgroundColor?: string; textColor?: string; accentColor?: string; fontPairing?: string };
  portfolioLayout?: string;
  portfolioColumns?: number;
  portfolioAspectRatio?: string;
  categoryOverrides?: { category: string; portfolioLayout?: string; portfolioColumns?: number; portfolioAspectRatio?: string }[];
}

export interface Tag {
  _id: string;
  label: string;
  slug: string;
  sortOrder?: number;
}

export interface Photo {
  _id: string;
  src: string;
  lqip?: string;
  alt: string;
  caption?: string;
  date?: string;
  sortOrder?: number;
  featured?: boolean;
  tags?: Tag[];
}

export async function getSiteConfig(preview = false): Promise<SiteConfig> {
  return getClient(preview).fetch(siteConfigQuery);
}

export async function getSiteConfigSafe(preview = false): Promise<SiteConfig | null> {
  try {
    return await getSiteConfig(preview);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Could not fetch site config:", error);
    }
    return null;
  }
}

export async function getTags(preview = false): Promise<Tag[]> {
  return getClient(preview).fetch(tagsQuery);
}

export async function getPhotos(preview = false): Promise<Photo[]> {
  return getClient(preview).fetch(photosQuery);
}

export async function getPhotosByCategory(category: string, preview = false): Promise<Photo[]> {
  return getClient(preview).fetch(photosByCategoryQuery, { category });
}

export async function createTag(
  client: SanityClient,
  label: string
): Promise<{ _id: string; label: string }> {
  const slug = generateSlug(label);
  const doc = await client.create({
    _type: "tag",
    label,
    slug: { _type: "slug", current: slug },
    sortOrder: 99,
  });
  return { _id: doc._id, label };
}

export function categoryTone(
  slug: string
): "default" | "primary" | "positive" | "caution" | "critical" {
  switch (slug) {
    case "e-commerce":
      return "primary";
    case "campaigns":
      return "positive";
    case "branded-content":
      return "caution";
    default:
      return "default";
  }
}
