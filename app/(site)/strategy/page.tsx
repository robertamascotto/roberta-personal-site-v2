import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getContentStrategyPage } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import PageHero from "@/components/PageHero";
import AspectImage from "@/components/gallery/AspectImage";

export const metadata: Metadata = {
  title: "Content Strategy",
  description: "Planning the content, not just shooting it.",
  alternates: { canonical: "/strategy" },
};

export default async function ContentStrategyPage() {
  const { isEnabled: isPreview } = await draftMode();
  const page = await getContentStrategyPage(isPreview);

  return (
    <PageContainer>
      <PageHero
        label={page?.heroLabel || "Content Strategy"}
        headline={page?.heroHeadline || "Planning the content, not just shooting it."}
        body={page?.heroBody}
        maxWidth="max-w-3xl"
      />

      <div className="pb-16">
        {page?.sections?.map((section, i) => (
          <section key={i} className="border-t border-ink/10 py-14">
            <h2 className="font-accent italic font-light text-[34px] leading-[1.2] max-w-[26ch] m-0 mb-4">
              {section.heading}
            </h2>
            <p className="text-[15.5px] leading-[26px] text-ink/75 max-w-[62ch] mb-8 whitespace-pre-line">
              {section.body}
            </p>

            {section.stats && section.stats.length > 0 && (
              <div className="flex flex-wrap gap-10 mb-8">
                {section.stats.map((stat, j) => (
                  <div key={j}>
                    <div className="font-heading font-black text-4xl">{stat.value}</div>
                    <div className="font-body text-xs tracking-[0.14em] uppercase text-ink/50 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {section.image ? <AspectImage image={section.image} alt={section.heading} aspectRatio="16/9" /> : null}
          </section>
        ))}
      </div>

      {!page && <p className="text-ink/60 pb-24">Add Content Strategy page content in the Studio.</p>}
    </PageContainer>
  );
}
