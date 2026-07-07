"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
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
  { label: "Data Processing", href: "/data-processing-agreement" },
  { label: "Security Policy", href: "/security-policy" },
  { label: "NDA", href: "/nda" },
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
    <footer
      id="footer"
      className="relative bg-gradient-to-b from-[#0b0f1a] via-[#070A12] to-black text-white border-t border-white/[0.08] overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(239,68,68,0.14),transparent_60%)]" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full orb-red-soft opacity-70" />
      <div className="pointer-events-none absolute -bottom-24 right-[-6rem] h-[22rem] w-[22rem] rounded-full orb-red-soft opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      <div className="relative container mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8 pt-12 sm:pt-14 md:pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-6 sm:gap-8 md:gap-10 lg:gap-16">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-5">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 md:gap-5 mb-4">
              <Link
                href="/"
                className="group inline-flex shrink-0 items-center"
                aria-label="86 Connect home"
              >
                <Image
                  src="/logo-white.png"
                  alt="86 Connect"
                  width={180}
                  height={54}
                  className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto rounded-lg shadow-[0_0_12px_rgba(255,255,255,0.5)]"
                  priority
                />
              </Link>
              <div className="border-l border-white/20 h-7 sm:h-8 md:h-9 ml-1 sm:ml-2 mr-0.5 sm:mr-1 shrink-0" />
              <Image
                src="/parents company logo.png"
                alt="Parents Company"
                width={100}
                height={33}
                className="h-9 sm:h-10 md:h-11 lg:h-12 w-auto rounded-lg shadow-[0_0_12px_rgba(255,255,255,0.5)] shrink-0"
              />
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5 sm:mb-6 text-center sm:text-left">
              Your trusted gateway to China for education and business
              opportunities. We connect the world with China&apos;s top
              universities and trusted manufacturers.
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 mb-5">
              <div className="flex -space-x-2">
                {["J", "M", "A", "K"].map((letter) => (
                  <div
                    key={letter}
                    className="w-7 h-7 rounded-full bg-[#070A12] border-2 border-red-500/40 flex items-center justify-center text-red-500 text-[10px] font-black"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-red-500 text-xs">
                      &#9733;
                    </span>
                  ))}
                </div>
                <div className="text-[10px] text-white/50 font-bold">
                  2,400+ happy clients
                </div>
              </div>
            </div>

          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <span className="w-1 h-1.5 bg-red-500 rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-2">
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
                    className="group inline-flex items-center gap-2.5 text-sm font-bold text-white/70 hover:text-red-500 transition-colors duration-300 cursor-pointer"
                  >
                    <span className="w-0 h-0 rounded-full bg-red-500 group-hover:w-1.5 group-hover:h-1.5 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1 md:col-span-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 flex items-center gap-2">
              <span className="w-1 h-1.5 bg-red-500 rounded-full" />
              Get in Touch
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:beijingbridgepath@gmail.com"
                  className="group flex items-center gap-3 text-sm text-white/70 hover:text-red-500 transition-colors duration-300"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500 flex items-center justify-center transition-all border border-white/10 group-hover:border-red-500">
                    <Mail className="h-3.5 w-3.5 text-red-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="break-all font-bold">
                    beijingbridgepath@gmail.com
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+8617611533296"
                  className="group flex items-center gap-3 text-sm text-white/70 hover:text-red-500 transition-colors duration-300"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500 flex items-center justify-center transition-all border border-white/10 group-hover:border-red-500">
                    <Phone className="h-3.5 w-3.5 text-red-500 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="font-bold">+86 176 1153 3296</span>
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8617611533296?text=Hi%2086%20Connect%2C%20I%27d%20like%20to%20inquire%20about..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-sm text-white/70 hover:text-[#25D366] transition-colors duration-300"
                >
                  <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 group-hover:bg-[#25D366] flex items-center justify-center transition-all border border-white/10 group-hover:border-[#25D366]">
                    <MessageCircle className="h-3.5 w-3.5 text-[#25D366] group-hover:text-white transition-colors duration-300" />
                  </div>
                  <span className="font-bold">WhatsApp Chat</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <div className="shrink-0 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-red-500" />
                </div>
                <span className="font-bold">Beijing, China</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50 text-center sm:text-left font-bold flex items-center gap-1.5 flex-wrap justify-center">
            <span>
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-primary font-black">86 Connect</span>. All
              rights reserved.
            </span>
            <span className="hidden sm:inline text-white/30">&middot;</span>
            <span className="inline-flex items-center gap-1">
              Developed by{" "}
              <a
                href="https://www.linkedin.com/in/milton-babu"
                onClick={handleDeveloperClick}
                target="_blank"
                rel="noopener noreferrer"
                className="font-black text-white hover:text-red-500 transition-colors duration-300 cursor-pointer"
              >
                MD MILTON BABU
              </a>
            </span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-5 text-xs">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white/50 hover:text-red-500 transition-colors duration-300 font-bold"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleScrollTop}
              aria-label="Back to top"
              className="ml-1 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-red-500 border border-white/[0.08] hover:border-red-500 text-white/70 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer press hover:shadow-lg hover:shadow-red-500/20"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
