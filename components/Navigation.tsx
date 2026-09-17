"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DEFAULT_NAVIGATION_LINKS } from "@/lib/constants";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { toValidNavLinks, type NavigationLink } from "@/lib/types";

interface NavigationProps {
  siteName?: string;
  navigationLinks?: (NavigationLink | null)[] | null;
  mobileTagline?: string | null;
}

const defaultMobileTagline = "Lifestyle & Ecommerce Photography";

export default function Navigation({
  siteName = "Roberta",
  navigationLinks,
  mobileTagline,
}: NavigationProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const isOverHero = pathname === "/" && !isScrolled;

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const links = toValidNavLinks(navigationLinks || DEFAULT_NAVIGATION_LINKS);

  const tagline = mobileTagline || defaultMobileTagline;
  const barColor = isOverHero && !isMobileMenuOpen ? "bg-white" : "bg-warm-gray";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change, restore focus
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      hamburgerRef.current?.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Close mobile menu on Escape key, restore focus
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape" && isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      hamburgerRef.current?.focus();
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen || !mobileMenuRef.current) return;

    const menu = mobileMenuRef.current;
    const focusableSelector = 'a[href], button, [tabindex]:not([tabindex="-1"])';

    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusables = menu.querySelectorAll<HTMLElement>(focusableSelector);
      // Include the hamburger button which is outside the menu overlay
      const allFocusables = hamburgerRef.current
        ? [hamburgerRef.current, ...Array.from(focusables)]
        : Array.from(focusables);

      if (allFocusables.length === 0) return;

      const first = allFocusables[0];
      const last = allFocusables[allFocusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTrap);
    return () => document.removeEventListener("keydown", handleTrap);
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? "bg-cream/95 backdrop-blur-sm shadow-[0_1px_0_color-mix(in_srgb,var(--color-warm-gray)_6%,transparent)]"
            : "bg-transparent"
        }`}
        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className={`flex items-center justify-between transition-all duration-700 ${
            isScrolled ? "h-16 md:h-20" : "h-20 md:h-24"
          }`} style={{ transitionTimingFunction: "var(--ease-luxe)" }}>
            {/* Logo - hidden on homepage */}
            <Link
              href="/"
              className={`font-display text-2xl md:text-[1.75rem] font-normal tracking-wide transition-all duration-500 ${
                pathname === "/" ? "opacity-0 pointer-events-none" : "opacity-100"
              } ${isOverHero ? "text-white hover:text-white/80" : "text-warm-gray hover:text-accent"}`}
              style={{ transitionTimingFunction: "var(--ease-luxe)" }}
              tabIndex={pathname === "/" ? -1 : undefined}
              aria-hidden={pathname === "/" ? true : undefined}
            >
              {siteName}
            </Link>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-10">
              {links.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group relative py-2"
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span
                        className={`text-[0.8125rem] tracking-[0.08em] uppercase transition-colors duration-500 ${
                          isOverHero
                            ? (isActive ? "text-white" : "text-white/80 hover:text-white")
                            : (isActive ? "text-warm-gray" : "text-warm-gray-light hover:text-warm-gray")
                        }`}
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                      >
                        {link.label}
                      </span>
                      {/* Animated underline */}
                      <span
                        className={`absolute bottom-0 left-0 h-px transition-all duration-500 ${
                          isOverHero ? "bg-white/60" : "bg-accent"
                        } ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Menu Button */}
            <button
              ref={hamburgerRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-11 h-11 flex items-center justify-center"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <div className="relative w-6 h-4">
                {/* Top line */}
                <span
                  className={`absolute left-0 top-0 w-full h-px transition-all duration-500 ${barColor} ${
                    isMobileMenuOpen
                      ? "rotate-45 translate-y-[7px]"
                      : "rotate-0 translate-y-0"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                />
                {/* Middle line */}
                <span
                  className={`absolute left-0 top-1/2 w-full h-px transition-all duration-500 ${barColor} ${
                    isMobileMenuOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                />
                {/* Bottom line */}
                <span
                  className={`absolute left-0 bottom-0 w-full h-px transition-all duration-500 ${barColor} ${
                    isMobileMenuOpen
                      ? "-rotate-45 -translate-y-[7px]"
                      : "rotate-0 translate-y-0"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        ref={mobileMenuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-700 ${
          isMobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
      >
        {/* Background */}
        <div
          className={`absolute inset-0 bg-cream transition-transform duration-700 origin-top ${
            isMobileMenuOpen ? "scale-y-100" : "scale-y-0"
          }`}
          style={{ transitionTimingFunction: "var(--ease-luxe)" }}
        />

        {/* Menu Content */}
        <div className="relative h-full flex flex-col items-center justify-center overflow-y-auto">
          <nav aria-label="Mobile navigation">
            <ul className="flex flex-col items-center gap-8">
              {links.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <li
                    key={link.href}
                    className={`transition-all duration-700 ${
                      isMobileMenuOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                    style={{
                      transitionTimingFunction: "var(--ease-luxe)",
                      transitionDelay: isMobileMenuOpen && !reducedMotion
                        ? `${200 + index * 80}ms`
                        : "0ms",
                    }}
                  >
                    <Link
                      href={link.href}
                      className="group relative block py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <span
                        className={`font-display text-4xl md:text-5xl font-light tracking-wide transition-colors duration-500 ${
                          isActive
                            ? "text-warm-gray"
                            : "text-warm-gray-light hover:text-warm-gray"
                        }`}
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                      >
                        {link.label}
                      </span>
                      {/* Underline accent */}
                      <span
                        className={`absolute -bottom-1 left-0 h-px bg-accent transition-all duration-500 ${
                          isActive ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Decorative tagline at bottom */}
          <p
            className={`absolute bottom-12 text-[0.6875rem] tracking-[0.2em] uppercase text-warm-gray-lighter transition-all duration-700 ${
              isMobileMenuOpen
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: isMobileMenuOpen && !reducedMotion ? "500ms" : "0ms",
            }}
          >
            {tagline}
          </p>
        </div>
      </div>

      {/* Spacer to prevent content from going under fixed nav */}
      <div className="h-20 md:h-24" />
    </>
  );
}
