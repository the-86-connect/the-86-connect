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
      className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-section-alt"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shadow-soft-sm">
          <div className="relative bg-white rounded-2xl overflow-hidden card-shine">
            <div className="grid lg:grid-cols-2">
              {/* Left content */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Education Service
                  </span>
                </div>
                <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                  Study in <span className="text-primary">China</span>
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 font-medium">
                  Your gateway to China&apos;s top universities. We handle
                  scholarships, admissions, visas, and ongoing support so you can
                  focus on your education.
                </p>

                <ul className="grid grid-cols-2 gap-2.5 mb-7">
                  {HIGHLIGHTS.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm font-bold text-foreground"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-primary shrink-0"
                        strokeWidth={3}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/study-in-china"
                  className="inline-flex items-center gap-2 px-6 h-14 bg-primary text-white rounded-2xl font-black text-base hover:bg-red-700 transition-all duration-200 cursor-pointer press lift-sm"
                >
                  <GraduationCap className="h-5 w-5" />
                  <span>Explore & Apply</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Right stats panel */}
              <div className="bg-gradient-to-br from-primary to-red-800 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {STATS.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="text-center">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-none mb-1">
                          {stat.value}
                        </div>
                        <div className="text-[10px] sm:text-xs text-white/80 font-bold">
                          {stat.label}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-6 border-t border-white/20">
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
                        className="px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white shadow-soft-sm"
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
