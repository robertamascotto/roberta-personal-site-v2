import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import { getSocialIcon } from "@/lib/socialIcons";
import { toValidSocialLinks } from "@/lib/types";
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
const currentYear = new Date().getFullYear();

export default async function HomePage() {
  const { isEnabled: isPreview } = await draftMode();
  const siteConfig = await getSiteConfigSafe(isPreview);
  const homePage = siteConfig?.homePage;
  const heroImageUrl = homePage?.heroImage ? urlFor(homePage.heroImage).url() : undefined;
  const projects = homePage?.featuredProjects;
  const validSocialLinks = toValidSocialLinks(siteConfig?.socialLinks || []);
  const email = siteConfig?.email;

  return (
    <div>
      <HomeHero
        headline={homePage?.heroHeadline || "Roberta Mascotto"}
        heroImageUrl={heroImageUrl}
        heroImageLqip={homePage?.heroImageLqip}
      />

      <div
        className="border-t border-ink/[0.08] px-5 min-[641px]:px-11 pt-[88px] min-[641px]:pt-[176px] pb-9 min-[641px]:pb-12"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="mx-auto text-center mb-14 min-[641px]:mb-[104px]">
          <h2 className="font-accent italic font-light text-[clamp(26px,3vw,38px)] leading-[1.3] tracking-[-0.005em] m-0 mb-[22px] max-w-[46ch] mx-auto">
            {siteConfig?.footerTagline || defaultTagline}
          </h2>
          <p className="font-body text-[15px] leading-6 text-ink/58 m-0 max-w-[60ch] mx-auto">
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
            blurbMaxWidth="48ch"
          />
          <ProjectTeaserRow
            href="/products"
            label="Products"
            blurb="Ecommerce and product photography for fashion and jewelry brands, spanning studio and on-location work, from straightforward product shots to more involved campaign and event-based projects."
            image={projects?.products?.image}
            videoUrl={projects?.products?.videoUrl}
            reversed
            blurbMaxWidth="60ch"
          />
          <ProjectTeaserRow
            href="/movement"
            label="Movement"
            blurb="Short-form video and reels, including behind-the-scenes footage from shoots in studio and on location, made for social and campaign use."
            image={projects?.movement?.image}
            videoUrl={projects?.movement?.videoUrl}
            blurbMaxWidth="48ch"
          />
          <ProjectTeaserRow
            href="/strategy"
            label="Strategy"
            blurb="Social planning and content strategy that turns shoots into a consistent brand presence, covering research, content pillars, and shoot planning."
            image={projects?.strategy?.image}
            videoUrl={projects?.strategy?.videoUrl}
            reversed
            blurbMaxWidth="52ch"
          />

          <div className="flex justify-between items-center pt-9 border-t border-ink/[0.08]">
            {validSocialLinks.length > 0 && (
              <div className="flex gap-3.5">
                {validSocialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-ink/25 flex items-center justify-center text-ink"
                    aria-label={social.platform}
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="font-body text-base font-semibold no-underline text-ink inline-flex items-center gap-2.5"
              >
                Let&apos;s talk <span>&#8594;</span>
              </a>
            )}
          </div>

          <div className="mt-8 border-t border-ink/10 pt-6 font-body text-xs text-ink/50">
            &copy; {currentYear} Roberta Mascotto. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
