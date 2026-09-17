import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/studio/lib/image";

interface ProjectTeaserRowProps {
  href: string;
  label: string;
  blurb: string;
  image?: unknown;
  videoUrl?: string;
  reversed?: boolean;
  blurbMaxWidth?: string;
}

export default function ProjectTeaserRow({
  href,
  label,
  blurb,
  image,
  videoUrl,
  reversed = false,
  blurbMaxWidth = "48ch",
}: ProjectTeaserRowProps) {
  const media = (
    <Link href={href} className="block no-underline">
      <figure className="relative m-0 overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {videoUrl ? (
          <video
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : image ? (
          <Image
            src={urlFor(image).width(1200).fit("max").auto("format").url()}
            alt={label}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-ink/5" />
        )}
      </figure>
    </Link>
  );

  const text = (
    <div>
      <div className="font-accent italic text-base font-normal tracking-[0.14em] uppercase text-ink/50 mb-2.5">{label}</div>
      <p className="font-body text-sm leading-[22px] text-ink/62 m-0 mb-3.5" style={{ maxWidth: blurbMaxWidth }}>
        {blurb}
      </p>
      <Link href={href} className="font-body text-sm font-semibold no-underline text-ink">
        View project &#8594;
      </Link>
    </div>
  );

  return (
    <div className="grid min-[641px]:grid-cols-2 gap-12 max-[640px]:gap-5 items-center py-9 max-[640px]:py-8 border-t border-ink/[0.08]">
      {reversed ? (
        <>
          <div className="max-[640px]:order-2">{text}</div>
          <div className="max-[640px]:order-1">{media}</div>
        </>
      ) : (
        <>
          {media}
          {text}
        </>
      )}
    </div>
  );
}
