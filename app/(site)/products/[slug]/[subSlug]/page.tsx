import { redirect } from "next/navigation";

/** The old "see all" page for a set: its photos are on the project's section of /products now. */
export default async function ProductSubGalleryPage({ params }: { params: Promise<{ slug: string; subSlug: string }> }) {
  const { slug, subSlug } = await params;
  redirect(`/products#${slug}-${subSlug}`);
}
