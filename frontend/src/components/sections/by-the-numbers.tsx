"use client";

import { TrendingUp, Users, Shield, Globe } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const stats = [
  { value: "10+", label: "Years experience", icon: TrendingUp },
  { value: "500+", label: "Students placed", icon: Users },
  { value: "50K+", label: "Verified suppliers", icon: Shield },
  { value: "30+", label: "Countries served", icon: Globe },
];

export function ByTheNumbersSection() {
  return (
    <section className="relative py-16 sm:py-20 md:py-24 lg:py-28 overflow-hidden bg-section-alt">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-red opacity-[0.08] pointer-events-none"
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-5 md:px-6 lg:px-8 relative">
        <div className="text-center mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          <span className="inline-block text-xs sm:text-sm font-black text-primary tracking-[0.2em] uppercase mb-3">
            By the Numbers
          </span>
          <h2 className="font-display font-black text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground tracking-[-0.035em]">
            Trusted across the globe
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-7">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-white rounded-2xl border border-border/80 p-5 sm:p-6 md:p-6 lg:p-8 text-center shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl bg-primary/10 text-primary mb-3 sm:mb-4 md:mb-4 lg:mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>

              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-primary leading-none mb-1.5 sm:mb-2 tabular-nums">
                <AnimatedCounter value={stat.value} />
              </div>

              <div className="text-xs sm:text-xs md:text-sm text-muted-foreground font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
