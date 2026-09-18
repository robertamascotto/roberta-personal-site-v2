import type { CsKpi, CsMonthlyBar, CsPillar } from "@/studio/lib/helpers";

export default function ReportSection({
  sectionLabel,
  heading,
  intro,
  reportLabel,
  dateRange,
  kpis,
  monthlyBars,
  pillars,
}: {
  sectionLabel?: string;
  heading?: string;
  intro?: string;
  reportLabel?: string;
  dateRange?: string;
  kpis?: CsKpi[];
  monthlyBars?: CsMonthlyBar[];
  pillars?: CsPillar[];
}) {
  if (!kpis || kpis.length === 0) return null;

  return (
    <section className="border-t border-ink/12 pt-14 pb-[72px]">
      <div className="grid grid-cols-1 min-[881px]:grid-cols-2 gap-5 min-[881px]:gap-x-[clamp(28px,5vw,64px)] items-center">
        <div>
          <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-5">{sectionLabel}</span>
          <h2 className="font-accent italic font-light text-[34px] max-[640px]:text-[26px] leading-[1.2] m-0 mb-4 max-w-[26ch]">
            {heading}
          </h2>
          {intro && <p className="text-[15px] leading-[25px] m-0 text-ink/72 max-w-[46ch]">{intro}</p>}
        </div>

        <div className="border border-ink/[0.14] bg-paper">
          <div className="flex justify-between items-baseline px-[18px] py-3 border-b border-ink/[0.14]">
            <span className="text-[10px] tracking-[0.16em] uppercase text-ink/50">{reportLabel}</span>
            <span className="text-[10px] tracking-[0.16em] uppercase text-ink/50">{dateRange}</span>
          </div>

          <div className="grid grid-cols-4 max-[640px]:!grid-cols-2 border-b border-ink/[0.14]">
            {kpis.map((kpi, i) => (
              <div
                key={i}
                className={`px-3 py-3.5 max-[640px]:!px-4 max-[640px]:!py-[18px] ${i > 0 ? "border-l border-ink/[0.14]" : ""}`}
              >
                <div className="font-heading font-black text-[26px] leading-none">{kpi.value}</div>
                <div className="text-[9.5px] tracking-[0.06em] uppercase text-ink/50 mt-1 leading-[14px]">
                  {kpi.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 min-[881px]:grid-cols-[1.15fr_1fr]">
            <div className="px-[18px] py-4">
              <h3 className="font-heading font-bold text-lg m-0 mb-3">Reach by month</h3>
              <div className="flex items-end gap-2 h-[88px] border-b border-ink">
                {monthlyBars?.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end h-full">
                    <div
                      style={{
                        backgroundColor: bar.highlighted ? "#6E8F52" : "#C7D6B4",
                        height: `${bar.heightPercent}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-1.5 text-[9.5px] tracking-[0.1em] uppercase text-ink/50">
                {monthlyBars?.map((bar, i) => (
                  <span key={i} className="flex-1 text-center">
                    {bar.month}
                  </span>
                ))}
              </div>
            </div>

            <div className="px-[18px] py-4 border-l border-ink/[0.14] max-[880px]:!border-l-0 max-[880px]:!border-t max-[880px]:!border-ink/[0.14]">
              <h3 className="font-heading font-bold text-lg m-0 mb-3">By content pillar</h3>
              <div className="grid gap-[9px]">
                {pillars?.map((pillar, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span>{pillar.label}</span>
                      <span className="text-ink/55">{pillar.percent}%</span>
                    </div>
                    <div className="h-1.5" style={{ backgroundColor: "#E7EFDC" }}>
                      <div className="h-full" style={{ width: `${pillar.percent}%`, backgroundColor: "#6E8F52" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
