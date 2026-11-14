import NameMark from "@/components/home/NameMark";

/**
 * Home: one screen, no scrolling. The photo fills the page height and sits to the right of the
 * menu column; the name is centered on the page, exactly where the intro leaves it.
 */
export default function HomeHero({ headline }: { headline: string }) {
  return (
    <section className="home-hero">
      <picture>
        {/* phones get the square version of the photo (the wide one would be cut to a thin strip) */}
        <source media="(max-width: 700px)" srcSet="/home/hero-square.jpg" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="home-photo"
          src="/home/hero.jpg"
          alt={`${headline} — portrait with a lighter and matches`}
          fetchPriority="high"
        />
      </picture>
      <h1 className="rm-name">
        <NameMark headline={headline} />
      </h1>
      <span className="home-corner l">Photographer</span>
      <span className="home-corner r">New York</span>
    </section>
  );
}
