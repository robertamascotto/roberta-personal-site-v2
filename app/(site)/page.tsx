import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import HomeHero from "@/components/home/HomeHero";
import ProjectTeaserRow from "@/components/home/ProjectTeaserRow";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteConfig = await getSiteConfigSafe();
    const heroImage = siteConfig?.homePage?.heroImage;
    const heroImageUrl = heroImage ? urlFor(heroImage).url() : undefined;

    return {
      alternates: { canonical: "/" },
      openGraph: {
        ...(heroImageUrl ? { images: [{ url: heroImageUrl }] } : {}),
      },
    };
  } catch {
    return { alternates: { canonical: "/" } };
  }
}

const defaultTagline = "Photography and content strategy for fashion and lifestyle brands.";
const defaultDescription = "Editorial, campaign, and product photography, backed by social strategy and content planning.";

export default async function HomePage() {
  const { isEnabled: isPreview } = await draftMode();
  const siteConfig = await getSiteConfigSafe(isPreview);
  const homePage = siteConfig?.homePage;
  const heroImageUrl = homePage?.heroImage ? urlFor(homePage.heroImage).url() : undefined;
  const projects = homePage?.featuredProjects;

  return (
    <div>
      <HomeHero
        headline={homePage?.heroHeadline || "Roberta Mascotto"}
        heroImageUrl={heroImageUrl}
        heroImageLqip={homePage?.heroImageLqip}
      />

      <div className="border-t border-ink/10 bg-paper px-5 md:px-11 pt-24 pb-14 md:pt-28">
        <div className="max-w-[46ch] mx-auto text-center mb-14 md:mb-24">
          <h2 className="font-accent italic font-light text-[clamp(26px,3vw,38px)] leading-[1.3] tracking-[-0.005em] m-0 mb-5">
            {siteConfig?.footerTagline || defaultTagline}
          </h2>
          <p className="font-body text-[15px] leading-6 text-ink/58 m-0">
            {siteConfig?.footerDescription || defaultDescription}
          </p>
        </div>

        <div className="max-w-[1240px] mx-auto">
          <ProjectTeaserRow
            href="/editorials"
            label="Editorial"
            blurb="Fashion and portrait editorials shot on location, built around mood, light, and character."
            image={projects?.editorial?.image}
            videoUrl={projects?.editorial?.videoUrl}
          />
          <ProjectTeaserRow
            href="/products"
            label="Products"
            blurb="Ecommerce and product photography for fashion and jewelry brands, spanning studio and on-location work."
            image={projects?.products?.image}
            videoUrl={projects?.products?.videoUrl}
            reversed
          />
          <ProjectTeaserRow
            href="/movement"
            label="Movement"
            blurb="Short-form video and reels, including behind-the-scenes footage from shoots in studio and on location."
            image={projects?.movement?.image}
            videoUrl={projects?.movement?.videoUrl}
          />
          <ProjectTeaserRow
            href="/strategy"
            label="Strategy"
            blurb="Social planning and content strategy that turns shoots into a consistent brand presence."
            image={projects?.strategy?.image}
            videoUrl={projects?.strategy?.videoUrl}
            reversed
          />
        </div>
      </div>
    </div>
  );
}
