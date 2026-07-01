"use client";

import { TrendingUp, Users, Shield, Globe } from "lucide-react";

const stats = [
  { value: "10+", label: "Years experience", icon: TrendingUp },
  { value: "500+", label: "Students placed", icon: Users },
  { value: "50K+", label: "Verified suppliers", icon: Shield },
  { value: "30+", label: "Countries served", icon: Globe },
];

export function ByTheNumbersSection() {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-section-alt">
      {/* Subtle decorative background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid-red opacity-[0.08] pointer-events-none"
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative">
        {/* Section heading */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block text-xs sm:text-sm font-black text-primary tracking-[0.2em] uppercase mb-3">
            By the Numbers
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-foreground tracking-[-0.035em]">
            Trusted across the globe
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-7">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-white rounded-2xl border border-border/80 p-6 sm:p-8 text-center shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 text-primary mb-4 sm:mb-5 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <stat.icon className="h-6 w-6" strokeWidth={2.5} />
              </div>

              {/* Value */}
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary leading-none mb-2">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-xs sm:text-sm text-muted-foreground font-bold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
