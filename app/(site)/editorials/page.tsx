import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getEditorialsWithGalleries, safeFetch } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import { isHiddenEditorial } from "@/lib/constants";
import { focalPoint, imageDimensions } from "@/lib/collage";
import { EDITORIAL_PLAN, sortEditorials } from "@/lib/editorialLayout";
import EditorialRect, { type RectPhoto } from "@/components/gallery/EditorialRect";

export const metadata: Metadata = {
  title: "Editorials",
  description: "Personal and campaign portrait series.",
  alternates: { canonical: "/editorials" },
};

export default async function EditorialsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const all = await safeFetch(getEditorialsWithGalleries(isPreview), []);
  const editorials = sortEditorials(all.filter((e) => !isHiddenEditorial(e.slug) && (e.gallery?.length ?? 0) > 0));

  return (
    <div className="ed-page">
      <h1 className="sr-only">Editorials: personal and campaign portrait series</h1>
      {editorials.length === 0 && <p className="text-ink/60">No editorials yet.</p>}

      {editorials.map((editorial) => {
        const frames = (editorial.gallery ?? []).filter((f) => f.image);
        const total = frames.length;
        // The stored photo descriptions are old auto-generated labels with previous shoot names,
        // so describe each photo from the current title instead.
        const photos: RectPhoto[] = frames.map((f, i) => {
          const dims = imageDimensions(f.image);
          return {
            src: urlFor(f.image).url(),
            alt: `${editorial.title}, photo ${i + 1} of ${total}`,
            focal: focalPoint(f.image),
            ar: dims ? dims.w / dims.h : 1.5,
          };
        });

        // optional tall photos made for phones: when a shoot has them, phones show those instead
        const mFrames = (editorial.mobileGallery ?? []).filter((f) => f.image);
        const mobilePhotos: RectPhoto[] | undefined = mFrames.length
          ? mFrames.map((f, i) => {
              const dims = imageDimensions(f.image);
              return {
                src: urlFor(f.image).url(),
                alt: `${editorial.title}, photo ${i + 1} of ${mFrames.length}`,
                focal: focalPoint(f.image),
                ar: dims ? dims.w / dims.h : 2 / 3,
              };
            })
          : undefined;

        const plan = EDITORIAL_PLAN[editorial.slug] ?? { mode: "scroll" as const };
        // hand-picked rows only apply while the shoot still has the photos they were made for
        const rows = plan.rows && plan.photoCount === total ? plan.rows : undefined;
        const pick = plan.pick !== undefined && plan.pick < total ? plan.pick : 0;

        return (
          <EditorialRect
            key={editorial._id}
            slug={editorial.slug}
            title={editorial.title}
            description={editorial.description || undefined}
            photos={photos}
            mobilePhotos={mobilePhotos}
            mode={plan.mode}
            pick={pick}
            pos={plan.pos}
            rows={rows}
          />
        );
      })}
    </div>
  );
}
