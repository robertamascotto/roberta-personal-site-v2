"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface HomeHeroProps {
  headline: string;
  heroImageUrl?: string;
  heroImageLqip?: string;
}

/**
 * Matches the design's brand detail: for a two-word "Firstname Lastname"
 * headline, the first letter of the last name switches to the mark font
 * (Oswald — the same font as the RM logo). Any other headline shape (a
 * custom tagline, a single word, etc.) just renders plainly.
 */
function renderHeadline(headline: string) {
  const words = headline.trim().split(/\s+/);
  if (words.length !== 2) return headline;

  const [first, last] = words;
  return (
    <>
      {first} <span className="font-mark font-bold">{last[0]}</span>
      {last.slice(1)}
    </>
  );
}

export default function HomeHero({ headline, heroImageUrl, heroImageLqip }: HomeHeroProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="full-bleed home-hero-grid relative overflow-hidden">
      <div className="home-hero-divider absolute left-[35%] top-0 bottom-0 w-px bg-ink/[0.12]" />

      <div className="flex flex-col justify-center pl-11 pr-0 pt-0 pb-0 max-[640px]:pl-5 max-[640px]:pr-5 max-[640px]:pt-[132px] max-[640px]:pb-9 min-h-0 overflow-x-hidden">
        <h1 className="font-heading font-black uppercase text-[clamp(40px,calc(8vw_-_14px),80px)] leading-[0.95] tracking-[-0.01em] m-0 pr-6">
          {renderHeadline(headline)}
        </h1>
      </div>

      <div
        className="absolute left-11 bottom-10 z-[5] flex flex-col items-start gap-2.5 font-body text-[11px] tracking-[0.16em] uppercase text-ink/50 pointer-events-none transition-opacity duration-300 max-[640px]:hidden"
        style={{ opacity: scrolled ? 0 : 1 }}
      >
        <span>Scroll</span>
        <span className="text-base leading-none animate-nudge">&#8595;</span>
      </div>

      <figure className="m-0 h-full min-h-0 overflow-hidden relative">
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={`${headline} — portrait`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 65vw"
            className="object-cover"
            {...(heroImageLqip ? { placeholder: "blur", blurDataURL: heroImageLqip } : {})}
          />
        )}
      </figure>
    </div>
  );
}
