import { MetadataRoute } from "next";
import { SITE_URL, isHiddenHref } from "@/lib/constants";

export const revalidate = 3600;

// Editorials and Products are each one long page now, so there are no per-project addresses to list.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ["/editorials", "/products", "/movement", "/strategy", "/contact"]
    .filter((path) => !isHiddenHref(path))
    .map((path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

  return [{ url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }, ...pages];
}
