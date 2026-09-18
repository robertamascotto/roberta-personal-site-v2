import VideoTile from "./VideoTile";
import type { VideoGroup } from "@/studio/lib/helpers";

const LAYOUT_CLASSES: Record<VideoGroup["layout"], string> = {
  "wide-2up":
    "grid grid-cols-1 min-[801px]:grid-cols-2 gap-y-5 gap-x-[clamp(24px,4vw,40px)] max-[640px]:!gap-7",
  "vertical-3up":
    "grid grid-cols-1 min-[801px]:grid-cols-3 gap-5 max-[640px]:!flex max-[640px]:!flex-nowrap max-[640px]:!grid-cols-none max-[640px]:overflow-x-auto max-[640px]:!gap-3 max-[640px]:pb-1 max-[640px]:snap-x max-[640px]:snap-mandatory max-[640px]:[&::-webkit-scrollbar]:hidden [&>*]:max-[640px]:flex-none [&>*]:max-[640px]:!w-[68vw] [&>*]:max-[640px]:max-w-[300px] [&>*]:max-[640px]:snap-center",
  mixed:
    "grid grid-cols-1 min-[801px]:grid-cols-[1.78fr_1fr] gap-y-5 gap-x-[clamp(24px,4vw,40px)] max-[640px]:!gap-7 items-start",
};

export default function VideoGroupRenderer({ group, isLast = false }: { group: VideoGroup; isLast?: boolean }) {
  return (
    <section className={`border-t border-ink/12 pt-14 ${isLast ? "pb-[88px]" : "pb-[72px]"}`}>
      <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-6">
        {group.sectionLabel}
      </span>
      {group.intro && <p className="font-body text-[15px] leading-[25px] text-ink/72 mb-10">{group.intro}</p>}
      <div className={LAYOUT_CLASSES[group.layout]}>
        {group.videos.map((video, i) => (
          <VideoTile
            key={i}
            videoUrl={video.videoUrl}
            poster={video.poster}
            aspectRatio={video.aspectRatio}
            label={video.label}
            caption={video.caption}
            autoPlay={video.ambientLoop}
          />
        ))}
      </div>
    </section>
  );
}
