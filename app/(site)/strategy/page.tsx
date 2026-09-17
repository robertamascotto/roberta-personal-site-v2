import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getContentStrategyPage, safeFetch } from "@/studio/lib/helpers";
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
  const page = await safeFetch(getContentStrategyPage(isPreview), null);

  return (
    <PageContainer>
      <PageHero
        label={page?.heroLabel || "Content Strategy"}
        headline={page?.heroHeadline || "Planning the content, not just shooting it."}
        body={page?.heroBody}
        maxWidth="max-w-[64ch]"
      />

      <div className="pb-16">
        {page?.sections?.map((section, i) => (
          <section key={i} className="border-t border-ink/12 pt-14 pb-[72px]">
            <h2 className="font-accent italic font-light text-[34px] leading-[1.2] m-0 mb-4">{section.heading}</h2>
            <p className="text-[15px] leading-[25px] text-ink/72 mb-8 whitespace-pre-line">{section.body}</p>

            {section.stats && section.stats.length > 0 && (
              <div className="flex flex-wrap gap-10 mb-8">
                {section.stats.map((stat, j) => (
                  <div key={j}>
                    <div className="font-heading font-black text-[26px] leading-none">{stat.value}</div>
                    <div className="font-body text-[9.5px] tracking-[0.06em] uppercase text-ink/50 mt-1">{stat.label}</div>
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
