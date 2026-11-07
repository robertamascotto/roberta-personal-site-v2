import Image from "next/image";
import type { ColumnPlan } from "@/lib/collage";
import EditorialCollage, { type CollagePhoto } from "@/components/gallery/EditorialCollage";
import UniformGrid from "@/components/gallery/UniformGrid";
import SetNav from "./SetNav";

export interface SpreadSet {
  slug: string;
  title: string;
  description?: string;
  photos: CollagePhoto[];
}

export interface SpreadProps {
  slug: string;
  title: string;
  category?: string;
  years?: string;
  lead?: string;
  cover?: { src: string; alt: string };
  priority?: boolean;
  /** a mixed-size collage of the project's own photos */
  collage?: { photos: CollagePhoto[]; wide: ColumnPlan; narrow: ColumnPlan };
  /** sets of ecommerce photos, all the same size */
  sets: SpreadSet[];
}

/**
 * One project: its title, introduction, cover and facts stay in a column on the left while its
 * photographs scroll on the right. Clicking any photo opens it in a normal "click to zoom" view.
 */
export default function ProjectBlock(p: SpreadProps) {
  const facts = [
    ["Category", p.category],
    ["Year", p.years],
  ].filter(([, value]) => value) as [string, string][];

  return (
    <section id={p.slug} className="scroll-mt-20 border-t border-ink/10 py-14 max-[640px]:py-10">
      <div className="grid grid-cols-1 min-[901px]:grid-cols-[230px_minmax(0,1fr)] gap-x-14 gap-y-8">
        <aside className="min-[901px]:sticky min-[901px]:top-24 self-start">
          <h2 className="font-heading font-black uppercase text-[44px] leading-[0.92] m-0 mb-3.5 [overflow-wrap:anywhere]">
            {p.title}
          </h2>
          {p.lead && <p className="font-body text-sm leading-[1.55] text-ink/80 m-0 mb-[18px]">{p.lead}</p>}
          {p.cover && (
            <div className="relative aspect-[3/2] overflow-hidden bg-ink/[0.06] mb-[18px] max-[900px]:max-w-[360px]">
              <Image src={p.cover.src} alt={p.cover.alt} fill priority={p.priority} sizes="(min-width: 901px) 230px, 360px" className="object-cover" />
            </div>
          )}
          {facts.length > 0 && (
            <dl className="m-0 border-b border-ink/10">
              {facts.map(([name, value]) => (
                <div key={name} className="flex justify-between gap-4 py-[9px] border-t border-ink/10 text-xs">
                  <dt className="text-ink/50">{name}</dt>
                  <dd className="m-0 text-right">{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {p.sets.length > 1 && <SetNav items={p.sets.map((s) => ({ id: `${p.slug}-${s.slug}`, title: s.title }))} />}
        </aside>

        <div className="min-w-0 flex flex-col gap-14">
          {p.collage && (
            <EditorialCollage
              zoom
              title={p.title}
              photos={p.collage.photos}
              wide={p.collage.wide}
              narrow={p.collage.narrow}
              wideSizes="22vw"
            />
          )}
          {p.sets.map((set) => (
            <section key={set.slug} id={`${p.slug}-${set.slug}`} className="scroll-mt-24">
              <h3
                className={`font-heading font-black uppercase text-[26px] leading-none m-0 pt-3 border-t border-ink/10 ${
                  set.description ? "mb-1.5" : "mb-3.5"
                }`}
              >
                {set.title}
              </h3>
              {set.description && (
                <p className="font-body text-[12.5px] leading-[1.55] text-ink/60 m-0 mb-3.5 max-w-[620px] whitespace-pre-line">
                  {set.description}
                </p>
              )}
              <UniformGrid zoom title={`${p.title}, ${set.title}`} photos={set.photos} />
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
