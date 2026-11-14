import React from "react";
import type { Metadata } from "next";
import { Oswald, Anton, DM_Sans } from "next/font/google";
import { draftMode } from "next/headers";
import "../globals.css";
import Navigation from "@/components/Navigation";
import DateStamp from "@/components/DateStamp";
import SiteFooter from "@/components/SiteFooter";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import { SITE_URL, SITE_NAME, HOME_TITLE, HOME_DESCRIPTION } from "@/lib/constants";

// Three fonts only: Anton for the big words, DM Sans for everything small, Oswald for the RM mark.
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-oswald",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-dm-sans",
  display: "swap",
});

const fontVariables = [oswald.variable, anton.variable, dmSans.variable].join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfigSafe();

  const description = siteConfig?.siteMetadata?.siteDescription || HOME_DESCRIPTION;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    title: {
      default: HOME_TITLE,
      template: siteConfig?.siteMetadata?.siteTitleTemplate || `%s | ${SITE_NAME}`,
    },
    description,
    openGraph: {
      siteName: SITE_NAME,
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
    // suppressHydrationWarning: the intro's inline script sets data-intro on <html> before React loads.
    <html lang="en" className={fontVariables} suppressHydrationWarning>
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
        <Navigation
          siteName={siteConfig?.siteName || undefined}
          navigationLinks={siteConfig?.navigationLinks}
          email={siteConfig?.email || undefined}
          socials={siteConfig?.socialLinks || undefined}
        />
        {/* On a computer, every page sits to the right of the menu column. Pages change with a plain cut: no fade. */}
        <main id="main-content" tabIndex={-1} className="flex-1" style={{ paddingLeft: "var(--menu-col)" }}>
          {children}
        </main>
        <SiteFooter email={siteConfig?.email || undefined} socials={siteConfig?.socialLinks || undefined} />
        <DateStamp />
      </body>
    </html>
  );
}
