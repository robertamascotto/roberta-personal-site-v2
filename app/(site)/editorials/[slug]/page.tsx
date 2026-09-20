import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { draftMode } from "next/headers";
import { getEditorialBySlug, getEditorialNeighbors, safeFetch } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import AspectImage from "@/components/gallery/AspectImage";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const editorial = await safeFetch(getEditorialBySlug(slug), null);
  if (!editorial) return {};
  return {
    title: editorial.title,
    description: editorial.description,
    alternates: { canonical: `/editorials/${slug}` },
  };
}

export default async function EditorialDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const [editorial, neighbors] = await Promise.all([
    safeFetch(getEditorialBySlug(slug, isPreview), null),
    safeFetch(getEditorialNeighbors(isPreview), []),
  ]);

  if (!editorial) notFound();

  const currentIndex = neighbors.findIndex((n) => n.slug === slug);
  const next = neighbors.length > 1 ? neighbors[(currentIndex + 1) % neighbors.length] : null;

  return (
    <>
      <PageContainer>
        <div className="flex justify-between border-b border-ink/12 pt-6 pb-8 min-[641px]:!border-b-0 min-[641px]:!pt-9 min-[641px]:!pb-12 text-[13px]">
          <Link href="/editorials" className="no-underline">
            &#8592; All editorials
          </Link>
          {next && (
            <Link href={`/editorials/${next.slug}`} className="no-underline">
              {next.title} &#8594;
            </Link>
          )}
        </div>

        <section className="pt-14 pb-12">
          <h1 className="font-heading font-black text-[clamp(34px,4.2vw,52px)] leading-none tracking-[-0.01em] m-0 mb-1.5">
            {editorial.title}
          </h1>
          {editorial.year && <span className="block mb-5 font-body text-xs tracking-[0.1em] text-ink/32">{editorial.year}</span>}
          {editorial.description && (
            <p className="text-[15px] leading-[25px] text-ink/72 whitespace-pre-line m-0">{editorial.description}</p>
          )}
        </section>
      </PageContainer>

      <div className="full-bleed flex flex-col pb-24" style={{ gap: editorial.galleryGap ?? 12 }}>
        {editorial.gallery?.map((frame, i) => (
          <AspectImage
            key={i}
            image={frame.image}
            alt={frame.alt}
            aspectRatio={frame.aspectRatio}
            priority={i === 0}
            sizes="100vw"
          />
        ))}
      </div>

      <div className="max-w-[1240px] mx-auto px-[clamp(20px,5vw,64px)] flex justify-between border-t border-ink/12 pt-8 pb-16 min-[641px]:!border-t-0 min-[641px]:!pt-12 min-[641px]:!pb-24 text-[13px]">
        <Link href="/editorials" className="no-underline">
          &#8592; All editorials
        </Link>
        {next && (
          <Link href={`/editorials/${next.slug}`} className="no-underline">
            {next.title} &#8594;
          </Link>
        )}
      </div>
    </>
  );
}
