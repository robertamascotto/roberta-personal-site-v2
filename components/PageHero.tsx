interface PageHeroProps {
  label?: string;
  headline: string;
  body?: string;
  maxWidth?: string;
}

export default function PageHero({ label, headline, body, maxWidth = "max-w-3xl" }: PageHeroProps) {
  return (
    <section className={`pt-[72px] pb-14 ${maxWidth}`}>
      {label && (
        <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-[18px]">{label}</span>
      )}
      <h1 className="font-heading font-black text-[clamp(34px,4.2vw,52px)] leading-none tracking-[-0.01em] m-0 whitespace-pre-line">
        {headline}
      </h1>
      {body && <p className="font-body text-base leading-[27px] text-ink/72 mt-5 mb-0 whitespace-pre-line">{body}</p>}
    </section>
  );
}
