import type { Metadata } from "next";
import { getSiteConfig, getSiteConfigSafe } from "@/studio/lib/helpers";
import ContactPageClient from "@/components/ContactPageClient";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteConfig = await getSiteConfig();
    const description =
      siteConfig.siteMetadata?.siteDescription ||
      "Get in touch for photography inquiries";
    return {
      title: "Contact",
      description,
      alternates: { canonical: "/contact" },
      openGraph: { type: "website" },
    };
  } catch {
    return {
      title: "Contact",
      description: "Get in touch for photography inquiries",
      alternates: { canonical: "/contact" },
    };
  }
}

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
          <h1 className="font-heading font-black text-[clamp(34px,4.2vw,52px)] leading-none tracking-[-0.01em] mb-6">
            Let&apos;s talk
          </h1>
          <p className="text-ink/60 mb-6">
            Add your contact information through the{" "}
            <a href="/studio" className="underline">
              studio
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}
