import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { getMovementPage, safeFetch } from "@/studio/lib/helpers";
import PageContainer from "@/components/PageContainer";
import PageHero from "@/components/PageHero";
import VideoTile from "@/components/gallery/VideoTile";
import VideoGroupRenderer from "@/components/gallery/VideoGroupRenderer";

export const metadata: Metadata = {
  title: "Movement",
  description: "Reels and short-form video content.",
  alternates: { canonical: "/movement" },
};

export default async function MovementPage() {
  const { isEnabled: isPreview } = await draftMode();
  const page = await safeFetch(getMovementPage(isPreview), null);

  const reel = page?.featuredReel;
  const reelBlock = reel && (
    <div className="mb-6">
      <VideoTile videoUrl={reel.videoUrl} aspectRatio="21/9" autoPlay />
      <div className="mt-4">
        {reel.tag && <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-2">{reel.tag}</span>}
        <h2 className="font-accent italic font-light text-[22px] leading-[1.25] tracking-[-0.005em] m-0 mb-2">{reel.title}</h2>
        {reel.blurb && <p className="text-[15px] leading-[25px] text-ink/72 m-0">{reel.blurb}</p>}
        {reel.year && <span className="block mt-1.5 font-body text-xs tracking-[0.1em] text-ink/32">{reel.year}</span>}
      </div>
    </div>
  );

  return (
    <PageContainer>
      <PageHero
        label={page?.heroLabel || "Movement"}
        headline={page?.heroHeadline || "Reels and short-form video content."}
        body={page?.heroBody}
        maxWidth="max-w-3xl"
      />

      {reel && (reel.linkedEditorialSlug ? (
        <Link href={`/editorials/${reel.linkedEditorialSlug}`} className="block no-underline">
          {reelBlock}
        </Link>
      ) : (
        reelBlock
      ))}

      <div className="pb-8">
        {page?.videoGroups?.map((group, i) => (
          <VideoGroupRenderer key={i} group={group} />
        ))}
      </div>

      {!page && <p className="text-ink/60 pb-24">Add Movement page content in the Studio.</p>}
    </PageContainer>
  );
}
