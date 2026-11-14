"use client";

import Image from "next/image";
import { usePhotoViewer, type CollagePhoto } from "./PhotoViewer";
import "./editorial-collage.css";

/**
 * Photos all the same size in a plain grid (5 across on larger screens, 2 on phones),
 * for ecommerce sets where every shot should look alike. Clicking opens the full-screen viewer.
 */
export default function UniformGrid({
  title,
  photos,
  ratio = "3/4",
  zoom = false,
}: {
  title: string;
  photos: CollagePhoto[];
  ratio?: string;
  /** open photos in the smaller "click to zoom" view instead of the near full-width viewer */
  zoom?: boolean;
}) {
  const { openAt, warm, viewer } = usePhotoViewer(title, photos, zoom ? "zoom" : "wide");

  return (
    <>
      <div className="ec-ugrid">
        {photos.map((photo, i) => (
          <button
            key={photo.src}
            type="button"
            className="ec-tile"
            style={{ aspectRatio: ratio }}
            aria-label={`Open photo ${i + 1} of ${photos.length}: ${title}`}
            onClick={(e) => openAt(i, e.currentTarget)}
            onPointerEnter={() => warm(i)}
            onFocus={() => warm(i)}
            onTouchStart={() => warm(i)}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 641px) 18vw, 46vw"
              className="object-cover"
              style={{ objectPosition: `${photo.focal[0]}% ${photo.focal[1]}%` }}
            />
          </button>
        ))}
      </div>
      {photos.length > 4 && (
        <button type="button" className="ec-viewall" onClick={(e) => openAt(0, e.currentTarget)}>
          View all {photos.length}
        </button>
      )}
      {viewer}
    </>
  );
}
