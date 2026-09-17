import React from "react";
import type { Metadata } from "next";
import {
  Inter,
  Cormorant_Garamond,
  Montserrat,
  League_Spartan,
  Source_Sans_3,
  Playfair_Display,
  DM_Sans,
  DM_Serif_Display,
  Rubik_Glitch,
  Lora,
  Raleway,
  Libre_Baskerville,
  Karla,
  Bodoni_Moda,
  Work_Sans,
  Syne,
  Space_Grotesk,
  Outfit,
  Fraunces,
  Tenor_Sans,
  EB_Garamond,
  Jost,
  Newsreader,
} from "next/font/google";
import { draftMode } from "next/headers";
import "../globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { SITE_URL } from "@/lib/constants";
import { buildThemeStyles } from "@/lib/themePresets";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-cormorant",
  preload: false,
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  preload: false,
  display: "swap",
});

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  preload: false,
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  preload: false,
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  preload: false,
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  preload: false,
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-dm-serif",
  preload: false,
  display: "swap",
});

const rubikGlitch = Rubik_Glitch({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-rubik-glitch",
  preload: false,
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  preload: false,
  display: "swap",
});

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  preload: false,
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-libre-baskerville",
  preload: false,
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
  preload: false,
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-bodoni-moda",
  preload: false,
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  preload: false,
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  preload: false,
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  preload: false,
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  preload: false,
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  preload: false,
  display: "swap",
});

const tenorSans = Tenor_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tenor-sans",
  preload: false,
  display: "swap",
});

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  preload: false,
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  preload: false,
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  preload: false,
  display: "swap",
});

const fontVariables = [
  inter.variable,
  cormorant.variable,
  montserrat.variable,
  leagueSpartan.variable,
  sourceSans.variable,
  playfairDisplay.variable,
  dmSans.variable,
  dmSerif.variable,
  rubikGlitch.variable,
  lora.variable,
  raleway.variable,
  libreBaskerville.variable,
  karla.variable,
  bodoniModa.variable,
  workSans.variable,
  syne.variable,
  spaceGrotesk.variable,
  outfit.variable,
  fraunces.variable,
  tenorSans.variable,
  ebGaramond.variable,
  jost.variable,
  newsreader.variable,
].join(" ");

// Default metadata values
const defaultMetadata = {
  title: "Roberta Photography",
  description: "Photography portfolio showcasing moments that tell stories",
};

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfigSafe();

  const title = siteConfig?.siteName || defaultMetadata.title;
  const description = siteConfig?.siteMetadata?.siteDescription || defaultMetadata.description;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: siteConfig?.siteMetadata?.siteTitleTemplate || `%s | ${title}`,
    },
    description,
    openGraph: {
      siteName: title,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export const revalidate = 3600; // Revalidate every hour

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isPreview } = await draftMode();
  const siteConfig = await getSiteConfigSafe(isPreview);

  const theme = siteConfig?.theme;
  const themeStyles = buildThemeStyles(
    theme?.backgroundColor,
    theme?.textColor,
    theme?.accentColor,
    theme?.fontPairing,
    theme?.themePreset
  );

  return (
    <html lang="en" className={fontVariables} style={themeStyles as React.CSSProperties}>
      <body className="font-sans min-h-screen flex flex-col bg-cream text-warm-gray antialiased">
        {isPreview && (
          <div
            role="status"
            aria-live="polite"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 9999,
              backgroundColor: "#C4961A",
              color: "#3D2B00",
              padding: "10px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              fontSize: "14px",
              fontWeight: 500,
              letterSpacing: "0.02em",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <span>Preview Mode — You are viewing draft content.</span>
            <a
              href="/api/disable-draft"
              style={{
                color: "#3D2B00",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                whiteSpace: "nowrap",
                fontWeight: 600,
              }}
            >
              Exit Preview
            </a>
          </div>
        )}
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: siteConfig?.siteName || defaultMetadata.title,
              url: SITE_URL,
              description: siteConfig?.siteMetadata?.siteDescription || defaultMetadata.description,
            }),
          }}
        />
        <Navigation
          siteName={siteConfig?.siteName || undefined}
          navigationLinks={siteConfig?.navigationLinks}
          mobileTagline={siteConfig?.mobileTagline}
        />
        <main id="main-content" tabIndex={-1} className="flex-1 px-6 md:px-12 pb-12">
          <div className="max-w-6xl mx-auto">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
        <BackToTop />
        <Footer
          siteName={siteConfig?.siteName || undefined}
          footerTagline={siteConfig?.footerTagline}
          footerCTA={siteConfig?.footerCTA}
          socialLinks={siteConfig?.socialLinks}
          navigationLinks={siteConfig?.navigationLinks}
          footerLabels={siteConfig?.footerLabels}
        />
      </body>
    </html>
  );
}
