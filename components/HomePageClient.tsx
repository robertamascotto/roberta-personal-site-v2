"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/lib/useReducedMotion";

const defaults = {
  heroTagline: "Lifestyle & Ecommerce Photography",
  heroHeadline: "Roberta",
  heroSubtitle: "Crafting visual narratives for brands that inspire connection and drive conversion.",
};

interface HomePageClientProps {
  homePage: {
    heroTagline?: string;
    heroHeadline?: string;
    heroSubtitle?: string;
    heroTaglineColor?: string;
    heroHeadlineColor?: string;
    heroSubtitleColor?: string;
  };
  heroImageUrl?: string;
  heroImageLqip?: string;
}

export default function HomePageClient({
  homePage,
  heroImageUrl,
  heroImageLqip,
}: HomePageClientProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsLoaded(true);
      return;
    }
    // Fallback timeout in case onLoad doesn't fire (e.g., no hero image)
    if (!heroImageUrl) {
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [reducedMotion, heroImageUrl]);

  const heroTagline = homePage.heroTagline || defaults.heroTagline;
  const heroHeadline = homePage.heroHeadline || defaults.heroHeadline;
  const heroSubtitle = homePage.heroSubtitle || defaults.heroSubtitle;

  const heroTaglineColor = homePage.heroTaglineColor || undefined;
  const heroHeadlineColor = homePage.heroHeadlineColor || undefined;
  const heroSubtitleColor = homePage.heroSubtitleColor || undefined;

  const hasImage = !!heroImageUrl;

  return (
    <div className="-mt-20 md:-mt-24 full-bleed">
      {/* Full-Viewport Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        {heroImageUrl && (
          <div className="absolute inset-0">
            <Image
              src={heroImageUrl}
              alt={`${heroHeadline} — ${heroTagline}`}
              fill
              className={`object-cover transition-all duration-[1.5s] ${
                isLoaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
              }`}
              style={{ transitionTimingFunction: "var(--ease-luxe)" }}
              priority
              sizes="100vw"
              onLoad={() => setIsLoaded(true)}
              onError={() => setIsLoaded(true)}
              {...(heroImageLqip ? { placeholder: "blur", blurDataURL: heroImageLqip } : {})}
            />
            {/* Layered text scrim — linear floor + radial concentration */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  "radial-gradient(ellipse 90% 60% at 50% 85%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 55%, transparent 80%)",
                  "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.35) 35%, rgba(0,0,0,0.1) 60%, transparent 80%)",
                ].join(", "),
              }}
            />
          </div>
        )}

        {/* Fallback Background */}
        {!heroImageUrl && (
          <div className="absolute inset-0 bg-cream-dark" />
        )}

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          {/* Tagline */}
          <p
            className={`text-xs md:text-sm tracking-[0.35em] uppercase mb-6 transition-all duration-1000 ${
              hasImage ? "text-white/80" : "text-warm-gray-light"
            } ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: reducedMotion ? "0ms" : "300ms",
              ...(heroTaglineColor ? { color: heroTaglineColor } : {}),
            }}
          >
            {heroTagline}
          </p>

          {/* Main Headline */}
          <h1
            className={`text-[clamp(2rem,8vw,5.5rem)] leading-[1] tracking-wide mb-8 whitespace-nowrap transition-all duration-1000 ${
              hasImage ? "text-white" : "text-warm-gray"
            } ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{
              fontFamily: "var(--font-syne), Syne, sans-serif",
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: reducedMotion ? "0ms" : "100ms",
              ...(heroHeadlineColor ? { color: heroHeadlineColor } : {}),
            }}
          >
            {heroHeadline}
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-xl font-light max-w-lg mx-auto mb-12 transition-all duration-1000 ${
              hasImage ? "text-white/90" : "text-warm-gray-light"
            } ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{
              transitionTimingFunction: "var(--ease-luxe)",
              transitionDelay: reducedMotion ? "0ms" : "500ms",
              ...(heroSubtitleColor ? { color: heroSubtitleColor } : {}),
            }}
          >
            {heroSubtitle}
          </p>
        </div>

        {/* Scroll Indicator */}
        <div
          className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-all duration-1000 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDelay: reducedMotion ? "0ms" : "800ms" }}
        >
          <div className={`w-px h-10 ${hasImage ? "bg-white/40" : "bg-warm-gray-lighter/40"} animate-scroll-hint`} />
        </div>
      </section>
    </div>
  );
}
