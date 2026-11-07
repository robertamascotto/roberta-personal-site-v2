import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfigSafe } from "@/studio/lib/helpers";
import ContactPageClient from "@/components/ContactPageClient";
import { SITE_NAME } from "@/lib/constants";

const CONTACT_DESCRIPTION =
  "Get in touch with Roberta Mascotto about fashion, editorial and campaign photography.";

export const metadata: Metadata = {
  title: "Contact",
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: "/contact",
  },
};

export default async function ContactPage() {
  try {
    const siteConfig = await getSiteConfigSafe();
    if (!siteConfig) throw new Error("No config");
    return <ContactPageClient siteConfig={siteConfig} />;
  } catch (error) {
    console.error("Could not fetch site config:", error);
    return (
      <div className="max-w-[1240px] mx-auto px-5 md:px-[clamp(20px,5vw,64px)] pt-[90px] pb-24">
        <div className="max-w-xl">
          <h1 className="font-title font-bold text-[clamp(20px,2.6vw,32px)] leading-[1.15] tracking-[-0.03em] mb-6">
            Let&apos;s talk
          </h1>
          <p className="text-ink/60 mb-6">
            Add your contact information through the{" "}
            <Link href="/studio" className="underline">
              studio
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }
}
