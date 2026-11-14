import { permanentRedirect } from "next/navigation";
import { isHiddenEditorial } from "@/lib/constants";

/**
 * Editorials now all live on one long page (/editorials), one after the other, so each
 * shoot's old address sends people to its place on that page. (permanentRedirect() is a permanent
 * 308, so search engines merge the old addresses into /editorials.)
 */
export default async function EditorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(isHiddenEditorial(slug) ? "/editorials" : `/editorials#${slug}`);
}
