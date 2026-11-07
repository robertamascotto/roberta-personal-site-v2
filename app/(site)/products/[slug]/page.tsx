import { redirect } from "next/navigation";

/**
 * Products is one long page now, so each project's old address sends people to its place on
 * that page. (redirect() is a temporary 307, so search engines keep the old addresses' history.)
 */
export default async function ProductCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/products#${slug}`);
}
