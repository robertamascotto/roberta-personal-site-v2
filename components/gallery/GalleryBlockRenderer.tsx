import AspectImage from "./AspectImage";
import type { GalleryBlock } from "@/studio/lib/helpers";

export default function GalleryBlockRenderer({ blocks }: { blocks?: GalleryBlock[] }) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-10">
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
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${block.columns}, 1fr)` }}
            >
              {block.images.map((img, j) => (
                <AspectImage key={j} image={img.image} alt={img.alt} aspectRatio={img.aspectRatio} />
              ))}
            </div>
          );
        }

        if (block._type === "scrollStripBlock") {
          return (
            <div key={i} className="full-bleed">
              <div className="flex gap-4 overflow-x-auto px-5 md:px-[clamp(20px,5vw,64px)] pb-2" style={{ scrollSnapType: "x proximity" }}>
                {block.images.map((img, j) => (
                  <figure key={j} className="m-0 flex-none" style={{ scrollSnapAlign: "start" }}>
                    <AspectImage
                      image={img.image}
                      alt={img.alt}
                      aspectRatio={img.aspectRatio}
                      className="h-[clamp(280px,34vw,520px)] w-auto"
                    />
                  </figure>
                ))}
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
