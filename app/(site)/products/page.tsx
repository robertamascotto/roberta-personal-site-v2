import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getProductsPage, safeFetch, type ProductsPageProject } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import { FEATURED_PHOTOS } from "@/lib/productSelection";
import { assetId, focalPoint, imageDimensions, planColumns, type PhotoShape } from "@/lib/collage";
import PageHero from "@/components/PageHero";
import ProductSpread, { type SpreadProps } from "@/components/products/ProductSpread";
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

const NUMBER_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six"];

export default async function ProductsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const projects = await safeFetch(getProductsPage(isPreview), []);

  const spreads: SpreadProps[] = projects.map((project, index) => {
    const ownFrames = galleryFrames(project);
    const sets = (project.sets ?? [])
      .map((set) => {
        const frames = chooseFrames(
          project.slug,
          set.slug,
          (set.photos ?? []).filter((f): f is Frame => !!f.image)
        );
        return {
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

    const coverDims = project.coverImage ? imageDimensions(project.coverImage) : null;
    const hero = project.coverImage
      ? {
          photo: toPhotos([{ image: project.coverImage }], () => `${project.title}, cover photo`)[0],
          ratio: coverDims ? coverDims.w / coverDims.h : 4 / 5,
        }
      : undefined;

    // A project with no written introduction gets a plain line naming its sets.
    const setNames = sets.map((s) => s.title);
    const lead =
      project.description ||
      (setNames.length
        ? `${NUMBER_WORDS[setNames.length] ?? setNames.length} set${setNames.length > 1 ? "s" : ""}: ${
            setNames.length > 1 ? `${setNames.slice(0, -1).join(", ")} and ${setNames[setNames.length - 1]}` : setNames[0]
          }.`
        : undefined);

    return {
      slug: project.slug,
      index,
      total: projects.length,
      flip: index % 2 === 1,
      title: project.title,
      category: project.categoryLabel,
      years: project.yearRange,
      lead,
      hero,
      collage: ownFrames.length
        ? {
            photos: toPhotos(ownFrames, (n, total) => `${project.title}: photo ${n} of ${total}`),
            wide: planColumns(shapes, 5, 1100),
            narrow: planColumns(shapes, 2),
          }
        : undefined,
      sets,
      photoCount: ownFrames.length + sets.reduce((n, s) => n + s.photos.length, 0),
    };
  });

  return (
    <div className="mx-auto w-[min(88vw,1240px)] max-[700px]:w-[calc(100%-40px)] pt-[90px] pb-24">
      <PageHero
        label="Products"
        headline={"Ecommerce and lookbook photography\nfor clothing and jewelry brands."}
        maxWidth="max-w-[1000px]"
        compactOnMobile
      />
      {spreads.length === 0 && <p className="text-ink/60">No projects yet.</p>}
      {spreads.map((spread) => (
        <ProductSpread key={spread.slug} {...spread} />
      ))}
    </div>
  );
}
