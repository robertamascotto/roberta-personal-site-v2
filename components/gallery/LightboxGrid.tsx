"use client";

import { useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import AspectImage from "./AspectImage";
import { urlFor } from "@/studio/lib/image";
import type { ImageWithAspect } from "@/studio/lib/helpers";

export default function LightboxGrid({
  images,
  gap = 12,
  fit = "cover",
}: {
  images: ImageWithAspect[];
  gap?: number;
  fit?: "cover" | "contain";
}) {
  const [index, setIndex] = useState(-1);

  const slides = images.map((img) => ({
    src: urlFor(img.image).width(3200).fit("max").auto("format").quality(92).url(),
    alt: img.alt,
  }));

  return (
    <>
      <div className="grid grid-cols-2 min-[901px]:grid-cols-4 max-[640px]:!gap-2" style={{ gap }}>
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="cursor-zoom-in text-left p-0 border-0 bg-transparent"
            aria-label={`Open image ${i + 1} of ${images.length}`}
          >
            <AspectImage
              image={img.image}
              alt={img.alt}
              aspectRatio={img.aspectRatio || "3/4"}
              objectFit={fit}
              background={fit === "contain" ? "#fff" : undefined}
            />
          </button>
        ))}
      </div>
      <Lightbox open={index >= 0} close={() => setIndex(-1)} index={index} slides={slides} />
    </>
  );
}
