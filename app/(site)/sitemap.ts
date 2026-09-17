import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["/editorials", "/products", "/movement", "/strategy", "/contact"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })
  );

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...staticPages,
  ];
}
