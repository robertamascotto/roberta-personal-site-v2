import { getClient } from "../client";
import {
  siteConfigQuery,
  editorialsQuery,
  editorialBySlugQuery,
  editorialNeighborsQuery,
  productCaseStudiesQuery,
  productCaseStudyBySlugQuery,
  productCaseStudyNeighborsQuery,
  productSubGalleryBySlugQuery,
  movementPageQuery,
  contentStrategyPageQuery,
} from "./queries";

export interface ProjectTeaser {
  image?: unknown;
  videoUrl?: string;
  blurb?: string;
}

export interface SiteConfig {
  siteName?: string;
  email?: string;
  socialLinks?: { platform?: string; url?: string }[];
  footerTagline?: string;
  footerDescription?: string;
  footerCTA?: { heading?: string; linkText?: string; linkUrl?: string };
  navigationLinks?: { label?: string; href?: string }[];
  mobileTagline?: string;
  homePage?: {
    heroImage?: unknown;
    heroImageLqip?: string;
    heroHeadline?: string;
    featuredProjects?: {
      editorial?: ProjectTeaser;
      products?: ProjectTeaser;
      movement?: ProjectTeaser;
      strategy?: ProjectTeaser;
    };
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
  siteMetadata?: { siteDescription?: string; siteTitleTemplate?: string };
}

export interface ImageWithAspect {
  image: unknown;
  alt: string;
  aspectRatio?: string;
}

export interface EditorialSummary {
  _id: string;
  title: string;
  slug: string;
  year?: string;
  description?: string;
  coverFrames?: ImageWithAspect[];
}

export interface Editorial {
  _id: string;
  title: string;
  slug: string;
  year?: string;
  description?: string;
  gallery?: ImageWithAspect[];
}

export interface EditorialNeighbor {
  slug: string;
  title: string;
}

export type GalleryBlock =
  | ({ _type: "imageWithAspect" } & ImageWithAspect)
  | { _type: "imageGridBlock"; columns: number; images: ImageWithAspect[] }
  | { _type: "scrollStripBlock"; images: ImageWithAspect[] };

export interface ProductCaseStudySummary {
  _id: string;
  title: string;
  slug: string;
  categoryLabel?: string;
  yearRange?: string;
  coverImage: unknown;
  coverAlt: string;
}

export interface ProductSubGallerySummary {
  title: string;
  slug: string;
  description?: string;
  teaserImages?: ImageWithAspect[];
}

export interface ProductCaseStudy {
  _id: string;
  title: string;
  slug: string;
  categoryLabel?: string;
  yearRange?: string;
  description?: string;
  gallery?: GalleryBlock[];
  subGalleries?: ProductSubGallerySummary[];
}

export interface ProductSubGallery {
  title: string;
  slug: string;
  fullGallery: ImageWithAspect[];
  parent: { title: string; slug: string };
  siblings: { title: string; slug: string }[];
}

export interface VideoAsset {
  videoUrl: string;
  poster?: unknown;
  label?: string;
  caption?: string;
  aspectRatio?: "16/9" | "9/16";
}

export interface VideoGroup {
  sectionLabel: string;
  intro?: string;
  layout: "wide-2up" | "vertical-3up" | "mixed";
  videos: VideoAsset[];
}

export interface MovementPage {
  heroLabel?: string;
  heroHeadline?: string;
  heroBody?: string;
  featuredReel?: {
    videoUrl: string;
    tag?: string;
    title: string;
    blurb?: string;
    year?: string;
    linkedEditorialSlug?: string;
  };
  videoGroups?: VideoGroup[];
}

export interface StrategySection {
  heading: string;
  body: string;
  image?: unknown;
  stats?: { label?: string; value?: string }[];
}

export interface ContentStrategyPage {
  heroLabel?: string;
  heroHeadline?: string;
  heroBody?: string;
  sections?: StrategySection[];
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

export async function getEditorials(preview = false): Promise<EditorialSummary[]> {
  return getClient(preview).fetch(editorialsQuery);
}

export async function getEditorialBySlug(slug: string, preview = false): Promise<Editorial | null> {
  return getClient(preview).fetch(editorialBySlugQuery, { slug });
}

export async function getEditorialNeighbors(preview = false): Promise<EditorialNeighbor[]> {
  return getClient(preview).fetch(editorialNeighborsQuery);
}

export async function getProductCaseStudies(preview = false): Promise<ProductCaseStudySummary[]> {
  return getClient(preview).fetch(productCaseStudiesQuery);
}

export async function getProductCaseStudyBySlug(slug: string, preview = false): Promise<ProductCaseStudy | null> {
  return getClient(preview).fetch(productCaseStudyBySlugQuery, { slug });
}

export async function getProductCaseStudyNeighbors(preview = false): Promise<EditorialNeighbor[]> {
  return getClient(preview).fetch(productCaseStudyNeighborsQuery);
}

export async function getProductSubGallery(
  parentSlug: string,
  subSlug: string,
  preview = false
): Promise<ProductSubGallery | null> {
  return getClient(preview).fetch(productSubGalleryBySlugQuery, { parentSlug, subSlug });
}

export async function getMovementPage(preview = false): Promise<MovementPage | null> {
  return getClient(preview).fetch(movementPageQuery);
}

export async function getContentStrategyPage(preview = false): Promise<ContentStrategyPage | null> {
  return getClient(preview).fetch(contentStrategyPageQuery);
}
