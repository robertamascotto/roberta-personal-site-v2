"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_NAVIGATION_LINKS } from "@/lib/constants";
import { toValidNavLinks, type NavigationLink } from "@/lib/types";

interface NavigationProps {
  siteName?: string;
  navigationLinks?: (NavigationLink | null)[] | null;
  email?: string;
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

export default function Navigation({ siteName, navigationLinks, email }: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const links = toValidNavLinks(navigationLinks || DEFAULT_NAVIGATION_LINKS);
  const monogram = getMonogram(siteName);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      hamburgerRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
        hamburgerRef.current?.focus();
      }
    },
    [isMobileMenuOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;
    const menu = mobileMenuRef.current;
    const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])';

    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = menu.querySelectorAll<HTMLElement>(focusableSelector);
      const all = hamburgerRef.current ? [hamburgerRef.current, ...Array.from(focusables)] : Array.from(focusables);
      if (all.length === 0) return;
      const first = all[0];
      const last = all[all.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleTrap);
    return () => document.removeEventListener("keydown", handleTrap);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        id="rm-nav"
        className="fixed top-0 left-0 right-0 z-[100] flex items-center px-5 py-4 min-[641px]:px-[44px] min-[641px]:py-7 transition-[background-color,backdrop-filter,border-color] duration-300"
        style={{
          backgroundColor: isScrolled ? "rgba(253,253,252,0.7)" : "transparent",
          backdropFilter: isScrolled ? "blur(10px)" : "none",
          WebkitBackdropFilter: isScrolled ? "blur(10px)" : "none",
          borderBottom: `1px solid ${isScrolled ? "rgba(17,17,16,0.08)" : "transparent"}`,
        }}
      >
        <div className="flex items-center gap-5 min-[641px]:gap-5 font-body text-[13px] tracking-[0.06em] uppercase w-full min-[641px]:w-auto justify-between min-[641px]:justify-start">
          <Link
            href="/"
            className="flex-none bg-ink flex items-center justify-center px-1.5 pt-1"
            aria-label="Home"
          >
            <span className="font-mark font-bold text-2xl leading-[0.84] tracking-[-0.01em] text-white block">
              {monogram}
            </span>
          </Link>

          <div className="hidden min-[641px]:flex items-center gap-5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`no-underline hover:text-ink/55 transition-colors outline-none focus-visible:border-b focus-visible:border-ink focus-visible:pb-[2px] ${
                    isActive ? "border-b border-ink pb-[2px]" : ""
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            ref={hamburgerRef}
            onClick={() => setIsMobileMenuOpen((v) => !v)}
            className="min-[641px]:hidden flex flex-col justify-center gap-[5px] w-11 h-11 p-0 border-0 bg-transparent cursor-pointer"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="rm-mobile-menu"
          >
            <span
              className="block w-[22px] h-[1.5px] bg-ink transition-transform duration-300"
              style={{ transform: isMobileMenuOpen ? "translateY(3px) rotate(45deg)" : "none" }}
            />
            <span
              className="block w-[22px] h-[1.5px] bg-ink transition-transform duration-300"
              style={{ transform: isMobileMenuOpen ? "translateY(-3px) rotate(-45deg)" : "none" }}
            />
          </button>
        </div>
      </nav>

      <div
        ref={mobileMenuRef}
        id="rm-mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-[99] min-[641px]:hidden bg-paper flex-col justify-center gap-1 px-6 transition-opacity duration-300 ${
          isMobileMenuOpen ? "flex opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none hidden"
        }`}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-heading font-bold text-[38px] leading-[1.15] uppercase no-underline text-ink"
          >
            {link.label}
          </Link>
        ))}
        {email && (
          <a
            href={`mailto:${email}`}
            className="mt-7 font-body text-[13px] tracking-[0.06em] uppercase text-ink/55 no-underline"
          >
            {email}
          </a>
        )}
      </div>
    </>
  );
}
