import Image from "next/image";
import { urlFor } from "@/studio/lib/image";

interface AspectImageProps {
  image: unknown;
  alt: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  objectFit?: "cover" | "contain";
  background?: string;
}

export default function AspectImage({
  image,
  alt,
  aspectRatio = "4/5",
  sizes = "(max-width: 768px) 100vw, 50vw",
  priority = false,
  className = "",
  objectFit = "cover",
  background,
}: AspectImageProps) {
  if (!image) return null;
  const src = urlFor(image).width(1600).fit("max").auto("format").url();

  return (
    <figure
      className={`relative m-0 overflow-hidden ${className}`}
      style={{ aspectRatio, ...(background ? { background } : {}) }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={objectFit === "contain" ? "object-contain" : "object-cover"}
      />
    </figure>
  );
}
