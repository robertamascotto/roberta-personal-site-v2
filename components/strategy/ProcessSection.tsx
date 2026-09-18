import type { TitleBodyItem } from "@/studio/lib/helpers";

export default function ProcessSection({
  sectionLabel,
  steps,
}: {
  sectionLabel?: string;
  steps?: TitleBodyItem[];
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <section className="border-t border-ink/12 pt-14 pb-[72px]">
      <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-5">{sectionLabel}</span>
      <div className="grid grid-cols-1 gap-6 max-[640px]:grid-cols-2 max-[640px]:gap-x-[18px] max-[640px]:gap-y-[22px] min-[641px]:max-[880px]:grid-cols-1 min-[881px]:grid-cols-5 min-[881px]:gap-x-6 min-[881px]:gap-y-7">
        {steps.map((step, i) => (
          <div key={i} className="border-t border-ink pt-[18px]">
            <p className="font-numeral text-[15px] m-0 mb-2.5">{String(i + 1).padStart(2, "0")}</p>
            <h3 className="font-heading font-bold text-[27px] m-0 mb-2.5">{step.title}</h3>
            <p className="text-sm leading-[22px] m-0 text-ink/68">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
