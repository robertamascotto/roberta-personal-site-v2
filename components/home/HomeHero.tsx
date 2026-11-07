"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import HeadlineWords from "@/components/home/HeadlineWords";

interface HomeHeroProps {
  headline: string;
  heroImageUrl?: string;
  heroImageLqip?: string;
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
      <div className="flex flex-col justify-center pl-11 pr-0 min-[881px]:pr-11 pt-0 pb-0 max-[640px]:pl-5 max-[640px]:pr-5 max-[640px]:pt-[132px] max-[640px]:pb-9 min-h-0 overflow-x-hidden">
        {/* The name sits on one line; the left column grows to fit it and the photo takes the rest. */}
        <h1 className="font-heading font-black uppercase text-[clamp(36px,calc(8vw_-_14px),80px)] leading-[0.95] tracking-[-0.01em] m-0 self-start inline-flex items-baseline gap-[0.27em] whitespace-nowrap">
          <HeadlineWords headline={headline} wordData={{ "data-intro-word": "" }} />
        </h1>
      </div>

      <div
        className="absolute left-11 bottom-10 z-[5] flex flex-col items-start gap-2.5 font-label text-[11px] tracking-[0.16em] uppercase text-ink/50 pointer-events-none transition-opacity duration-300 max-[640px]:hidden"
        style={{ opacity: scrolled ? 0 : 1 }}
      >
        <span>Scroll</span>
        <span className="text-base leading-none animate-nudge">&#8595;</span>
      </div>

      <figure className="intro-reveal m-0 h-full min-h-0 overflow-hidden relative min-[881px]:border-l min-[881px]:border-ink/[0.12]">
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={`${headline} — portrait`}
            fill
            priority
            sizes="(max-width: 880px) 100vw, 55vw"
            className="object-cover"
            {...(heroImageLqip ? { placeholder: "blur", blurDataURL: heroImageLqip } : {})}
          />
        )}
      </figure>
    </div>
  );
}
