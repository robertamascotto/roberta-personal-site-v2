import { redirect } from "next/navigation";
import { isHiddenEditorial } from "@/lib/constants";

/**
 * Editorials now all live on one long page (/editorials), one after the other, so each
 * shoot's old address sends people to its place on that page. (redirect() is a temporary
 * 307, so search engines keep the old addresses' history.)
 */
export default async function EditorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(isHiddenEditorial(slug) ? "/editorials" : `/editorials#${slug}`);
}
