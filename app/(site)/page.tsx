import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import HomePageClient from "@/components/HomePageClient";

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
    return {
      alternates: { canonical: "/" },
    };
  }
}

export default async function HomePage() {
  try {
    const { isEnabled: isPreview } = await draftMode();
    const siteConfig = await getSiteConfigSafe(isPreview);
    const homePage = siteConfig?.homePage;
    const heroImageUrl = homePage?.heroImage ? urlFor(homePage.heroImage).url() : undefined;

    return (
      <HomePageClient
        homePage={{
          heroTagline: homePage?.heroTagline,
          heroHeadline: homePage?.heroHeadline,
          heroSubtitle: homePage?.heroSubtitle,
          heroTaglineColor: homePage?.heroTaglineColor,
          heroHeadlineColor: homePage?.heroHeadlineColor,
          heroSubtitleColor: homePage?.heroSubtitleColor,
        }}
        heroImageUrl={heroImageUrl}
        heroImageLqip={homePage?.heroImageLqip || undefined}
      />
    );
  } catch (error) {
    console.error("Could not fetch config:", error);
    return (
      <div className="py-12 md:py-24">
        <section className="text-center mb-16 md:mb-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-wide mb-6">
            Capturing Moments
          </h1>
          <p className="text-lg text-warm-gray-light max-w-2xl mx-auto">
            Photography that tells stories through light, composition, and emotion.
          </p>
        </section>
      </div>
    );
  }
}
