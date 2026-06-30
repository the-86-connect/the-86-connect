"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ArrowUp,
  MessageCircle,
} from "lucide-react";

const FOOTER_LINKS = [
  { label: "Home", target: "hero", href: "/" },
  { label: "Study in China", href: "/study-in-china" },
  { label: "Product Sourcing", href: "/product-sourcing" },
  { label: "Resources", href: "/resources" },
  { label: "FAQ", href: "/faq" },
  { label: "About Us", target: "about-us", href: "/" },
  { label: "Contact", target: "contact", href: "/" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
];

export function Footer() {
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    target: string,
  ) => {
    e.preventDefault();
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeveloperClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const rand = Math.random();
    const url =
      rand < 0.4
        ? "https://www.linkedin.com/in/milton-babu"
        : rand < 0.8
          ? "https://miltonbabu.com"
          : "https://miltonbabu.site";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="relative bg-[#0b0f1a] text-white border-t border-primary/20">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-20 sm:pb-4 lg:pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-5">
            <button
              type="button"
              onClick={handleScrollTop}
              className="group flex items-center mb-3 press"
              aria-label="86 Connect home"
            >
              <Image
                src="/logo-white.png"
                alt="86 Connect"
                width={180}
                height={54}
                className="h-9 w-auto group-hover:opacity-90 transition-opacity"
                priority
              />
            </button>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm leading-relaxed mb-4">
              Your trusted gateway to China for education and business
              opportunities. We connect the world with China&apos;s top
              universities and trusted manufacturers.
            </p>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {["J", "M", "A", "K"].map((letter) => (
                  <div
                    key={letter}
                    className="w-6 h-6 rounded-full bg-primary border-2 border-[#0b0f1a] flex items-center justify-center text-white text-[10px] font-black"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-primary text-xs">
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-white/60 font-bold">
                  2,400+ happy clients
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="h-2.5 w-2.5 text-primary" />
              <span className="text-[10px] font-bold text-white/70">
                Connecting the world to China since 2015
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
              <span className="w-1 h-2.5 bg-primary rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-1.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    {...(link.target
                      ? {
                          onClick: (e: React.MouseEvent<HTMLAnchorElement>) =>
                            handleNavClick(e, link.target!),
                        }
                      : {})}
                    className="group inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white/80 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="w-0 h-0.5 bg-primary group-hover:w-2.5 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3 flex items-center gap-2">
              <span className="w-1 h-2.5 bg-primary rounded-full" />
              Get in Touch
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:beijingbridgepath@gmail.com"
                  className="group flex items-center gap-2.5 text-xs sm:text-sm text-white/80 hover:text-primary transition-colors"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 group-hover:bg-primary flex items-center justify-center transition-all border border-white/10 group-hover:border-primary">
                    <Mail className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="break-all font-semibold">
                    beijingbridgepath@gmail.com
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+8617611533296"
                  className="group flex items-center gap-2.5 text-xs sm:text-sm text-white/80 hover:text-primary transition-colors"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 group-hover:bg-primary flex items-center justify-center transition-all border border-white/10 group-hover:border-primary">
                    <Phone className="h-3.5 w-3.5 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold">+86 176 1153 3296</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8617611533296?text=Hi%2086%20Connect%2C%20I%27d%20like%20to%20inquire%20about..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2.5 text-xs sm:text-sm text-white/80 hover:text-[#25D366] transition-colors"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#25D366] flex items-center justify-center transition-all border border-white/10 group-hover:border-[#25D366]">
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold">WhatsApp Chat</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-xs sm:text-sm text-white/80">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="font-semibold">Beijing, China</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-10 pt-4 sm:pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] sm:text-xs text-white/60 text-center sm:text-left font-semibold flex items-center gap-1.5 flex-wrap justify-center">
            <span>
              &copy; {new Date().getFullYear()} 86 Connect. All rights reserved.
            </span>
            <span className="hidden sm:inline text-white/40">·</span>
            <span className="inline-flex items-center gap-1">
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/milton-babu"
                onClick={handleDeveloperClick}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-white hover:text-primary transition-colors cursor-pointer"
              >
                MD MILTON BABU
              </a>
            </span>
          </p>
          <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/60 hover:text-primary transition-colors font-bold"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleScrollTop}
              aria-label="Back to top"
              className="ml-1 w-7 h-7 rounded-lg bg-white/5 hover:bg-primary border border-white/10 hover:border-primary text-white hover:text-white flex items-center justify-center transition-all cursor-pointer press"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
