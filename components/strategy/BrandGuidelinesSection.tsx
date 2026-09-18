import Image from "next/image";
import { urlFor } from "@/studio/lib/image";
import type { CsGuidelineRow } from "@/studio/lib/helpers";

export default function BrandGuidelinesSection({
  sectionLabel,
  heading,
  intro,
  rows,
}: {
  sectionLabel?: string;
  heading?: string;
  intro?: string;
  rows?: CsGuidelineRow[];
}) {
  if (!rows || rows.length === 0) return null;

  return (
    <section className="border-t border-ink/12 pt-14 pb-[72px]">
      <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-5">{sectionLabel}</span>
      <h2 className="font-accent italic font-light text-[34px] max-[640px]:text-[26px] leading-[1.2] m-0 mb-4 max-w-[24ch]">
        {heading}
      </h2>
      {intro && <p className="text-[15px] leading-[25px] m-0 mb-8 text-ink/72 max-w-[60ch]">{intro}</p>}

      <div className="grid gap-[26px]">
        {rows.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 min-[881px]:grid-cols-2 gap-5 min-[881px]:gap-x-[clamp(28px,5vw,64px)] items-center"
          >
            <div>
              <h3 className="font-heading font-bold text-2xl m-0 mb-1.5">{row.title}</h3>
              <p className="text-sm leading-[22px] m-0 text-ink/68 max-w-[50ch]">{row.body}</p>
            </div>

            <div className="border border-ink/[0.14]" style={{ backgroundColor: "#F9F9F3" }}>
              <div className="px-4 py-2.5 border-b border-ink/[0.14]">
                <span
                  className="font-body font-medium text-[10px] tracking-[0.16em] uppercase"
                  style={{ color: "#466E43" }}
                >
                  {row.exampleLabel}
                </span>
              </div>

              {row.exampleLayout === "visualGrid" ? (
                <div className="p-4">
                  <div className="grid grid-cols-4 max-[640px]:!grid-cols-2 gap-2.5 max-[640px]:!gap-3.5">
                    {row.exampleItems?.map((item, j) => (
                      <div key={j}>
                        <div className="relative" style={{ aspectRatio: "3/4" }}>
                          {item.image ? (
                            <Image
                              src={urlFor(item.image).url()}
                              alt={item.heading}
                              fill
                              sizes="(max-width: 640px) 45vw, 15vw"
                              className="object-cover"
                            />
                          ) : null}
                        </div>
                        <h4
                          className="font-accent italic font-light text-lg leading-[1.1] mt-3 mb-1.5"
                          style={{ color: "#203D33" }}
                        >
                          {item.heading}
                        </h4>
                        <p className="font-body text-[12.5px] leading-[19px] m-0" style={{ color: "#466E43" }}>
                          {item.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div
                  className="grid grid-cols-2 gap-px max-[640px]:!gap-px"
                  style={{ backgroundColor: "rgba(17,17,16,0.14)" }}
                >
                  {row.exampleItems?.map((item, j) => (
                    <div
                      key={j}
                      className="px-4 py-3.5 max-[640px]:!px-[13px] max-[640px]:!py-3"
                      style={{ backgroundColor: "#F9F9F3" }}
                    >
                      <h4
                        className="font-accent italic font-light text-lg max-[640px]:!text-[15px] leading-[1.1] m-0 mb-1.5"
                        style={{ color: "#203D33" }}
                      >
                        {item.heading}
                      </h4>
                      {item.value && (
                        <div
                          className="font-accent italic font-light text-lg leading-[1.1] mt-1.5 mb-1.5"
                          style={{ color: "#203D33" }}
                        >
                          {item.value}
                        </div>
                      )}
                      <p
                        className="font-body text-[12.5px] leading-5 max-[640px]:!text-[11.5px] max-[640px]:!leading-[17px] m-0"
                        style={{ color: "#466E43" }}
                      >
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
