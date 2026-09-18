"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { urlFor } from "@/studio/lib/image";

interface VideoTileProps {
  videoUrl?: string;
  poster?: unknown;
  aspectRatio?: string;
  label?: string;
  caption?: string;
  /** Ambient background video: autoplays muted and looped, no click-to-play chrome. */
  autoPlay?: boolean;
}

export default function VideoTile({ videoUrl, poster, aspectRatio = "16/9", label, caption, autoPlay = false }: VideoTileProps) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videoUrl) return null;
  const posterUrl = poster ? urlFor(poster).width(1200).url() : undefined;

  if (autoPlay) {
    return (
      <div className="min-w-0">
        <div className="relative w-full overflow-hidden bg-ink" style={{ aspectRatio }}>
          <video
            src={videoUrl}
            muted
            loop
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        {(label || caption) && (
          <div className="mt-4 max-w-[56ch]">
            {label && <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-2">{label}</span>}
            {caption && <p className="font-body text-[15px] leading-[25px] text-ink/72 m-0">{caption}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div
        className="relative w-full overflow-hidden bg-ink cursor-pointer"
        style={{ aspectRatio }}
        onClick={() => setPlaying(true)}
      >
        {playing ? (
          <>
            <video
              ref={videoRef}
              src={videoUrl}
              controls
              controlsList="nofullscreen nodownload noremoteplayback noplaybackrate"
              disablePictureInPicture
              autoPlay
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Lets clicking the video frame itself toggle play/pause, without
                covering the native control bar (~40px) at the bottom. */}
            <div
              className="absolute inset-x-0 top-0 bottom-10 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const v = videoRef.current;
                if (!v) return;
                if (v.paused) v.play();
                else v.pause();
              }}
            />
          </>
        ) : (
          <>
            {posterUrl && (
              <Image src={posterUrl} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
            )}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[62px] h-[62px] rounded-full border border-paper/80 flex items-center justify-center">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#FDFDFC" className="ml-[3px]">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </>
        )}
      </div>
      {(label || caption) && (
        <div className="mt-4 max-w-[56ch]">
          {label && (
            <span className="block font-body text-xs tracking-[0.14em] uppercase text-ink/50 mb-2">{label}</span>
          )}
          {caption && <p className="font-body text-[15px] leading-[25px] text-ink/72 m-0">{caption}</p>}
        </div>
      )}
    </div>
  );
}
