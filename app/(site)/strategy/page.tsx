import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getContentStrategyPage, safeFetch } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import PageHero from "@/components/PageHero";
import FeedPhoneSection from "@/components/strategy/FeedPhoneSection";
import ProcessSection from "@/components/strategy/ProcessSection";
import ResearchAudienceSection from "@/components/strategy/ResearchAudienceSection";
import BrandGuidelinesSection from "@/components/strategy/BrandGuidelinesSection";
import ReportSection from "@/components/strategy/ReportSection";

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

      {page?.feedSection && (
        <FeedPhoneSection media={page.feedSection.media} phoneImage={page.feedSection.phoneImage} />
      )}

      {page?.processSection && (
        <ProcessSection sectionLabel={page.processSection.sectionLabel} steps={page.processSection.steps} />
      )}

      {page?.researchAudienceSection && (
        <ResearchAudienceSection
          sectionLabel={page.researchAudienceSection.sectionLabel}
          heading={page.researchAudienceSection.heading}
          intro={page.researchAudienceSection.intro}
          researchItems={page.researchAudienceSection.researchItems}
          corePersona={page.researchAudienceSection.corePersona}
          secondaryPersonas={page.researchAudienceSection.secondaryPersonas}
        />
      )}

      {page?.brandGuidelinesSection && (
        <BrandGuidelinesSection
          sectionLabel={page.brandGuidelinesSection.sectionLabel}
          heading={page.brandGuidelinesSection.heading}
          intro={page.brandGuidelinesSection.intro}
          rows={page.brandGuidelinesSection.rows}
        />
      )}

      {page?.reportSection && (
        <ReportSection
          sectionLabel={page.reportSection.sectionLabel}
          heading={page.reportSection.heading}
          intro={page.reportSection.intro}
          reportLabel={page.reportSection.reportLabel}
          dateRange={page.reportSection.dateRange}
          kpis={page.reportSection.kpis}
          monthlyBars={page.reportSection.monthlyBars}
          pillars={page.reportSection.pillars}
        />
      )}

      {!page && <p className="text-ink/60 pb-24">Add Content Strategy page content in the Studio.</p>}
    </PageContainer>
  );
}
