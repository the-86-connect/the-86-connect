"use client";

import Link from "next/link";
import {
  ShoppingCart,
  ArrowRight,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

const HIGHLIGHTS = [
  "Supplier finding & vetting",
  "Procurement management",
  "Quality control inspections",
  "Logistics & shipping",
];

const STATS = [
  { icon: Shield, value: "50K+", label: "Verified suppliers" },
  { icon: Globe, value: "150+", label: "Countries shipped" },
  { icon: TrendingUp, value: "$50M+", label: "Trade volume" },
];

export function ProductSourcingSection() {
  return (
    <section
      id="product-sourcing"
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-5 md:px-6 lg:px-8 bg-section-warm-gradient"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-red-500/5 to-transparent shadow-soft-sm">
          <div className="relative bg-white rounded-2xl overflow-hidden card-shine">
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-red-500 to-red-700 p-5 sm:p-6 md:p-7 lg:p-10 flex flex-col justify-center order-2 md:order-1">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8">
                  {STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="text-center">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2 sm:mb-2 md:mb-2.5 lg:mb-3">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none mb-1 tabular-nums">
                          <AnimatedCounter value={stat.value} />
                        </div>
                        <div className="text-[10px] sm:text-[10px] md:text-xs text-white/80 font-bold">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-5 sm:pt-6 border-t border-white/20">
                  <p className="text-sm text-white/90 leading-relaxed font-medium mb-3">
                    Categories we source:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Electronics",
                      "Textiles",
                      "Machinery",
                      "Home & Garden",
                      "Auto Parts",
                    ].map((cat) => (
                      <span
                        key={cat}
                        className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white shadow-soft-sm"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 md:p-7 lg:p-10 order-1 md:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/5 border border-red-500/15 mb-4 sm:mb-5">
                  <Zap className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-500">
                    Sourcing Service
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[-0.035em] mb-3 sm:mb-4 leading-[1.05]">
                  Product <span className="text-red-500">Sourcing</span>
                </h2>
                <p className="text-sm sm:text-base md:text-base lg:text-lg text-muted-foreground leading-relaxed mb-5 sm:mb-6 font-medium">
                  Source quality products from China&apos;s verified
                  manufacturers. We handle supplier finding, procurement, quality
                  control, and logistics — end to end.
                </p>

                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 mb-6 sm:mb-7">
                  {HIGHLIGHTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm font-bold text-foreground"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-red-500 shrink-0"
                        strokeWidth={3}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/product-sourcing"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 h-12 md:h-12 lg:h-14 bg-red-500 text-white rounded-2xl font-black text-sm sm:text-base hover:bg-red-600 transition-all duration-200 cursor-pointer press lift-sm"
                >
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Explore & Inquire</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
