import type { ColumnPlan } from "@/lib/collage";
import EditorialCollage, { type CollagePhoto } from "@/components/gallery/EditorialCollage";
import UniformGrid from "@/components/gallery/UniformGrid";
import HeroPhoto from "@/components/gallery/HeroPhoto";

export interface SpreadSet {
  title: string;
  description?: string;
  photos: CollagePhoto[];
}

export interface SpreadProps {
  slug: string;
  index: number;
  total: number;
  /** mirror the layout (photo on the left) on every second spread */
  flip: boolean;
  title: string;
  category?: string;
  years?: string;
  lead?: string;
  hero?: { photo: CollagePhoto; ratio: number };
  /** a mixed-size collage of the project's own photos */
  collage?: { photos: CollagePhoto[]; wide: ColumnPlan; narrow: ColumnPlan };
  /** sets of ecommerce photos, all the same size */
  sets: SpreadSet[];
  photoCount: number;
}

const label = "font-body text-[11px] font-medium tracking-[0.14em] uppercase";

/**
 * One project laid out like a magazine spread: folio line, big title, an italic introduction
 * with a small facts table beside a large photo, then its photographs.
 */
export default function ProductSpread(p: SpreadProps) {
  const no = String(p.index + 1).padStart(2, "0");
  const meta = [p.category, p.years].filter(Boolean).join(" · ");

  return (
    <section id={p.slug} className="scroll-mt-24 pt-24 max-[640px]:pt-16">
      <div className="flex justify-between items-baseline gap-4 border-t border-ink pt-2.5">
        <span className="font-accent italic text-[15px]">No. {no}</span>
        <span className={label}>{meta}</span>
      </div>

      <h2 className="font-heading font-black uppercase text-[clamp(40px,6.4vw,92px)] leading-[0.9] tracking-[-0.01em] mt-4 mb-7 [overflow-wrap:anywhere]">
        {p.title}
      </h2>

      <div className="grid grid-cols-1 min-[801px]:grid-cols-12 gap-[clamp(16px,2vw,32px)] items-start">
        <div className={`min-[801px]:col-span-5 ${p.flip ? "min-[801px]:order-2" : ""}`}>
          {p.lead && (
            <p className="font-accent italic font-light text-[clamp(20px,2.1vw,26px)] leading-[1.4] m-0 mb-7">{p.lead}</p>
          )}
          <dl className="m-0 border-t border-ink/15">
            {[
              ["Category", p.category],
              ["Year", p.years],
              ["Photographs", String(p.photoCount)],
            ]
              .filter(([, value]) => value)
              .map(([name, value]) => (
                <div key={name} className="flex justify-between gap-4 py-2.5 border-b border-ink/15 text-[13px]">
                  <dt className="font-body text-[11px] tracking-[0.1em] uppercase text-ink/50 pt-0.5">{name}</dt>
                  <dd className="m-0 text-right">{value}</dd>
                </div>
              ))}
          </dl>
        </div>

        {p.hero && (
          <div className={`min-[801px]:col-span-7 ${p.flip ? "min-[801px]:order-1" : ""}`}>
            <HeroPhoto title={p.title} photo={p.hero.photo} aspectRatio={p.hero.ratio} priority={p.index === 0} />
            <div className={`flex justify-between gap-3 mt-2.5 text-ink/50 ${label}`}>
              <span>Fig. {no}</span>
              <span>{p.title}</span>
            </div>
          </div>
        )}
      </div>

      {p.collage && (
        <>
          <div className="flex justify-between items-baseline border-t border-ink/15 pt-2.5 mt-16">
            <span className={label}>Selected photographs</span>
            <span className="font-accent italic text-[15px]">{p.collage.photos.length} photos</span>
          </div>
          <div className="mt-6">
            <EditorialCollage
              title={p.title}
              photos={p.collage.photos}
              wide={p.collage.wide}
              narrow={p.collage.narrow}
              wideSizes="16vw"
            />
          </div>
        </>
      )}

      {p.sets.map((set, k) => (
        <div key={set.title}>
          <div className="flex justify-between items-baseline border-t border-ink/15 pt-2.5 mt-16">
            <span className={label}>Set {String(k + 1).padStart(2, "0")}</span>
            <span className="font-accent italic text-[15px]">{set.photos.length} photos</span>
          </div>
          <div className="grid grid-cols-1 min-[801px]:grid-cols-12 gap-[clamp(16px,2vw,32px)] mt-3.5 mb-6">
            <h3 className="min-[801px]:col-span-4 font-heading font-black uppercase text-[clamp(26px,3vw,40px)] leading-none m-0">
              {set.title}
            </h3>
            {set.description && (
              <p className="min-[801px]:col-span-6 text-sm leading-[23px] text-ink/72 m-0 whitespace-pre-line">
                {set.description}
              </p>
            )}
          </div>
          <UniformGrid title={`${p.title}, ${set.title}`} photos={set.photos} />
        </div>
      ))}

      <div className={`flex justify-between border-t border-ink/15 mt-16 pt-2.5 text-ink/50 ${label}`}>
        <span>Products</span>
        <span>
          {no} / {String(p.total).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
}
