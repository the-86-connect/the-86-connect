"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Play, X, Film } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Video } from "@/lib/api";

interface VideoGalleryProps {
  videos: Video[];
  title?: ReactNode;
  subtitle?: string;
}

export function VideoGallery({ videos, title, subtitle }: VideoGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (activeVideo) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActiveVideo(null);
    }
    if (activeVideo) {
      window.addEventListener("keydown", handleKey);
    }
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeVideo]);

  if (!videos || videos.length === 0) return null;

  return (
    <section
      id="videos"
      className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-section-warm relative overflow-hidden scroll-mt-24"
    >
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Film className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Video Gallery
            </span>
          </div>
          {title && (
            <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={() => setActiveVideo(video)}
            />
          ))}
        </div>
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveVideo(null)}
          role="dialog"
          aria-modal="true"
          aria-label={activeVideo.title}
        >
          <div
            className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-12 right-0 text-white hover:text-primary transition-colors z-10"
              aria-label="Close video"
            >
              <X className="h-8 w-8" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0`}
              title={activeVideo.title}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
}

function VideoCard({ video, onClick }: { video: Video; onClick: () => void }) {
  const thumbnailUrl = `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft-md",
        "hover:shadow-soft-xl hover:border-primary/30 transition-all duration-300",
        "cursor-pointer text-left",
      )}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://i.ytimg.com/vi/${video.youtubeId}/mqdefault.jpg`;
          }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
            <Play className="h-7 w-7 sm:h-9 sm:w-9 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
      </div>
    </button>
  );
}
