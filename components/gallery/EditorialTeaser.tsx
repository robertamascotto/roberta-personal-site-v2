import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/studio/lib/image";
import type { EditorialSummary } from "@/studio/lib/helpers";

// Matches the source design's mechanism: each frame gets an explicit
// display width (from the CMS) and its own aspect ratio, so height derives
// automatically. Frames are vertically centered on a shared midline, so a
// taller frame naturally extends further above/below it than a shorter
// one — that's what produces the staggered look, not an artificial offset.
const FALLBACK_WIDTHS = [280, 360, 260, 240];

export default function EditorialTeaser({ editorial }: { editorial: EditorialSummary }) {
  const frames = editorial.coverFrames || [];

  return (
    <section className="border-t border-ink/12 py-12 max-[640px]:!py-8">
      <div className="flex justify-center mb-9">
        <div className="relative flex items-center gap-5 flex-wrap md:flex-nowrap">
          {frames.map((frame, i) => (
            <div
              key={i}
              className="relative flex-none"
              style={{
                width: frame.frameWidth || FALLBACK_WIDTHS[i % FALLBACK_WIDTHS.length],
                aspectRatio: frame.aspectRatio || "4/5",
              }}
            >
              <Image
                src={urlFor(frame.image).width(1200).fit("max").auto("format").url()}
                alt={frame.alt}
                fill
                sizes="(max-width: 768px) 60vw, 40vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}

          <Link
            href={`/editorials/${editorial.slug}`}
            className="absolute right-0 bottom-0 inline-block font-body text-[13px] font-semibold tracking-[0.04em] no-underline border-b border-ink pb-[2px]"
          >
            View all &#8594;
          </Link>
        </div>
      </div>

      <div className="inline-block bg-paper/70 px-[22px] py-[18px]">
        <h2 className="font-accent italic font-light text-[26px] leading-[1.2] m-0 tracking-[-0.01em]">
          {editorial.title}
        </h2>
        {editorial.year && <span className="block mt-1.5 font-body text-[11px] tracking-[0.1em] text-ink/32">{editorial.year}</span>}
      </div>

      {editorial.description && (
        <p className="text-[13px] leading-[21px] mt-4 text-ink/72 whitespace-pre-line">{editorial.description}</p>
      )}
    </section>
  );
}
