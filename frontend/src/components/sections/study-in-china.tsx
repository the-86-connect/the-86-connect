"use client";

import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  Award,
  TrendingUp,
  Globe,
  CheckCircle,
} from "lucide-react";

const HIGHLIGHTS = [
  "Scholarship applications",
  "University admissions",
  "Visa & accommodation",
  "24/7 local support",
];

const STATS = [
  { icon: TrendingUp, value: "500+", label: "Students placed" },
  { icon: Award, value: "98%", label: "Success rate" },
  { icon: Globe, value: "30+", label: "Countries" },
];

export function StudyInChinaSection() {
  return (
    <section
      id="study-in-china"
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-5 md:px-6 lg:px-8 bg-section-alt"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-red-500/20 via-red-500/5 to-transparent shadow-soft-sm">
          <div className="relative bg-white rounded-2xl overflow-hidden card-shine">
            <div className="grid md:grid-cols-2">
              <div className="p-5 sm:p-6 md:p-7 lg:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/5 border border-red-500/15 mb-4 sm:mb-5">
                  <Award className="h-3.5 w-3.5 text-red-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-red-500">
                    Education Service
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[-0.035em] mb-3 sm:mb-4 leading-[1.05]">
                  Study in <span className="text-red-500">China</span>
                </h2>
                <p className="text-sm sm:text-base md:text-base lg:text-lg text-muted-foreground leading-relaxed mb-5 sm:mb-6 font-medium">
                  Your gateway to China&apos;s top universities. We handle
                  scholarships, admissions, visas, and ongoing support so you can
                  focus on your education.
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
                  href="/study-in-china"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 h-12 md:h-12 lg:h-14 bg-red-500 text-white rounded-2xl font-black text-sm sm:text-base hover:bg-red-600 transition-all duration-200 cursor-pointer press lift-sm"
                >
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Explore & Apply</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-700 p-5 sm:p-6 md:p-7 lg:p-10 flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 mb-6 sm:mb-8">
                  {STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="text-center">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2 sm:mb-2 md:mb-2.5 lg:mb-3">
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-5 md:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-none mb-1">
                          {stat.value}
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
                    Partner universities include:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Tsinghua",
                      "Peking",
                      "Fudan",
                      "Shanghai Jiao Tong",
                      "Zhejiang",
                    ].map((uni) => (
                      <span
                        key={uni}
                        className="px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white shadow-soft-sm"
                      >
                        {uni}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
