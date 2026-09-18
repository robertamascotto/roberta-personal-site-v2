"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSocialIcon } from "@/lib/socialIcons";
import { DEFAULT_NAVIGATION_LINKS } from "@/lib/constants";
import { toValidNavLinks, toValidSocialLinks, type NavigationLink, type SocialLink } from "@/lib/types";

interface FooterLabels {
  copyrightText?: string | null;
}

interface FooterProps {
  footerTagline?: string | null;
  footerDescription?: string | null;
  socialLinks?: (SocialLink | null)[] | null;
  navigationLinks?: (NavigationLink | null)[] | null;
  email?: string;
  footerLabels?: FooterLabels | null;
}

const defaults = {
  footerTagline: "Photography and content strategy for fashion and lifestyle brands.",
  footerDescription: "Editorial, campaign, and product photography, backed by social strategy and content planning.",
};

export default function Footer({
  footerTagline,
  footerDescription,
  socialLinks,
  navigationLinks,
  email,
  footerLabels,
}: FooterProps) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  const validSocialLinks = toValidSocialLinks(socialLinks || []);
  const validNavLinks = toValidNavLinks(navigationLinks || DEFAULT_NAVIGATION_LINKS);

  const tagline = footerTagline || defaults.footerTagline;
  const description = footerDescription || defaults.footerDescription;

  // The Home page builds its own bottom bar (see app/(site)/page.tsx) instead
  // of this shared footer — the design's Home.dc.html has no <footer> at all.
  if (pathname === "/") return null;

  return (
    <footer className="border-t border-ink/[0.08] px-[clamp(20px,5vw,64px)] pt-14 pb-10 max-[640px]:!pb-24 flex flex-col items-center text-center">
      <p className="font-accent italic font-light text-[clamp(18px,1.9vw,25px)] leading-[1.35] mb-3.5">{tagline}</p>
      <p className="font-body text-[13px] leading-[21px] text-ink/58 mb-6">{description}</p>

      {validSocialLinks.length > 0 && (
        <div className="flex gap-2.5 mb-[26px]">
          {validSocialLinks.map((social) => (
            <a
              key={social.platform}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-[34px] h-[34px] rounded-full border border-ink/25 flex items-center justify-center text-ink hover:border-ink transition-colors"
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
          className="font-body text-sm font-semibold no-underline text-ink inline-flex items-center gap-2 mb-7"
        >
          Let&apos;s talk <span>&#8594;</span>
        </a>
      )}

      <nav aria-label="Footer" className="flex gap-[18px] flex-wrap justify-center mb-[18px]">
        <Link href="/" className="font-body text-[13px] no-underline text-ink hover:text-ink/55">
          Home
        </Link>
        {validNavLinks.map((link) => (
          <Link key={link.href} href={link.href} className="font-body text-[13px] no-underline text-ink hover:text-ink/55">
            {link.label}
          </Link>
        ))}
      </nav>

      <p className="font-body text-[11px] text-ink/50">
        &copy; {currentYear} Roberta Mascotto. {footerLabels?.copyrightText || "All rights reserved."}
      </p>
    </footer>
  );
}
