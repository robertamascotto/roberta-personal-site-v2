import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/studio/lib/image";
import type { EditorialSummary } from "@/studio/lib/helpers";

const OFFSETS = [24, -16, 20, -12];

export default function EditorialTeaser({ editorial }: { editorial: EditorialSummary }) {
  const frames = editorial.coverFrames || [];

  return (
    <section className="border-t border-ink/10 py-14">
      <div className="flex items-center justify-center gap-6 h-[280px] md:h-[380px] mb-9 flex-wrap md:flex-nowrap">
        {frames.map((frame, i) => (
          <div
            key={i}
            className="relative h-full flex-none"
            style={{
              aspectRatio: frame.aspectRatio || "4/5",
              marginTop: OFFSETS[i % OFFSETS.length],
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
      </div>

      <div className="flex justify-end mb-4">
        <Link
          href={`/editorials/${editorial.slug}`}
          className="inline-block font-body text-[13px] font-semibold no-underline border-b border-ink pb-[2px]"
        >
          View all &#8594;
        </Link>
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
