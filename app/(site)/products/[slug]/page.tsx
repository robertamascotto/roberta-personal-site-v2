import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { draftMode } from "next/headers";
import { getProductCaseStudyBySlug, getProductCaseStudyNeighbors } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import AspectImage from "@/components/gallery/AspectImage";
import GalleryBlockRenderer from "@/components/gallery/GalleryBlockRenderer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await getProductCaseStudyBySlug(slug);
  if (!caseStudy) return {};
  return {
    title: caseStudy.title,
    description: caseStudy.description,
    alternates: { canonical: `/products/${slug}` },
  };
}

export default async function ProductCaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { isEnabled: isPreview } = await draftMode();
  const [caseStudy, neighbors] = await Promise.all([
    getProductCaseStudyBySlug(slug, isPreview),
    getProductCaseStudyNeighbors(isPreview),
  ]);

  if (!caseStudy) notFound();

  const currentIndex = neighbors.findIndex((n) => n.slug === slug);
  const prev = neighbors.length > 1 ? neighbors[(currentIndex - 1 + neighbors.length) % neighbors.length] : null;
  const next = neighbors.length > 1 ? neighbors[(currentIndex + 1) % neighbors.length] : null;

  return (
    <PageContainer>
      <div className="pt-6">
        <Link href="/products" className="text-[13px] no-underline">
          &#8592; All products
        </Link>
      </div>

      <section className="pt-6 pb-10 max-w-[64ch]">
        <h1 className="font-heading font-black text-[clamp(34px,4.2vw,52px)] leading-none tracking-[-0.01em] m-0">
          {caseStudy.title}
        </h1>
        {caseStudy.description && (
          <p className="text-[15.5px] leading-[26px] text-ink/75 mt-5 mb-0 whitespace-pre-line">{caseStudy.description}</p>
        )}
      </section>

      <section className="pb-16">
        <GalleryBlockRenderer blocks={caseStudy.gallery} />
      </section>

      {caseStudy.subGalleries && caseStudy.subGalleries.length > 0 && (
        <div className="pb-8">
          {caseStudy.subGalleries.map((sub, i) => (
            <section key={sub.slug} className={`pb-20 ${i > 0 ? "border-t border-ink/10 pt-14" : ""}`}>
              <h2 className="font-accent italic font-light text-[34px] leading-[1.25] tracking-[-0.01em] m-0 mb-4">
                {sub.title}
              </h2>
              {sub.description && (
                <p className="text-[15.5px] leading-[26px] text-ink/75 max-w-[62ch] mb-8 whitespace-pre-line">
                  {sub.description}
                </p>
              )}
              <div className="flex justify-end mb-4">
                <Link
                  href={`/products/${caseStudy.slug}/${sub.slug}`}
                  className="text-[13px] font-semibold no-underline border-b border-ink pb-[2px]"
                >
                  See all &#8594;
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sub.teaserImages?.map((img, j) => (
                  <AspectImage key={j} image={img.image} alt={img.alt} aspectRatio={img.aspectRatio || "3/4"} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <div className="flex justify-between border-t border-ink/10 pt-8 pb-16 text-[13px]">
        {prev ? (
          <Link href={`/products/${prev.slug}`} className="no-underline">
            &#8592; {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/products/${next.slug}`} className="no-underline">
            {next.title} &#8594;
          </Link>
        ) : (
          <Link href="/products" className="no-underline">
            All products &#8594;
          </Link>
        )}
      </div>
    </PageContainer>
  );
}
