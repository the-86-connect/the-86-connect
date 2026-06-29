"use client";

import Link from "next/link";
import {
  GraduationCap,
  ShoppingCart,
  ArrowRight,
  Shield,
  Award,
  Globe,
  TrendingUp,
  CheckCircle2,
  Users,
  MapPin,
  Building2,
  FileCheck,
  Package,
} from "lucide-react";

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-[92dvh] w-full overflow-hidden bg-hero-gradient pt-24 pb-16 sm:pt-28 sm:pb-20"
    >
      {/* Decorative orbs */}
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

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[70dvh]">
          {/* Left content */}
          <div className="lg:col-span-6 text-center lg:text-left">
            {/* Headline */}
            <h1
              className="font-display font-black text-[2.4rem] sm:text-6xl md:text-7xl lg:text-[4.8rem] leading-[0.95] tracking-[-0.04em] mb-5 sm:mb-6 animate-reveal-up"
              style={{ animationDelay: "0ms" }}
            >
              <span className="block text-foreground">Your Bridge to</span>
              <span className="block text-gradient-red-animated">China.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 sm:mb-10 leading-relaxed font-medium mx-auto lg:mx-0 animate-reveal-up"
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
                className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 h-14 bg-primary text-white rounded-2xl font-black text-base sm:text-lg hover:bg-red-700 transition-all duration-200 cursor-pointer press btn-primary-glow shadow-red active:translate-y-[1px]"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Study in China</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/product-sourcing"
                className="group inline-flex items-center justify-center gap-2 px-7 sm:px-8 h-14 bg-slate-900 text-white rounded-2xl font-black text-base sm:text-lg shadow-lg hover:bg-slate-800 hover:shadow-xl active:translate-y-[1px] transition-all duration-200 cursor-pointer press"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Source Products</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-3 animate-reveal-up"
              style={{ animationDelay: "300ms" }}
            >
              <TrustBadge icon={Shield} label="Verified Partners" />
              <TrustBadge icon={Award} label="Scholarship Experts" />
              <TrustBadge icon={Globe} label="30+ Countries" />
            </div>
          </div>

          {/* Right visual — floating cards */}
          <div
            className="lg:col-span-6 relative hidden lg:block"
            aria-hidden="true"
          >
            <div className="relative h-[500px] w-full">
              {/* Center card — service showcase */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 float-card rounded-3xl p-6 animate-float-gentle z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-red-sm">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                      Active Service
                    </p>
                    <p className="font-display font-black text-lg leading-tight">
                      Study in China
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <MiniStat
                    icon={Building2}
                    label="Top Universities"
                    value="Tsinghua, Peking, Fudan"
                  />
                  <MiniStat
                    icon={FileCheck}
                    label="Scholarships"
                    value="Full & Partial Available"
                  />
                  <MiniStat
                    icon={Users}
                    label="Students Placed"
                    value="500+ this year"
                  />
                </div>
                <div className="mt-5 pt-4 border-t border-border/60 flex items-center gap-2">
                  <span className="dot-pulse" />
                  <span className="text-xs font-bold text-green-600">
                    Applications Open
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    2026 Intake
                  </span>
                </div>
              </div>

              {/* Top-right card — sourcing */}
              <div className="absolute top-4 right-0 w-64 float-card rounded-2xl p-4 animate-float-gentle-delayed z-20">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">
                      Sourcing
                    </p>
                    <p className="font-black text-sm leading-tight">
                      Product Sourcing
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  <span>50K+ Verified Suppliers</span>
                </div>
              </div>

              {/* Bottom-left card — stats */}
              <div
                className="absolute bottom-8 left-0 w-56 float-card rounded-2xl p-4 animate-float-gentle z-20"
                style={{ animationDelay: "-3s" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-primary leading-none">
                      10+
                    </p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Years Experience
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom-right card — quick checkmarks */}
              <div className="absolute bottom-4 right-4 w-52 float-card rounded-2xl p-4 animate-float-gentle-delayed z-20">
                <div className="space-y-2">
                  {["Visa Support", "24/7 Assistance", "End-to-End"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs font-bold text-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Top-left decorative element */}
              <div className="absolute top-8 left-4 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/10 to-red-100/50 backdrop-blur-sm border border-primary/10 flex items-center justify-center animate-float-gentle">
                <MapPin className="h-8 w-8 text-primary/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div
          className="mt-8 sm:mt-12 max-w-5xl mx-auto animate-reveal-up"
          style={{ animationDelay: "400ms" }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-border/60 shadow-soft-lg p-5 sm:p-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
              <Stat value="10+" label="Years experience" icon={TrendingUp} />
              <Stat value="500+" label="Students placed" icon={Users} />
              <Stat value="50K+" label="Verified suppliers" icon={Shield} />
              <Stat value="30+" label="Countries served" icon={Globe} />
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
    <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground/80">
      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
        <Icon className="h-3 w-3 text-white" strokeWidth={3} />
      </div>
      <span>{label}</span>
    </div>
  );
}

function Stat({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: typeof TrendingUp;
}) {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-1 sm:mb-1.5">
        <Icon className="h-4 w-4 text-primary/70 hidden sm:block" />
        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-primary leading-none">
          {value}
        </div>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-bold">
        {label}
      </div>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-bold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}
