"use client";

import Link from "next/link";
import {
  GraduationCap,
  ShoppingCart,
  ArrowRight,
  Shield,
  Award,
  Globe,
} from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[100svh] sm:min-h-[92dvh] md:min-h-[85dvh] lg:min-h-[92dvh] w-full overflow-hidden pt-14 pb-8 sm:pt-20 sm:pb-20 md:pt-24 md:pb-16 bg-gradient-to-br from-slate-900 via-slate-800 to-red-950"
    >
      {/* Mobile background image — hidden on md+, if it fails gradient shows through automatically */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center md:hidden"
        style={{ backgroundImage: "url('/hero-banner-phone.jpg')" }}
      />

      {/* Desktop/tablet background image — hidden below md, if it fails gradient shows through automatically */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center hidden md:block"
        style={{ backgroundImage: "url('/hero-banner-pc.jpg')" }}
      />

      {/* Dark overlay to ensure white text is readable over the image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-r from-black/70 via-black/40 to-black/10 pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-12 gap-6 md:gap-8 lg:gap-12 items-center min-h-[calc(100svh-3.5rem)] sm:min-h-0 md:min-h-0 lg:min-h-[70dvh]">
          {/* Left content */}
          <div className="md:col-span-8 lg:col-span-7 lg:col-start-1 text-center md:text-left pt-2 sm:pt-0">
            <h1
              className="font-display font-black text-[1.65rem] sm:text-[1.85rem] md:text-[2.2rem] lg:text-[3.5rem] leading-[1.15] sm:leading-[1.12] tracking-[-0.045em] -mt-8 sm:mt-0 mb-3 sm:mb-5 md:mb-5 lg:mb-6 text-white animate-reveal-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="block">86Connect —</span>
              <span className="block mt-1 sm:mt-1.5 md:mt-1.5 lg:mt-2 text-red-400">
                Your Bridge to China
              </span>
            </h1>

            <p
              className="text-sm sm:text-lg md:text-base lg:text-[1.2rem] max-w-md sm:max-w-xl md:max-w-xl lg:max-w-2xl mb-4 sm:mb-8 md:mb-7 lg:mb-10 leading-relaxed tracking-[-0.01em] font-semibold mx-auto md:mx-0 text-white/85 animate-reveal-up px-1 sm:px-0"
              style={{ animationDelay: "100ms" }}
            >
              86Connect is a Beijing-based consultancy that helps
              international students secure admission to China&apos;s top
              universities and assists businesses in sourcing products from
              verified Chinese manufacturers — all through a single,
              end-to-end managed service.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-3 lg:gap-4 mb-5 sm:mb-8 md:mb-7 lg:mb-10 justify-center md:justify-start animate-reveal-up px-2 sm:px-0"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                href="/study-in-china"
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-5 md:px-5 lg:px-6 h-12 sm:h-12 md:h-12 lg:h-14 bg-red-600 text-white rounded-2xl font-black text-sm sm:text-base md:text-base lg:text-lg shadow-lg shadow-red-900/30 hover:-translate-y-[1px] hover:bg-red-700 hover:shadow-xl hover:shadow-red-900/40 active:translate-y-[1px] transition-all duration-300 ease-out cursor-pointer press w-full sm:w-auto"
              >
                <GraduationCap className="h-4 w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                <span>Study in China</span>
                <ArrowRight className="h-4 w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/product-sourcing"
                className="group inline-flex items-center justify-center gap-2 px-5 sm:px-5 md:px-5 lg:px-6 h-12 sm:h-12 md:h-12 lg:h-14 bg-white text-slate-900 rounded-2xl font-black text-sm sm:text-base md:text-base lg:text-lg shadow-lg hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-xl active:translate-y-[1px] transition-all duration-300 ease-out cursor-pointer press w-full sm:w-auto"
              >
                <ShoppingCart className="h-4 w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5" />
                <span>Source Products</span>
                <ArrowRight className="h-4 w-4 sm:h-4 sm:w-4 md:h-4 md:w-4 lg:h-5 lg:w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2.5 sm:gap-x-5 md:gap-x-6 lg:gap-x-7 text-white/80 animate-reveal-up"
              style={{ animationDelay: "300ms" }}
            >
              <TrustBadge icon={Shield} label="Verified Partners" />
              <TrustBadge icon={Award} label="Scholarship Experts" />
              <TrustBadge icon={Globe} label="30+ Countries" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Shield;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-xs md:text-sm font-bold tracking-wide text-white/80">
      <div className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
        <Icon className="h-3 w-3 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5 text-white" strokeWidth={2.5} />
      </div>
      <span>{label}</span>
    </div>
  );
}
