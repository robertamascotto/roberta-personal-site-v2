import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { draftMode } from "next/headers";
import { getProductSubGallery, safeFetch } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import LightboxGrid from "@/components/gallery/LightboxGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}): Promise<Metadata> {
  const { slug, subSlug } = await params;
  const sub = await safeFetch(getProductSubGallery(slug, subSlug), null);
  if (!sub) return {};
  return {
    title: `${sub.title} — ${sub.parent.title}`,
    alternates: { canonical: `/products/${slug}/${subSlug}` },
  };
}

export default async function ProductSubGalleryPage({
  params,
}: {
  params: Promise<{ slug: string; subSlug: string }>;
}) {
  const { slug, subSlug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const sub = await safeFetch(getProductSubGallery(slug, subSlug, isPreview), null);

  if (!sub) notFound();

  const siblingIndex = sub.siblings.findIndex((s) => s.slug === subSlug);
  const prevSibling = siblingIndex > 0 ? sub.siblings[siblingIndex - 1] : null;

  return (
    <PageContainer>
      <div className="flex justify-between border-b border-ink/12 pt-6 pb-8 text-[13px]">
        {prevSibling ? (
          <Link href={`/products/${slug}/${prevSibling.slug}`} className="no-underline">
            &#8592; {prevSibling.title}
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/products/${slug}`} className="no-underline">
          {sub.parent.title} &#8594;
        </Link>
      </div>

      <section className="pt-6 pb-12 max-w-[64ch]">
        <h1 className="font-heading font-black text-[clamp(34px,4.2vw,52px)] leading-none tracking-[-0.01em] m-0">
          {sub.title}
        </h1>
      </section>

      <section className="pb-24">
        <LightboxGrid images={sub.fullGallery} />
      </section>

      <div className="flex justify-between border-t border-ink/12 pt-8 pb-16 text-[13px]">
        {prevSibling ? (
          <Link href={`/products/${slug}/${prevSibling.slug}`} className="no-underline">
            &#8592; {prevSibling.title}
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/products/${slug}`} className="no-underline">
          {sub.parent.title} &#8594;
        </Link>
      </div>
    </PageContainer>
  );
}
