"use client";

import Image from "next/image";
import type { ColumnPlan } from "@/lib/collage";
import { usePhotoViewer, type CollagePhoto } from "./PhotoViewer";
import "./editorial-collage.css";

export type { CollagePhoto } from "./PhotoViewer";

interface Props {
  title: string;
  photos: CollagePhoto[];
  /** arrangement for wide screens (4 or 5 columns) */
  wide: ColumnPlan;
  /** arrangement for phones and tablets (2 columns) */
  narrow: ColumnPlan;
  /** hint for the browser about how wide the photos are on wide screens */
  wideSizes?: string;
}

/**
 * A photo collage laid out as a clean rectangle (every column ends at the same height).
 * Clicking a photo opens the full-screen viewer.
 */
export default function EditorialCollage({ title, photos, wide, narrow, wideSizes = "18vw" }: Props) {
  const { openAt, warm, viewer } = usePhotoViewer(title, photos);

  const renderGrid = (plan: ColumnPlan, sizes: string) => (
    <div
      className="ec-grid"
      style={{ gridTemplateColumns: `repeat(${plan.columns.length}, minmax(0, 1fr))`, aspectRatio: plan.aspect }}
    >
      {plan.columns.map((column, ci) => (
        <div className="ec-col" key={ci}>
          {column.map((tile) => {
            const photo = photos[tile.index];
            return (
              <button
                key={tile.index}
                type="button"
                className="ec-tile"
                style={{ flexGrow: tile.grow }}
                aria-label={`Open photo ${tile.index + 1} of ${photos.length}: ${title}`}
                onClick={(e) => openAt(tile.index, e.currentTarget)}
                onPointerEnter={() => warm(tile.index)}
                onFocus={() => warm(tile.index)}
                onTouchStart={() => warm(tile.index)}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={sizes}
                  className="object-cover"
                  style={{ objectPosition: `${photo.focal[0]}% ${photo.focal[1]}%` }}
                />
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className="ec-wide">{renderGrid(wide, `(min-width: 901px) ${wideSizes}, 46vw`)}</div>
      <div className="ec-narrow">{renderGrid(narrow, "46vw")}</div>
      {viewer}
    </>
  );
}
