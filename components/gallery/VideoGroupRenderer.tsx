import VideoTile from "./VideoTile";
import type { VideoGroup } from "@/studio/lib/helpers";

const LAYOUT_CLASSES: Record<VideoGroup["layout"], string> = {
  "wide-2up": "grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-10",
  "vertical-3up": "grid grid-cols-1 sm:grid-cols-3 gap-5",
  mixed: "grid grid-cols-1 md:grid-cols-[1.78fr_1fr] gap-7 md:gap-10 items-start",
};

export default function VideoGroupRenderer({ group }: { group: VideoGroup }) {
  return (
    <section className="border-t border-ink/10 py-14">
      <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-6">
        {group.sectionLabel}
      </span>
      {group.intro && (
        <p className="font-body text-[15px] leading-[25px] text-ink/72 max-w-[60ch] mb-10">{group.intro}</p>
      )}
      <div className={LAYOUT_CLASSES[group.layout]}>
        {group.videos.map((video, i) => (
          <VideoTile
            key={i}
            videoUrl={video.videoUrl}
            poster={video.poster}
            aspectRatio={video.aspectRatio}
            label={video.label}
            caption={video.caption}
          />
        ))}
      </div>
    </section>
  );
}
