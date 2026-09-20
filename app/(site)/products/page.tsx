import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { getProductCaseStudies, safeFetch } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import PageHero from "@/components/PageHero";
import AspectImage from "@/components/gallery/AspectImage";

export const metadata: Metadata = {
  title: "Products",
  description: "Ecommerce and lookbook photography for clothing and jewelry brands.",
  alternates: { canonical: "/products" },
};

export default async function ProductsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const caseStudies = await safeFetch(getProductCaseStudies(isPreview), []);
  const [featured, ...rest] = caseStudies;

  return (
    <PageContainer>
      <PageHero
        label="Products"
        headline={"Ecommerce and lookbook photography\nfor clothing and jewelry brands."}
        maxWidth="max-w-[1000px]"
        compactOnMobile
      />

      <section className="pb-24">
        {featured && (
          <div className="mb-12">
            <Link href={`/products/${featured.slug}`} className="block no-underline min-[641px]:!max-w-[50%]">
              <AspectImage image={featured.coverImage} alt={featured.coverAlt} aspectRatio="16/9" priority />
            </Link>
            <div className="flex justify-end mt-3 mb-5">
              <Link
                href={`/products/${featured.slug}`}
                className="text-[13px] font-semibold tracking-[0.04em] no-underline border-b border-ink pb-[2px]"
              >
                See more &#8594;
              </Link>
            </div>
            <h2 className="font-accent italic font-light text-[32px] leading-[1.2] m-0 mb-1">{featured.title}</h2>
            <p className="text-[13px] text-ink/55 m-0">
              {[featured.categoryLabel, featured.yearRange].filter(Boolean).join(" · ")}
            </p>
          </div>
        )}

        {rest.length > 0 && (
          <div className="grid grid-cols-1 min-[641px]:grid-cols-2 gap-9 min-[641px]:gap-x-7 min-[641px]:gap-y-10">
            {rest.map((cs) => (
              <div key={cs._id} className="flex flex-col gap-3.5">
                <div>
                  <Link href={`/products/${cs.slug}`} className="block no-underline min-[641px]:!max-w-[50%]">
                    <AspectImage image={cs.coverImage} alt={cs.coverAlt} aspectRatio="4/5" />
                  </Link>
                  <div className="flex justify-end mt-3">
                    <Link
                      href={`/products/${cs.slug}`}
                      className="text-[13px] font-semibold tracking-[0.04em] no-underline border-b border-ink pb-[2px]"
                    >
                      See more &#8594;
                    </Link>
                  </div>
                </div>
                <div>
                  <h2 className="font-accent italic font-light text-[26px] leading-[1.2] m-0 mb-1">{cs.title}</h2>
                  <p className="text-[13px] text-ink/55 m-0">{[cs.categoryLabel, cs.yearRange].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {caseStudies.length === 0 && <p className="text-ink/60">No case studies yet.</p>}
      </section>
    </PageContainer>
  );
}
