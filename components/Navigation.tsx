"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_NAVIGATION_LINKS } from "@/lib/constants";
import { toValidNavLinks, type NavigationLink } from "@/lib/types";

interface NavigationProps {
  siteName?: string;
  navigationLinks?: (NavigationLink | null)[] | null;
  email?: string;
  socials?: { platform?: string; url?: string }[] | null;
}

function getMonogram(siteName?: string): string {
  if (!siteName) return "RM";
  const initials = siteName
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials.slice(0, 2) || "RM";
}

/**
 * The white RM logo (bottom third cropped), the big-letter menu in the black column on the left,
 * and, on small windows and phones, one white MENU box that opens a full-screen black menu.
 */
export default function Navigation({ siteName, navigationLinks, email, socials }: NavigationProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const links = toValidNavLinks(navigationLinks || DEFAULT_NAVIGATION_LINKS);
  const monogram = getMonogram(siteName);
  const isHome = pathname === "/";
  const socialList = (socials || []).filter((x) => x.platform && x.url);

  // leaving a page closes the full-screen menu
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {/* on small screens a soft black fade behind the logo and MENU so they stay readable over photos (not on Home) */}
      {!isHome && <div className="rm-topfade" aria-hidden="true" />}

      <Link href="/" className="rm-logo" aria-label="Home" id="rm-nav">
        <span>{monogram}</span>
      </Link>

      <nav className="rm-menu" aria-label="Main">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={pathname === link.href || pathname.startsWith(link.href + "/") ? "page" : undefined}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <button
        ref={buttonRef}
        type="button"
        className="rm-menubtn"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="rm-overlay"
      >
        <span className="rm-ico" aria-hidden="true" />
      </button>

      <div id="rm-overlay" className="rm-overlay" data-open={open} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <button type="button" className="rm-close" aria-label="Close menu" onClick={() => setOpen(false)}>
          <span className="rm-ico" aria-hidden="true" />
        </button>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="big"
            aria-current={pathname === link.href || pathname.startsWith(link.href + "/") ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <div className="rm-overlay-links">
          {socialList.map((x) => (
            <a key={x.platform} href={x.url} target="_blank" rel="noopener noreferrer">
              {x.platform}
            </a>
          ))}
          {email && <a href={`mailto:${email}`}>Email</a>}
        </div>
      </div>
    </>
  );
}
