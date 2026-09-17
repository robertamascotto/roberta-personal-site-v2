import Link from "next/link";
import { getSocialIcon } from "@/lib/socialIcons";
import { DEFAULT_NAVIGATION_LINKS } from "@/lib/constants";
import { toValidNavLinks, toValidSocialLinks, type NavigationLink, type SocialLink } from "@/lib/types";
import AnimateOnScroll from "@/components/AnimateOnScroll";

interface FooterCTA {
  heading?: string | null;
  linkText?: string | null;
  linkUrl?: string | null;
}

interface FooterLabels {
  navigationHeading?: string | null;
  contactHeading?: string | null;
  copyrightText?: string | null;
}

interface FooterProps {
  siteName?: string;
  footerTagline?: string | null;
  footerCTA?: FooterCTA | null;
  socialLinks?: (SocialLink | null)[] | null;
  navigationLinks?: (NavigationLink | null)[] | null;
  footerLabels?: FooterLabels | null;
}

const defaultFooterTagline = "Lifestyle and ecommerce photographer crafting visual stories that connect brands with their audience.";

const defaultFooterCTA = {
  heading: "Ready to start a project?",
  linkText: "Let's talk",
  linkUrl: "/contact",
};

const defaultFooterLabels = {
  navigationHeading: "Navigation",
  contactHeading: "Get in Touch",
};

export default function Footer({
  siteName = "Roberta",
  footerTagline,
  footerCTA,
  socialLinks,
  navigationLinks,
  footerLabels,
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const validSocialLinks = toValidSocialLinks(socialLinks || []);
  const validNavLinks = toValidNavLinks(navigationLinks || DEFAULT_NAVIGATION_LINKS);

  const tagline = footerTagline || defaultFooterTagline;
  const cta = {
    heading: footerCTA?.heading || defaultFooterCTA.heading,
    linkText: footerCTA?.linkText || defaultFooterCTA.linkText,
    linkUrl: footerCTA?.linkUrl || defaultFooterCTA.linkUrl,
  };
  const labels = {
    navigationHeading: footerLabels?.navigationHeading || defaultFooterLabels.navigationHeading,
    contactHeading: footerLabels?.contactHeading || defaultFooterLabels.contactHeading,
  };

  return (
    <footer className="bg-cream-dark mt-auto">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-28">
        {/* Accent rule */}
        <AnimateOnScroll>
          <div className="w-16 h-px bg-accent mb-12" />
        </AnimateOnScroll>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-16">
          {/* Brand Column */}
          <AnimateOnScroll className="md:col-span-5">
            <Link
              href="/"
              className="font-display text-3xl md:text-4xl font-light text-warm-gray hover:text-accent transition-colors duration-500 inline-block mb-4"
              style={{ transitionTimingFunction: "var(--ease-luxe)" }}
            >
              {siteName}
            </Link>
            <p className="text-sm text-warm-gray-light leading-relaxed max-w-xs mb-6">
              {tagline}
            </p>
            {/* Social Links */}
            {validSocialLinks.length > 0 && (
              <div className="flex gap-3">
                {validSocialLinks.map((social) => (
                  <a
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 flex items-center justify-center rounded-full border border-warm-gray-lighter/30 text-warm-gray-light hover:text-accent hover:border-accent transition-all duration-300"
                    style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                    aria-label={social.platform}
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </AnimateOnScroll>

          {/* Navigation Column */}
          <AnimateOnScroll delay={100} className="md:col-span-3 md:col-start-7">
            <nav aria-label="Footer">
              <h3 className="text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter mb-6">
                {labels.navigationHeading}
              </h3>
              <ul className="space-y-1">
                {validNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-warm-gray-light hover:text-warm-gray transition-colors duration-300 inline-block py-2"
                      style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </AnimateOnScroll>

          {/* Contact Column */}
          <AnimateOnScroll delay={200} className="md:col-span-4">
            <h3 className="text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter mb-6">
              {labels.contactHeading}
            </h3>
            <p className="text-sm text-warm-gray-light mb-4">
              {cta.heading}
            </p>
            <Link
              href={cta.linkUrl}
              className="inline-flex items-center gap-2 text-sm text-warm-gray hover:text-accent transition-colors duration-300 group"
              style={{ transitionTimingFunction: "var(--ease-luxe)" }}
            >
              <span>{cta.linkText}</span>
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </Link>
          </AnimateOnScroll>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-warm-gray-lighter/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-warm-gray-lighter">
              &copy; {currentYear} {siteName}. {footerLabels?.copyrightText || "All rights reserved."}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
