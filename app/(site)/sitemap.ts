import { MetadataRoute } from "next";
import { SITE_URL, CATEGORIES } from "@/lib/constants";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const categoryPages = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/portfolio/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...categoryPages,
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];
}
