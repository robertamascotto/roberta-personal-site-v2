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
      <div className="py-12 md:py-16">
        <div className="max-w-xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-light tracking-wide mb-8">
            Get in Touch
          </h1>
          <p className="text-warm-gray-light mb-12">
            Interested in working together? I&apos;d love to hear from you.
          </p>
          <p className="text-warm-gray-light">
            Add your contact information through the{" "}
            <a href="/studio" className="text-accent hover:text-accent-dark underline">
              studio
            </a>
            .
          </p>
        </div>
      </div>
    );
  }
}
