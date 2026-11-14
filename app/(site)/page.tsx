import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
// The opening (little squares of her photos, then her name) and the one-screen home page.
import TileIntro from "@/components/TileIntro";
import HomeHero from "@/components/home/HomeHero";
import { SITE_URL, SITE_NAME, HOME_TITLE, HOME_DESCRIPTION } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  let description = HOME_DESCRIPTION;
  let heroImageUrl: string | undefined;

  try {
    const siteConfig = await getSiteConfigSafe();
    description = siteConfig?.siteMetadata?.siteDescription || HOME_DESCRIPTION;
    const heroImage = siteConfig?.homePage?.heroImage;
    heroImageUrl = heroImage ? urlFor(heroImage).url() : undefined;
  } catch {
    // fall back to the defaults above
  }

  return {
    title: { absolute: HOME_TITLE },
    description,
    alternates: { canonical: "/" },
    // A page-level openGraph replaces the layout's wholesale, so site_name
    // and type must be repeated here.
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: HOME_TITLE,
      description,
      url: "/",
      ...(heroImageUrl ? { images: [{ url: heroImageUrl }] } : {}),
    },
  };
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
};

export default async function HomePage() {
  const { isEnabled: isPreview } = await draftMode();
  const siteConfig = await getSiteConfigSafe(isPreview);
  const headline = siteConfig?.homePage?.heroHeadline || "Roberta Mascotto";

  return (
    <div>
      <TileIntro headline={headline} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      <HomeHero headline={headline} />
    </div>
  );
}
