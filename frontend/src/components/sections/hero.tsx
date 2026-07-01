"use client";

import Link from "next/link";
import { useState } from "react";
import {
  GraduationCap,
  ShoppingCart,
  ArrowRight,
  Shield,
  Award,
  Globe,
} from "lucide-react";

export function HeroSection() {
  const [imageErrored, setImageErrored] = useState(false);
  const showImage = !imageErrored;

  return (
    <section
      id="hero"
      className={`relative min-h-[92dvh] w-full overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 ${
        showImage ? "" : "bg-hero-gradient"
      }`}
    >
      {/* Hero background image (preloaded, then shown via CSS background) */}
      {showImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-banner-pc.jpg"
            alt=""
            aria-hidden="true"
            className="hidden"
            onError={() => setImageErrored(true)}
            loading="eager"
            fetchPriority="high"
          />
        </>
      )}

      {/* Background image layer — uses CSS background for reliable media query behavior */}
      {showImage && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 bg-[url('/hero-banner-phone.jpg')] lg:bg-[url('/hero-banner-pc.jpg')] bg-cover bg-center brightness-90"
        />
      )}

      {/* Decorative orbs (only when no image is shown — the fallback design) */}
      {!showImage && (
        <>
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-32 w-96 h-96 orb-red-soft pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] orb-red-soft opacity-60 pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-grid-red opacity-[0.4] pointer-events-none"
          />
        </>
      )}

      {/* Light overlay for text readability — only when image is shown, more subtle */}
      {showImage && (
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/28 to-black/8 pointer-events-none z-[1]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/8 to-black/0 pointer-events-none z-[1]"
          />
        </>
      )}

      <div
        className={`container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative ${
          showImage ? "z-10" : ""
        }`}
      >
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70dvh]">
          {/* Left content */}
          <div className="lg:col-span-7 lg:col-start-1 text-center lg:text-left">
            {/* Headline */}
            <h1
              className={`font-display font-black text-[2.5rem] sm:text-[4.25rem] md:text-7xl lg:text-[5.2rem] leading-[0.92] tracking-[-0.045em] mb-5 sm:mb-6 animate-reveal-up ${
                showImage
                  ? "text-white [text-shadow:0_4px_36px_rgba(0,0,0,0.95),0_2px_8px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,1)]"
                  : "text-foreground"
              }`}
              style={{ animationDelay: "0ms" }}
            >
              <span
                className={`block ${
                  showImage
                    ? "text-white [text-shadow:0_4px_36px_rgba(0,0,0,0.95),0_2px_8px_rgba(0,0,0,1),0_1px_3px_rgba(0,0,0,1)]"
                    : "text-foreground"
                }`}
              >
                Your Bridge to
              </span>
              <span
                className={`block ${
                  showImage
                    ? "bg-gradient-to-r from-red-400 via-red-500 to-red-400 bg-clip-text text-transparent [text-shadow:none] drop-shadow-[0_4px_36px_rgba(0,0,0,0.95)]"
                    : "text-gradient-red-animated"
                }`}
              >
                China.
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-base sm:text-lg md:text-[1.2rem] max-w-2xl mb-8 sm:mb-10 leading-relaxed tracking-[-0.01em] font-semibold mx-auto lg:mx-0 animate-reveal-up ${
                showImage
                  ? "text-white/90 [text-shadow:0_3px_24px_rgba(0,0,0,0.95),0_1px_6px_rgba(0,0,0,1),0_1px_2px_rgba(0,0,0,1)]"
                  : "text-muted-foreground"
              }`}
              style={{ animationDelay: "100ms" }}
            >
              Premium consulting for international education and business
              procurement. We connect the world with China&apos;s top
              universities and trusted manufacturers — end-to-end, fully
              managed.
            </p>

            {/* CTA buttons */}
            <div
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 animate-reveal-up"
              style={{ animationDelay: "200ms" }}
            >
              <Link
                href="/study-in-china"
                className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 h-14 bg-gradient-to-r from-primary to-red-700 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg shadow-red-900/25 hover:-translate-y-[1px] hover:shadow-xl hover:shadow-red-900/35 active:translate-y-[1px] transition-all duration-300 ease-out cursor-pointer press btn-primary-glow"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Study in China</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="/product-sourcing"
                className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 h-14 bg-white text-slate-900 rounded-2xl font-black text-base sm:text-lg shadow-lg hover:-translate-y-[1px] hover:bg-white/90 hover:shadow-xl active:translate-y-[1px] transition-all duration-300 ease-out cursor-pointer press"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Source Products</span>
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className={`flex flex-wrap items-center justify-center lg:justify-start gap-x-7 gap-y-3 animate-reveal-up ${
                showImage ? "text-white" : ""
              }`}
              style={{ animationDelay: "300ms" }}
            >
              <TrustBadge
                icon={Shield}
                label="Verified Partners"
                onDark={showImage}
              />
              <TrustBadge
                icon={Award}
                label="Scholarship Experts"
                onDark={showImage}
              />
              <TrustBadge
                icon={Globe}
                label="30+ Countries"
                onDark={showImage}
              />
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
  onDark = false,
}: {
  icon: typeof Shield;
  label: string;
  onDark?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2.5 text-xs sm:text-sm font-bold tracking-wide ${
        onDark
          ? "text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.9),0_1px_2px_rgba(0,0,0,0.9)]"
          : "text-foreground/80"
      }`}
    >
      <div className="w-6 h-6 rounded-full bg-primary/90 flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
        <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
      </div>
      <span>{label}</span>
    </div>
  );
}
