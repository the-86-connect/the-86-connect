"use client";

import { useState } from "react";
import Image from "next/image";
import { GraduationCap, ChevronDown } from "lucide-react";

export interface University {
  name: string;
  location: string;
  rank: string;
  programs: string;
  scholarship: string;
  tier: "top" | "mid";
  image: string;
}

const INITIAL_COUNT = 6;

export function UniversitiesGrid({
  universities,
}: {
  universities: University[];
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded
    ? universities
    : universities.slice(0, INITIAL_COUNT);
  const hiddenCount = universities.length - INITIAL_COUNT;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
        {visible.map((uni) => (
          <div
            key={uni.name}
            className="bg-white rounded-3xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 overflow-hidden"
          >
            {/* Campus image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image
                src={uni.image}
                alt={`${uni.name} campus in ${uni.location}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                className={`absolute top-3 right-3 px-2.5 py-1 rounded-full backdrop-blur-sm text-xs font-black shadow-soft-sm ${uni.tier === "top" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {uni.tier === "top" ? "Top-Tier" : "Higher Acceptance"}
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white font-black text-sm">{uni.name}</p>
                <p className="text-white/80 text-xs font-medium">
                  {uni.location}
                </p>
              </div>
            </div>
            {/* Card body */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Partner University
                </span>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider">
                    Programs:
                  </span>
                  <span className="text-foreground font-medium">
                    {uni.programs}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider">
                    Scholarship:
                  </span>
                  <span className="text-primary font-bold">
                    {uni.scholarship}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="flex justify-center mt-8 sm:mt-10">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-red-700 text-white shadow-soft-md hover:shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-black"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                Show Less
                <ChevronDown className="h-4 w-4 rotate-180" />
              </>
            ) : (
              <>
                View All ({universities.length})
                <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
