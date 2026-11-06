import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import {
  getEditorials,
  getProductCaseStudies,
  getProductCaseStudyBySlug,
  safeFetch,
} from "@/studio/lib/helpers";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [editorials, caseStudies] = await Promise.all([
    safeFetch(getEditorials(), []),
    safeFetch(getProductCaseStudies(), []),
  ]);
  const caseStudyDetails = await Promise.all(
    caseStudies.map((cs) => safeFetch(getProductCaseStudyBySlug(cs.slug), null))
  );

  const staticPages = ["/editorials", "/products", "/movement", "/strategy", "/contact"].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })
  );

  const editorialPages = editorials.map((e) => ({
    url: `${SITE_URL}/editorials/${e.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const productPages = caseStudies.flatMap((cs, i) => [
    {
      url: `${SITE_URL}/products/${cs.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    },
    ...(caseStudyDetails[i]?.subGalleries ?? []).map((sub) => ({
      url: `${SITE_URL}/products/${cs.slug}/${sub.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]);

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...staticPages,
    ...editorialPages,
    ...productPages,
  ];
}
