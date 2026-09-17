import React from "react";
import type { Metadata } from "next";
import { Oswald, Big_Shoulders_Display, Spectral, Poppins, IBM_Plex_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import "../globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import BackToTop from "@/components/BackToTop";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { SITE_URL } from "@/lib/constants";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const bigShoulders = Big_Shoulders_Display({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-big-shoulders",
  display: "swap",
});

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  preload: false,
  display: "swap",
});

const fontVariables = [
  oswald.variable,
  bigShoulders.variable,
  spectral.variable,
  poppins.variable,
  ibmPlexMono.variable,
].join(" ");

const defaultMetadata = {
  title: "Roberta Mascotto — Photography & Content Strategy",
  description: "Photography and content strategy for fashion and lifestyle brands.",
};

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfigSafe();

  const title = siteConfig?.siteName || defaultMetadata.title;
  const description = siteConfig?.siteMetadata?.siteDescription || defaultMetadata.description;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: siteConfig?.siteMetadata?.siteTitleTemplate || `%s — ${title}`,
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

  return (
    <html lang="en" className={fontVariables}>
      <body className="font-sans min-h-screen flex flex-col bg-paper text-ink antialiased">
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
          email={siteConfig?.email || undefined}
        />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <BackToTop />
        <Footer
          footerTagline={siteConfig?.footerTagline}
          footerDescription={siteConfig?.footerDescription}
          socialLinks={siteConfig?.socialLinks}
          navigationLinks={siteConfig?.navigationLinks}
          email={siteConfig?.email || undefined}
          footerLabels={siteConfig?.footerLabels}
        />
      </body>
    </html>
  );
}
