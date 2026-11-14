import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { getMovementPage, safeFetch } from "@/studio/lib/helpers";
import MovementCinema, { type Clip } from "@/components/movement/MovementCinema";
import measured from "@/lib/movementClips.json";

export const metadata: Metadata = {
  title: "Movement",
  description: "Reels and short-form video content.",
  alternates: { canonical: "/movement" },
};

const pad = (n: number) => String(n).padStart(2, "0");

/** running time and shape of a clip, measured ahead of time (scripts/build-movement-thumbs.mjs); missing for a brand new video */
const measure = (url: string): Pick<Clip, "duration" | "aspect"> => {
  const hash = url.split("/").pop()?.replace(/\.mp4$/, "") ?? "";
  const m = (measured as Record<string, { d: number; ar: number }>)[hash];
  return m ? { duration: m.d, aspect: m.ar } : {};
};

export default async function MovementPage() {
  const { isEnabled: isPreview } = await draftMode();
  const page = await safeFetch(getMovementPage(isPreview), null);

  // the reel first, then every section's videos in order: this is the order along the timeline
  const clips: Clip[] = [];
  const reel = page?.featuredReel;
  if (reel?.videoUrl) {
    clips.push({ url: reel.videoUrl, name: reel.title, caption: reel.blurb ?? "", group: "Movement", ...measure(reel.videoUrl) });
  }
  for (const group of page?.videoGroups ?? []) {
    (group.videos ?? []).forEach((video, i) => {
      if (!video.videoUrl) return;
      clips.push({
        url: video.videoUrl,
        name: video.label || `${group.sectionLabel} ${pad(i + 1)}`,
        caption: video.caption || group.intro || "",
        group: group.sectionLabel,
        ...measure(video.videoUrl),
      });
    });
  }

  return (
    <>
      <h1 className="sr-only">{page?.heroHeadline || "Reels and short-form video content."}</h1>
      {page?.heroBody && <p className="sr-only">{page.heroBody}</p>}
      {clips.length > 0 ? (
        <>
          <MovementCinema clips={clips} />
          <ul className="sr-only">
            {clips.map((clip) => (
              <li key={clip.url}>
                {clip.group}: {clip.name}. {clip.caption}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="text-ink/60 pt-24">Add Movement page content in the Studio.</p>
      )}
    </>
  );
}
