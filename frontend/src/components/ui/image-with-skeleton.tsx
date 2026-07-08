"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  rounded?: string;
  onLoad?: () => void;
}

export function ImageWithSkeleton({
  src,
  alt,
  className,
  aspectRatio = "aspect-[4/3]",
  rounded = "rounded-2xl",
  onLoad,
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  return (
    <div className={cn("relative overflow-hidden", aspectRatio, rounded, className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={handleLoad}
        onError={() => setIsLoading(false)}
      />
    </div>
  );
}