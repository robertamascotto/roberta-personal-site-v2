import { permanentRedirect } from "next/navigation";

/**
 * Products is one long page now, so each project's old address sends people to its place on
 * that page. (permanentRedirect() is a permanent 308, so search engines merge the old addresses into /products.)
 */
export default async function ProductCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/products#${slug}`);
}
