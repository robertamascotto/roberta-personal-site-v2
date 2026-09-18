import Image from "next/image";
import { urlFor } from "@/studio/lib/image";
import LazyVideo from "@/components/LazyVideo";
import type { CsFeedMedia } from "@/studio/lib/helpers";

export default function FeedPhoneSection({
  media,
  phoneImage,
}: {
  media?: CsFeedMedia[];
  phoneImage?: unknown;
}) {
  if (!media || media.length === 0 || !phoneImage) return null;
  const phoneUrl = urlFor(phoneImage).url();

  return (
    <section className="grid grid-cols-1 min-[881px]:grid-cols-2 gap-y-8 min-[881px]:gap-x-[clamp(28px,5vw,64px)] pt-2 pb-20 items-start">
      <div className="grid grid-cols-3 gap-[14px] max-[640px]:!gap-2">
        {media.map((item, i) => (
          <figure key={i} className="m-0 min-w-0">
            <div className="relative w-full bg-ink" style={{ aspectRatio: "9/16" }}>
              {item.videoUrl ? (
                <LazyVideo
                  src={item.videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="block w-full h-full object-cover"
                />
              ) : item.image ? (
                <Image
                  src={urlFor(item.image).url()}
                  alt=""
                  fill
                  sizes="(max-width: 880px) 33vw, 16vw"
                  className="object-cover"
                />
              ) : null}
            </div>
            <figcaption className="text-xs leading-[17px] text-ink/60 mt-2">{item.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="justify-self-end max-[880px]:!justify-self-center max-[640px]:!justify-self-stretch min-w-0 w-full max-w-[440px] min-[1100px]:relative min-[1100px]:h-full">
        <Image
          src={phoneUrl}
          alt="Instagram profile mockup shown on an iPhone"
          width={941}
          height={1672}
          sizes="(max-width: 1099px) 440px, 440px"
          className="block w-full h-auto min-[1100px]:absolute min-[1100px]:-right-8 min-[1100px]:bottom-0"
          style={{ aspectRatio: "941/1672" }}
        />
      </div>
    </section>
  );
}
