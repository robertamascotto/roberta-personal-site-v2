import Image from "next/image";
import { urlFor } from "@/studio/lib/image";
import type { TitleBodyItem, CsCorePersona } from "@/studio/lib/helpers";

const subLabel =
  "block text-[11px] tracking-[0.16em] uppercase text-ink/50 mb-[18px] border-b border-ink/[0.18] pb-2.5";

export default function ResearchAudienceSection({
  sectionLabel,
  heading,
  intro,
  researchItems,
  corePersona,
  secondaryPersonas,
}: {
  sectionLabel?: string;
  heading?: string;
  intro?: string;
  researchItems?: TitleBodyItem[];
  corePersona?: CsCorePersona;
  secondaryPersonas?: TitleBodyItem[];
}) {
  return (
    <section className="border-t border-ink/12 pt-14 pb-[72px]">
      <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-5">{sectionLabel}</span>
      <h2 className="font-accent italic font-light text-[34px] max-[640px]:text-[26px] leading-[1.2] m-0 mb-4">{heading}</h2>
      {intro && <p className="text-[15px] leading-[25px] m-0 mb-8 text-ink/72 max-w-[52ch]">{intro}</p>}

      <div className="grid grid-cols-1 min-[881px]:grid-cols-2 gap-10 min-[881px]:gap-x-[clamp(28px,5vw,64px)] items-stretch">
        <div className="flex flex-col">
          <span className={subLabel}>Research</span>
          <div className="grid gap-[22px] flex-1 content-between">
            {researchItems?.map((item, i) => (
              <div key={i}>
                <h3 className="font-heading font-bold text-2xl m-0 mb-1.5">{item.title}</h3>
                <p className="text-sm leading-[22px] m-0 text-ink/68 max-w-[46ch]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span className={subLabel}>Audience</span>
          {corePersona && (
            <div className="grid grid-cols-[150px_minmax(0,1fr)] max-[880px]:!grid-cols-1 gap-5 min-[881px]:gap-x-[clamp(20px,3vw,28px)] items-start">
              <figure className="m-0 min-w-0">
                <div className="w-[150px] max-w-full relative" style={{ aspectRatio: "3/4.6" }}>
                  <Image
                    src={urlFor(corePersona.image).url()}
                    alt="Core buyer portrait"
                    fill
                    sizes="150px"
                    className="object-cover"
                    style={{ objectPosition: "60% 22%" }}
                  />
                </div>
              </figure>
              <div>
                <h3 className="font-heading font-bold text-[26px] m-0 mb-1.5">{corePersona.name}</h3>
                <p className="font-accent italic font-light text-[17px] leading-[1.35] m-0 mb-4 text-ink/70 max-w-[30ch]">
                  {corePersona.quote}
                </p>
                <p className="text-sm leading-[22px] m-0 text-ink/70 max-w-[44ch]">{corePersona.body}</p>
                {corePersona.attribution && (
                  <p className="text-xs leading-[18px] text-ink/55 mt-3.5 mb-0">{corePersona.attribution}</p>
                )}
              </div>
            </div>
          )}

          {secondaryPersonas && secondaryPersonas.length > 0 && (
            <div className="grid gap-5 mt-6 max-[640px]:!grid-cols-2 max-[640px]:!gap-[18px]">
              {secondaryPersonas.map((item, i) => (
                <div key={i}>
                  <h3 className="font-heading font-bold text-xl m-0 mb-1">{item.title}</h3>
                  <p className="text-sm leading-[22px] m-0 text-ink/70 max-w-[44ch] max-[640px]:!text-[13px] max-[640px]:!leading-5">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
