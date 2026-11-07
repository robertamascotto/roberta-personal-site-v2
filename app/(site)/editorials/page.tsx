import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getEditorialsWithGalleries, safeFetch } from "@/studio/lib/helpers";
import { urlFor } from "@/studio/lib/image";
import { isHiddenEditorial } from "@/lib/constants";
import { focalPoint, imageDimensions, planColumns, type PhotoShape } from "@/lib/collage";
import PageHero from "@/components/PageHero";
import EditorialCollage, { type CollagePhoto } from "@/components/gallery/EditorialCollage";

export const metadata: Metadata = {
  title: "Editorials",
  description: "Personal and campaign portrait series.",
  alternates: { canonical: "/editorials" },
};

export default async function EditorialsPage() {
  const { isEnabled: isPreview } = await draftMode();
  const all = await safeFetch(getEditorialsWithGalleries(isPreview), []);
  const editorials = all.filter((e) => !isHiddenEditorial(e.slug) && (e.gallery?.length ?? 0) > 0);

  return (
    <div className="mx-auto w-[min(72vw,980px)] max-[700px]:w-[calc(100%-40px)] pt-[90px] pb-24">
      <PageHero label="Editorial" headline="Personal and campaign portrait series." maxWidth="max-w-[60ch]" compactOnMobile />

      {editorials.length === 0 && <p className="text-ink/60">No editorials yet.</p>}

      {editorials.map((editorial) => {
        const frames = (editorial.gallery ?? []).filter((f) => f.image);
        const total = frames.length;

        const shapes: PhotoShape[] = frames.map((f) => {
          const dims = imageDimensions(f.image);
          return { ar: dims ? dims.w / dims.h : 1.5 };
        });
        // The stored photo descriptions are old auto-generated labels with previous shoot names,
        // so describe each photo from the current title instead.
        const photos: CollagePhoto[] = frames.map((f, i) => ({
          src: urlFor(f.image).url(),
          alt: `${editorial.title}, photo ${i + 1} of ${total}`,
          focal: focalPoint(f.image),
        }));

        return (
          <section key={editorial._id} id={editorial.slug} className="scroll-mt-24 pt-20 max-[640px]:pt-14">
            <h2 className="font-heading font-black text-[clamp(30px,3.6vw,46px)] leading-none tracking-[-0.01em] m-0 mb-1.5">
              {editorial.title}
            </h2>
            {editorial.year && (
              <span className="block mb-5 font-body text-xs tracking-[0.1em] text-ink/32">{editorial.year}</span>
            )}
            {editorial.description && (
              <p className="text-[15px] leading-[25px] text-ink/72 whitespace-pre-line m-0 mb-9 max-w-[62ch]">
                {editorial.description}
              </p>
            )}
            <EditorialCollage
              title={editorial.title}
              photos={photos}
              wide={planColumns(shapes, 4)}
              narrow={planColumns(shapes, 2)}
            />
          </section>
        );
      })}
    </div>
  );
}
