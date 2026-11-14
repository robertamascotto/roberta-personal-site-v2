import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getProductsPage, safeFetch, type ProductsPageProject } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import { FEATURED_PHOTOS } from "@/lib/productSelection";
import { assetId, focalPoint, imageDimensions, planColumns, type PhotoShape } from "@/lib/collage";
import ProjectBlock, { type SpreadProps } from "@/components/products/ProjectBlock";
import type { CollagePhoto } from "@/components/gallery/EditorialCollage";

export const metadata: Metadata = {
  title: "Products",
  description: "Ecommerce and lookbook photography for clothing and jewelry brands.",
  alternates: { canonical: "/products" },
};

type Frame = { image: unknown };

/** The project's own photos from its page-builder blocks, in order, without repeats. */
function galleryFrames(project: ProductsPageProject): Frame[] {
  const frames: Frame[] = [];
  for (const block of project.gallery ?? []) {
    if (block.image) frames.push({ image: block.image });
    for (const item of block.images ?? []) if (item.image) frames.push({ image: item.image });
  }
  const seen = new Set<string>();
  return frames.filter((f) => {
    const id = assetId(f.image);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

/** Applies the chosen-photos list (lib/productSelection.ts): only those, in that order. */
function chooseFrames(projectSlug: string, setSlug: string, frames: Frame[]): Frame[] {
  const wanted = FEATURED_PHOTOS[`${projectSlug}/${setSlug}`];
  if (!wanted) return frames;
  const byId = new Map(frames.map((f) => [assetId(f.image), f]));
  return wanted.map((id) => byId.get(id)).filter((f): f is Frame => !!f);
}

function toPhotos(frames: Frame[], describe: (n: number, total: number) => string): CollagePhoto[] {
  return frames.map((f, i) => ({
    src: urlFor(f.image).url(),
    alt: describe(i + 1, frames.length),
    focal: focalPoint(f.image),
  }));
}

export default async function ProductsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const projects = await safeFetch(getProductsPage(isPreview), []);

  const spreads: SpreadProps[] = projects.map((project) => {
    const ownFrames = galleryFrames(project);
    const sets = (project.sets ?? [])
      .map((set) => {
        const frames = chooseFrames(
          project.slug,
          set.slug,
          (set.photos ?? []).filter((f): f is Frame => !!f.image)
        );
        return {
          slug: set.slug,
          title: set.title,
          description: set.description,
          photos: toPhotos(frames, (n, total) => `${project.title}, ${set.title}: photo ${n} of ${total}`),
        };
      })
      .filter((set) => set.photos.length > 0);

    const shapes: PhotoShape[] = ownFrames.map((f) => {
      const dims = imageDimensions(f.image);
      return { ar: dims ? dims.w / dims.h : 1 };
    });

    return {
      slug: project.slug,
      title: project.title,
      category: project.categoryLabel,
      years: project.yearRange,
      lead: project.description,
      collage: ownFrames.length
        ? {
            photos: toPhotos(ownFrames, (n, total) => `${project.title}: photo ${n} of ${total}`),
            wide: planColumns(shapes, 4, 860),
            narrow: planColumns(shapes, 2, 500),
          }
        : undefined,
      sets,
    };
  });

  return (
    <div className="pr-page">
      <h1 className="sr-only">Products: ecommerce and lookbook photography for clothing and jewelry brands</h1>
      {spreads.length === 0 && <p className="text-ink/60">No projects yet.</p>}
      {spreads.map((spread) => (
        <ProjectBlock key={spread.slug} {...spread} />
      ))}
    </div>
  );
}
