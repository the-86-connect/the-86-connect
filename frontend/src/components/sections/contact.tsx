"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Zap,
  Globe,
  Shield,
  CalendarCheck,
} from "lucide-react";
import { MessageCircle as WhatsAppIconLucide } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: "beijingbridgepath@gmail.com",
    sub: "Click to open your mail app",
    href: "mailto:beijingbridgepath@gmail.com",
    iconBgClass: "bg-blue-500",
    isExternal: false,
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+86 176 1153 3296",
    sub: "Tap to call directly",
    href: "tel:+8617611533296",
    iconBgClass: "bg-emerald-500",
    isExternal: false,
  },
  {
    icon: WhatsAppIconLucide,
    label: "WhatsApp",
    value: "+86 176 1153 3296",
    sub: "Fastest response — chat with us",
    href: "https://wa.me/8617611533296",
    iconBgClass: "bg-[#25D366]",
    isExternal: true,
  },
  {
    icon: MapPin,
    label: "Address",
    value: "Beijing, China",
    sub: "Serving clients worldwide",
    href: null,
    iconBgClass: "bg-rose-500",
    isExternal: false,
  },
  {
    icon: Clock,
    label: "Business Hours",
    value: "Mon - Fri, 9 AM - 6 PM (CST)",
    sub: "Free consultation available",
    href: "/book-consultation",
    iconBgClass: "bg-amber-500",
    isExternal: false,
  },
];

const QUICK_FEATURES = [
  { icon: Zap, label: "Reply within 24h" },
  { icon: Shield, label: "Confidential" },
  { icon: Globe, label: "Multilingual" },
];

const baseIconClass =
  "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center";
const baseItemClass =
  "flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl hover:bg-primary/5 transition-colors -mx-2 px-2";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-5 md:px-6 lg:px-8 bg-section-warm-gradient"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
            <WhatsAppIconLucide className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Get in Touch
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] mb-4 leading-[1.05]">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have questions about our services or want to discuss your specific
            needs? We&apos;re here to help. Fill out the form and we&apos;ll get
            back to you within 1-2 business days.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 md:gap-4 mb-8 sm:mb-10 md:mb-12">
          {QUICK_FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.label}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-full bg-white border border-border/80"
              >
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Icon className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                </div>
                <span className="text-xs sm:text-xs md:text-sm font-bold text-foreground">
                  {feature.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-5 sm:gap-6">
          <div className="md:col-span-2 space-y-3 sm:space-y-4">
            <div className="bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 rounded-2xl border border-border/80 shadow-soft-sm p-5 sm:p-6">
              <h3 className="font-display font-black text-lg sm:text-xl mb-3 sm:mb-4 flex items-center gap-2">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                How to Reach Us
              </h3>
              <div className="space-y-2 sm:space-y-2.5">
                {CONTACT_INFO.map((item) => {
                  const Icon = item.icon;
                  const iconNode = (
                    <div className={`${baseIconClass} ${item.iconBgClass}`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                  );
                  const textNode = (
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p className="text-sm sm:text-base font-bold text-foreground break-words mt-0.5">
                        {item.value}
                      </p>
                      {"sub" in item && item.sub && (
                        <p className="text-[10px] text-muted-foreground/60 font-medium mt-0.5">
                          {item.sub}
                        </p>
                      )}
                    </div>
                  );
                  if (item.href) {
                    const isInternal = item.href.startsWith("/");
                    if (isInternal) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`${baseItemClass} cursor-pointer`}
                        >
                          {iconNode}
                          {textNode}
                        </Link>
                      );
                    }
                    return (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.isExternal ? "_blank" : undefined}
                        rel={
                          item.isExternal ? "noopener noreferrer" : undefined
                        }
                        className={`${baseItemClass} cursor-pointer`}
                      >
                        {iconNode}
                        {textNode}
                      </a>
                    );
                  }
                  return (
                    <div key={item.label} className={baseItemClass}>
                      {iconNode}
                      {textNode}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl border border-white/15 p-5 sm:p-6 text-white">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="font-display font-black text-sm sm:text-base mb-0.5">
                    Prefer direct contact?
                  </p>
                  <p className="text-xs text-white/90 leading-relaxed mb-2.5">
                    Email us or chat on WhatsApp — we respond within 24 hours.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="mailto:beijingbridgepath@gmail.com"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-500 font-black text-xs hover:bg-white/90 transition-colors"
                    >
                      <Send className="h-3 w-3" />
                      Email Us
                    </a>
                    <a
                      href="https://wa.me/8617611533296"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-black text-xs hover:bg-[#20BD5A] transition-colors"
                    >
                      <WhatsAppIconLucide className="h-3 w-3" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/book-consultation"
              className="block bg-gradient-to-br from-red-500 to-red-700 rounded-2xl border border-white/15 p-5 sm:p-6 hover:shadow-xl hover:shadow-red-900/20 transition-all cursor-pointer press group text-white"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-black text-sm sm:text-base mb-0.5">
                    Book a Free Consultation
                  </p>
                  <p className="text-xs text-white/90 leading-relaxed mb-1.5">
                    Schedule a 30-minute call with our experts. Get personalized
                    guidance — no commitment required.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-red-500 font-black text-xs hover:bg-white/90 transition-colors">
                    Schedule now
                    <span aria-hidden>&rarr;</span>
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-border/80 shadow-soft-md p-5 sm:p-6 md:p-7 lg:p-10 card-shine">
              <div className="flex items-start gap-3 mb-4 sm:mb-6">
                <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
                  <WhatsAppIconLucide className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary">
                    Get Started
                  </div>
                  <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl lg:text-3xl">
                    Send Us a Message
                  </h3>
                </div>
              </div>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
