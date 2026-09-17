import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { CATEGORIES, getCategoryLabel, type CategorySlug } from "@/lib/constants";
import { getSiteConfigSafe, getTags, getPhotosByCategory } from "@/studio/lib/helpers";
import PortfolioClient from "@/components/PortfolioClient";

interface Props {
  params: Promise<{ category: string }>;
}

function isValidCategory(slug: string): slug is CategorySlug {
  return CATEGORIES.some((c) => c.slug === slug);
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isValidCategory(category)) return {};
  const label = getCategoryLabel(category);
  const siteConfig = await getSiteConfigSafe();
  return {
    title: label,
    description:
      siteConfig?.siteMetadata?.siteDescription ||
      `Browse ${label} photography`,
    alternates: { canonical: `/portfolio/${category}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const label = getCategoryLabel(category);
  const { isEnabled: isPreview } = await draftMode();

  const [siteConfig, allTags, photos] = await Promise.all([
    getSiteConfigSafe(isPreview),
    getTags(isPreview),
    getPhotosByCategory(category, isPreview),
  ]);

  // Filter tags to only those that have photos in this category
  const usedTagIds = new Set(
    photos.flatMap((p) => p.tags?.map((t) => t._id) ?? [])
  );
  const tags = allTags.filter((t) => usedTagIds.has(t._id));

  const noPhotosText =
    siteConfig?.uiLabels?.noPhotos || "No photographs yet.";
  const allLabel = siteConfig?.uiLabels?.allPhotosLabel || "All";
  const override = siteConfig?.categoryOverrides?.find((o) => o.category === category);
  const layout = override?.portfolioLayout ?? siteConfig?.portfolioLayout ?? "masonry";
  const columns = override?.portfolioColumns ?? siteConfig?.portfolioColumns ?? 3;
  const aspectRatio = override?.portfolioAspectRatio ?? siteConfig?.portfolioAspectRatio ?? "natural";

  return (
    <PortfolioClient
      photos={photos}
      tags={tags}
      heading={label}
      noPhotosText={noPhotosText}
      allLabel={allLabel}
      layout={layout}
      columns={columns}
      aspectRatio={aspectRatio}
    />
  );
}
