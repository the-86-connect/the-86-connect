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
            <p className="text-sm text-white/60 leading-relaxed mb-4 sm:mb-5 text-center sm:text-left">
              Your trusted gateway to China for education and business
              opportunities. We connect the world with China&apos;s top
              universities and trusted manufacturers.
            </p>

            <div className="flex items-center justify-center sm:justify-start gap-3 mb-5">
              <a
                href="https://www.linkedin.com/company/86-connect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#0A66C2] border border-white/10 hover:border-[#0A66C2] flex items-center justify-center transition-all duration-300 group"
              >
                <svg className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a
                href="https://www.facebook.com/86connect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#1877F2] border border-white/10 hover:border-[#1877F2] flex items-center justify-center transition-all duration-300 group"
              >
                <svg className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="https://www.instagram.com/86connect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] border border-white/10 hover:border-[#E1306C] flex items-center justify-center transition-all duration-300 group"
              >
                <svg className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a
                href="https://www.youtube.com/@86connect"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-[#FF0000] border border-white/10 hover:border-[#FF0000] flex items-center justify-center transition-all duration-300 group"
              >
                <svg className="h-4 w-4 text-white/60 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>

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
