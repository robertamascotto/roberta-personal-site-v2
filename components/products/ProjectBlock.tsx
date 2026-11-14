import type { ColumnPlan } from "@/lib/collage";
import EditorialCollage, { type CollagePhoto } from "@/components/gallery/EditorialCollage";
import UniformGrid from "@/components/gallery/UniformGrid";
import "./products.css";

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
  /** the project's own written introduction (shown when it has no sets) */
  lead?: string;
  /** a mixed-size collage of the project's own photos (projects without sets) */
  collage?: { photos: CollagePhoto[]; wide: ColumnPlan; narrow: ColumnPlan };
  /** sets of ecommerce photos, all the same size (all shown, one under the other) */
  sets: SpreadSet[];
}

/**
 * One project, catalog style: on the left (scrolling away with the page) its title, facts and, when it has
 * sets, a small list that jumps to each one; its photos on the right. A project with sets shows every set one
 * under the other, each with its name, description and a strict grid; a project without sets shows its own
 * photos as a collage with its introduction under the facts.
 */
export default function ProjectBlock(p: SpreadProps) {
  const hasSets = p.sets.length > 0;

  const facts = [
    ["Category", p.category],
    ["Years", p.years],
    ...(hasSets ? [["Sets", String(p.sets.length)]] : []),
  ].filter(([, value]) => value) as [string, string][];

  return (
    <section id={p.slug} className="pr-proj">
      <aside className="pr-aside">
        <h2 className="pr-title">{p.title}</h2>
        {facts.length > 0 && (
          <dl className="pr-facts">
            {facts.map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {p.sets.length > 1 && (
          <nav className="pr-jump" aria-label={`${p.title}: sets`}>
            {p.sets.map((s) => (
              <a key={s.slug} href={`#${p.slug}-${s.slug}`}>
                {s.title}
              </a>
            ))}
          </nav>
        )}
        {!hasSets && p.lead && <p className="pr-desc">{p.lead}</p>}
      </aside>

      <div className="pr-main">
        {hasSets ? (
          <div className="pr-stack">
            {p.sets.map((s) => (
              <section key={s.slug} id={`${p.slug}-${s.slug}`} className="pr-set">
                <h3 className="pr-set-title">
                  {s.title}
                  <i>{s.photos.length}</i>
                </h3>
                {s.description && <p className="pr-desc">{s.description}</p>}
                <UniformGrid title={`${p.title}, ${s.title}`} photos={s.photos} />
              </section>
            ))}
          </div>
        ) : (
          p.collage && (
            <EditorialCollage title={p.title} photos={p.collage.photos} wide={p.collage.wide} narrow={p.collage.narrow} wideSizes="22vw" />
          )
        )}
      </div>
    </section>
  );
}
