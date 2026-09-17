"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import { useReducedMotion } from "@/lib/useReducedMotion";
import type { Tag, Photo } from "@/studio/lib/helpers";

const aspectClassMap: Record<string, string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  cinematic: "aspect-[16/9]",
};

function getAspectClass(aspectRatio: string): string {
  if (aspectRatio === "natural") return "";
  return aspectClassMap[aspectRatio] || "";
}

interface PortfolioClientProps {
  photos: Photo[];
  tags: Tag[];
  heading: string;
  noPhotosText: string;
  allLabel: string;
  layout?: string;
  columns?: number;
  aspectRatio?: string;
}

export default function PortfolioClient({
  photos,
  tags,
  heading,
  noPhotosText,
  allLabel,
  layout = "masonry",
  columns = 3,
  aspectRatio = "natural",
}: PortfolioClientProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();

  const staggerDelay = (idx: number) =>
    reducedMotion ? "0ms" : `${Math.min(100 + idx * 80, 500)}ms`;

  useEffect(() => {
    if (reducedMotion) {
      setIsLoaded(true);
      return;
    }
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [reducedMotion]);

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages((prev) => new Set(prev).add(id));
  }, []);

  const filteredPhotos = useMemo(() => {
    if (!activeTag) return photos;
    return photos.filter(
      (p) => p.tags?.some((t) => t.slug === activeTag)
    );
  }, [photos, activeTag]);

  const slides = useMemo(
    () =>
      filteredPhotos.map((p) => ({
        src: p.src,
        alt: p.alt || "",
        description: p.caption || undefined,
      })),
    [filteredPhotos]
  );

  const colCount = Math.max(2, Math.min(4, columns));

  const gridColsClass =
    colCount === 2
      ? "grid-cols-1 md:grid-cols-2"
      : colCount === 4
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  // Masonry: distribute photos into columns via round-robin
  const masonryColumns = useMemo(() => {
    const cols: { photo: Photo; filteredIndex: number }[][] = Array.from(
      { length: colCount },
      () => []
    );
    filteredPhotos.forEach((photo, idx) => {
      cols[idx % colCount].push({ photo, filteredIndex: idx });
    });
    return cols;
  }, [filteredPhotos, colCount]);

  if (photos.length === 0) {
    return (
      <div className="py-12 md:py-16">
        <header className="mb-12 md:mb-16">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">
            {heading}
          </h1>
        </header>
        <div className="text-center py-16">
          <p className="text-warm-gray-light">{noPhotosText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16">
      {/* Page Heading */}
      <header className="mb-12 md:mb-16">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wide">
          {heading}
        </h1>
      </header>

      {/* Filter Tabs */}
      {tags.length > 0 && (
        <nav
          aria-label="Photo filters"
          className={`flex flex-wrap items-center gap-x-4 gap-y-2 mb-12 md:mb-16 opacity-0 ${
            isLoaded ? "animate-fade-in-up" : ""
          }`}
          style={{
            animationDelay: reducedMotion ? "0ms" : "200ms",
            animationFillMode: "forwards",
          }}
        >
          {/* All tab */}
          <button
            onClick={() => setActiveTag(null)}
            className="group relative py-2"
            aria-pressed={activeTag === null}
          >
            <span
              className={`text-[0.8125rem] tracking-[0.08em] uppercase transition-colors duration-500 ${
                activeTag === null
                  ? "text-warm-gray"
                  : "text-warm-gray-light hover:text-warm-gray"
              }`}
              style={{ transitionTimingFunction: "var(--ease-luxe)" }}
            >
              {allLabel}
            </span>
            <span
              className={`absolute bottom-0 left-0 h-px bg-accent transition-all duration-500 ${
                activeTag === null ? "w-full" : "w-0 group-hover:w-full"
              }`}
              style={{ transitionTimingFunction: "var(--ease-luxe)" }}
            />
          </button>

          {tags.map((tag) => (
            <span key={tag._id} className="flex items-center gap-4">
              <span
                className="text-warm-gray-lighter/40 text-xs select-none"
                aria-hidden="true"
              >
                ·
              </span>
              <button
                onClick={() => setActiveTag(tag.slug)}
                className="group relative py-2"
                aria-pressed={activeTag === tag.slug}
              >
                <span
                  className={`text-[0.8125rem] tracking-[0.08em] uppercase transition-colors duration-500 ${
                    activeTag === tag.slug
                      ? "text-warm-gray"
                      : "text-warm-gray-light hover:text-warm-gray"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                >
                  {tag.label}
                </span>
                <span
                  className={`absolute bottom-0 left-0 h-px bg-accent transition-all duration-500 ${
                    activeTag === tag.slug
                      ? "w-full"
                      : "w-0 group-hover:w-full"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                />
              </button>
            </span>
          ))}
        </nav>
      )}

      {/* Accent rule */}
      <div className="w-16 h-px bg-accent mb-12 md:mb-16" />

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-warm-gray-light">{noPhotosText}</p>
        </div>
      ) : layout === "single-column" ? (
        /* Single Column Layout */
        <div className="flex flex-col gap-8 md:gap-12 max-w-5xl mx-auto">
          {filteredPhotos.map((photo, idx) => (
            <button
              key={photo._id}
              onClick={() => {
                setLightboxIndex(idx);
                setLightboxOpen(true);
              }}
              aria-label={photo.alt || `View photograph ${idx + 1} in lightbox`}
              className={`relative bg-cream-dark overflow-hidden rounded-sm cursor-pointer group opacity-0 ${
                isLoaded ? "animate-scale-in" : ""
              } ${!loadedImages.has(photo._id) ? "skeleton-shimmer" : ""}`}
              style={{
                animationDelay: staggerDelay(idx),
                animationFillMode: "forwards",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt || `Photograph ${idx + 1}`}
                width={1200}
                height={800}
                sizes="(max-width: 768px) 100vw, 896px"
                style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                {...(photo.lqip
                  ? { placeholder: "blur" as const, blurDataURL: photo.lqip }
                  : {})}
                onLoad={() => handleImageLoad(photo._id)}
                onError={() => handleImageLoad(photo._id)}
                className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-[1.01] ${
                  loadedImages.has(photo._id) ? "opacity-100" : "opacity-0"
                }`}
              />
              <div
                className="absolute inset-0 bg-warm-gray/0 group-hover:bg-warm-gray/10 transition-all duration-500"
                style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      ) : layout === "grid" ? (
        /* Grid Layout */
        <div className={`grid ${gridColsClass} gap-6 md:gap-8`}>
          {filteredPhotos.map((photo, idx) => {
            const aspectClass = getAspectClass(aspectRatio);
            const isNatural = !aspectClass;
            return (
              <button
                key={photo._id}
                onClick={() => {
                  setLightboxIndex(idx);
                  setLightboxOpen(true);
                }}
                aria-label={photo.alt || `View photograph ${idx + 1} in lightbox`}
                className={`${aspectClass} relative bg-cream-dark overflow-hidden rounded-sm cursor-pointer group opacity-0 ${
                  isLoaded ? "animate-scale-in" : ""
                } ${!loadedImages.has(photo._id) ? "skeleton-shimmer" : ""}`}
                style={{
                  animationDelay: staggerDelay(idx),
                  animationFillMode: "forwards",
                }}
              >
                {isNatural ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt || `Photograph ${idx + 1}`}
                    width={1200}
                    height={800}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                    {...(photo.lqip
                      ? { placeholder: "blur" as const, blurDataURL: photo.lqip }
                      : {})}
                    onLoad={() => handleImageLoad(photo._id)}
                    onError={() => handleImageLoad(photo._id)}
                    className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-[1.02] ${
                      loadedImages.has(photo._id) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                ) : (
                  <Image
                    src={photo.src}
                    alt={photo.alt || `Photograph ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                    {...(photo.lqip
                      ? { placeholder: "blur" as const, blurDataURL: photo.lqip }
                      : {})}
                    onLoad={() => handleImageLoad(photo._id)}
                    onError={() => handleImageLoad(photo._id)}
                    className={`object-cover transition-all duration-700 group-hover:scale-[1.02] ${
                      loadedImages.has(photo._id) ? "opacity-100" : "opacity-0"
                    }`}
                  />
                )}
                <div
                  className="absolute inset-0 bg-warm-gray/0 group-hover:bg-warm-gray/10 transition-all duration-500"
                  style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      ) : (
        /* Masonry Layout (default) */
        <div className={`grid ${gridColsClass} gap-6 md:gap-8`}>
          {masonryColumns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-6 md:gap-8">
              {column.map(({ photo, filteredIndex }) => {
                const aspectClass = getAspectClass(aspectRatio);
                const isNatural = !aspectClass;
                return (
                  <button
                    key={photo._id}
                    onClick={() => {
                      setLightboxIndex(filteredIndex);
                      setLightboxOpen(true);
                    }}
                    aria-label={photo.alt || `View photograph ${filteredIndex + 1} in lightbox`}
                    className={`${aspectClass} relative bg-cream-dark overflow-hidden rounded-sm cursor-pointer group opacity-0 ${
                      isLoaded ? "animate-scale-in" : ""
                    } ${!loadedImages.has(photo._id) ? "skeleton-shimmer" : ""}`}
                    style={{
                      animationDelay: staggerDelay(filteredIndex),
                      animationFillMode: "forwards",
                    }}
                  >
                    {isNatural ? (
                      <Image
                        src={photo.src}
                        alt={photo.alt || `Photograph ${filteredIndex + 1}`}
                        width={800}
                        height={1000}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                        {...(photo.lqip
                          ? { placeholder: "blur" as const, blurDataURL: photo.lqip }
                          : {})}
                        onLoad={() => handleImageLoad(photo._id)}
                        onError={() => handleImageLoad(photo._id)}
                        className={`w-full h-auto object-cover transition-all duration-700 group-hover:scale-[1.02] ${
                          loadedImages.has(photo._id) ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    ) : (
                      <Image
                        src={photo.src}
                        alt={photo.alt || `Photograph ${filteredIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                        {...(photo.lqip
                          ? { placeholder: "blur" as const, blurDataURL: photo.lqip }
                          : {})}
                        onLoad={() => handleImageLoad(photo._id)}
                        onError={() => handleImageLoad(photo._id)}
                        className={`object-cover transition-all duration-700 group-hover:scale-[1.02] ${
                          loadedImages.has(photo._id) ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    )}
                    <div
                      className="absolute inset-0 bg-warm-gray/0 group-hover:bg-warm-gray/10 transition-all duration-500"
                      style={{ transitionTimingFunction: "var(--ease-luxe)" }}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom, Captions]}
        styles={{
          container: {
            backgroundColor:
              "color-mix(in srgb, var(--color-warm-gray) 95%, transparent)",
          },
        }}
        controller={{ closeOnBackdropClick: true }}
        carousel={{ finite: false, preload: 2 }}
        animation={{ fade: 300, swipe: 300 }}
      />
    </div>
  );
}
