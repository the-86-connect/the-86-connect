"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  name: string;
  role: string;
  country: string;
  rating: number;
  quote: string;
  initials?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  title?: React.ReactNode;
  subtitle?: string;
  variant?: "study" | "sourcing";
}

export function Testimonials({
  testimonials,
  title,
  subtitle,
  variant = "study",
}: TestimonialsProps) {
  if (testimonials.length === 0) return null;

  const accentColor = variant === "study" ? "from-primary to-red-700" : "from-blue-600 to-cyan-600";
  const duplicated = [...testimonials, ...testimonials];

  return (
    <section className="py-16 sm:py-24 bg-muted/30 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 sm:mb-14">
        <div className="text-center">
          <h2 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight mb-4">
            {title ?? (
              <>
                What Our <span className="text-primary">Clients Say</span>
              </>
            )}
          </h2>
          {subtitle && (
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-muted/30 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-muted/30 to-transparent z-10 pointer-events-none" />

        <div className="flex gap-4 sm:gap-5 animate-marquee w-max">
          {duplicated.map((t, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[320px] sm:w-[400px] rounded-2xl bg-card border border-border/60 p-5 sm:p-6 shadow-soft-md"
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-muted-foreground/30",
                    )}
                  />
                ))}
              </div>

              <p className="text-foreground/90 leading-relaxed mb-4 text-sm sm:text-base line-clamp-3">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-black text-xs shrink-0",
                    accentColor,
                  )}
                >
                  {t.initials ?? t.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {t.role} · {t.country}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
