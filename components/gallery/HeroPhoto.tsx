"use client";

import Image from "next/image";
import { usePhotoViewer, type CollagePhoto } from "./PhotoViewer";
import "./editorial-collage.css";

/** One large photo (shown at its own proportions, nothing trimmed) that opens in the full-screen viewer. */
export default function HeroPhoto({
  title,
  photo,
  aspectRatio,
  priority = false,
}: {
  title: string;
  photo: CollagePhoto;
  /** width / height of the photo */
  aspectRatio: number;
  priority?: boolean;
}) {
  const { openAt, warm, viewer } = usePhotoViewer(title, [photo]);

  return (
    <>
      <button
        type="button"
        className="ec-tile ec-hero"
        style={{ aspectRatio }}
        aria-label={`Open photo: ${title}`}
        onClick={(e) => openAt(0, e.currentTarget)}
        onPointerEnter={() => warm(0)}
        onFocus={() => warm(0)}
        onTouchStart={() => warm(0)}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          priority={priority}
          sizes="(min-width: 801px) 58vw, 100vw"
          className="object-cover"
        />
      </button>
      {viewer}
    </>
  );
}
