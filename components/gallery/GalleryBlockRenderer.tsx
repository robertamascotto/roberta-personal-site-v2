import { Fragment } from "react";
import { urlFor } from "@/studio/lib/image";
import AspectImage from "./AspectImage";
import type { GalleryBlock } from "@/studio/lib/helpers";

const GRID_GAP: Record<number, string> = {
  2: "gap-4",
  3: "gap-4",
  4: "gap-3",
};

export default function GalleryBlockRenderer({ blocks }: { blocks?: GalleryBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, i) => {
        if (block._type === "imageWithAspect") {
          return (
            <AspectImage
              key={i}
              image={block.image}
              alt={block.alt}
              aspectRatio={block.aspectRatio}
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          );
        }

        if (block._type === "imageGridBlock") {
          return (
            <div
              key={i}
              className={`grid max-[640px]:!grid-cols-2 max-[640px]:!gap-2 ${GRID_GAP[block.columns] || "gap-4"}`}
              style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}
            >
              {block.images.map((img, j) => (
                <AspectImage
                  key={j}
                  image={img.image}
                  alt={img.alt}
                  aspectRatio={img.aspectRatio}
                  className={block.columns === 3 && j === 2 ? "max-[640px]:col-span-2" : ""}
                />
              ))}
            </div>
          );
        }

        if (block._type === "scrollStripBlock") {
          return (
            <Fragment key={i}>
              <div className="full-bleed relative">
                <div
                  className="flex gap-4 overflow-x-auto overflow-y-hidden pr-[clamp(20px,5vw,64px)]"
                  style={{ scrollSnapType: "x proximity", scrollbarWidth: "thin" }}
                >
                  {block.images.map((img, j) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={j}
                      src={urlFor(img.image).height(1040).fit("max").auto("format").url()}
                      alt={img.alt}
                      className="flex-none block"
                      style={{
                        height: "clamp(280px, 34vw, 520px)",
                        width: "auto",
                        maxWidth: "none",
                        objectFit: "contain",
                        scrollSnapAlign: "start",
                      }}
                    />
                  ))}
                </div>
                <div
                  className="absolute top-0 right-0 w-[120px] h-full pointer-events-none"
                  style={{ background: "linear-gradient(to right, rgba(253,253,252,0), rgba(253,253,252,0.92))" }}
                />
              </div>
              <div className="flex justify-end items-center gap-2 font-body text-[11px] tracking-[0.08em] uppercase text-ink -mt-6">
                Scroll <span className="text-[15px] leading-none">&#8594;</span>
              </div>
            </Fragment>
          );
        }

        return null;
      })}
    </div>
  );
}
