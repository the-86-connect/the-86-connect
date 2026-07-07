"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  GraduationCap,
  ShoppingCart,
  Home,
  Mail,
  Sparkles,
  User,
  UserRound,
  CalendarCheck,
  Search,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/user-auth-context";

type NavLink = {
  label: string;
  shortLabel?: string;
  icon: typeof Home;
  target?: string;
  href?: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "Home", shortLabel: "Home", target: "hero", icon: Home },
  {
    label: "Study in China",
    shortLabel: "Study",
    href: "/study-in-china",
    icon: GraduationCap,
  },
  {
    label: "Product Sourcing",
    shortLabel: "Sourcing",
    href: "/product-sourcing",
    icon: ShoppingCart,
  },
  { label: "Contact", shortLabel: "Contact", target: "contact", icon: Mail },
  {
    label: "Track",
    shortLabel: "Track",
    href: "/study-in-china/track-application",
    icon: Search,
  },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { isAuthenticated } = useUserAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      if (!isHome) return;

      const scrollTargets = NAV_LINKS.filter((l) => l.target).map(
        (l) => l.target!,
      );
      for (const id of scrollTargets) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleScrollClick = useCallback((target: string) => {
    setIsOpen(false);
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const isActive = (link: NavLink): boolean => {
    if (link.href) return pathname === link.href;
    if (link.target && isHome) return activeSection === link.target;
    return false;
  };

  const renderMobileNavLink = (link: NavLink) => {
    const active = isActive(link);
    const Icon = link.icon;

    if (link.href) {
      return (
        <Link
          key={link.label}
          href={link.href}
          onClick={() => setIsOpen(false)}
          aria-current={active ? "page" : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all duration-200 cursor-pointer press min-h-[46px]",
            active
              ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-red-sm"
              : "text-foreground hover:bg-muted/70",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
          {link.label}
        </Link>
      );
    }

    const handleClick = () => {
      if (isHome) {
        handleScrollClick(link.target!);
      } else {
        window.location.href = `/#${link.target}`;
      }
    };

    return (
      <button
        key={link.label}
        type="button"
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all duration-200 cursor-pointer press min-h-[46px]",
          active
            ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-red-sm"
            : "text-foreground hover:bg-muted/70",
        )}
      >
        <Icon className="h-[18px] w-[18px]" />
        {link.label}
      </button>
    );
  };

  const renderDesktopLink = (link: NavLink, compact = false) => {
    const active = isActive(link);
    const Icon = link.icon;
    const baseClasses = cn(
      "relative py-2 font-bold tracking-wide transition-colors duration-200 cursor-pointer press flex items-center",
      compact ? "px-1 gap-1 text-xs" : "px-1 py-2 gap-1.5 text-sm",
    );

    const idleColor = scrolled
      ? "text-foreground/70 hover:text-foreground"
      : "text-white/80 hover:text-white";
    const activeColor = scrolled ? "text-primary" : "text-white";

    const displayLabel = compact && link.shortLabel ? link.shortLabel : link.label;

    if (link.href) {
      return (
        <Link
          key={link.label}
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(baseClasses, active ? activeColor : idleColor)}
        >
          <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
          <span className="whitespace-nowrap">{displayLabel}</span>
          <span
            className={cn(
              "absolute bottom-0 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
              active ? "w-full" : "w-0 group-hover:w-full",
            )}
          />
        </Link>
      );
    }

    const handleClick = () => {
      if (isHome) {
        handleScrollClick(link.target!);
      } else {
        window.location.href = `/#${link.target}`;
      }
    };

    return (
      <button
        key={link.label}
        type="button"
        onClick={handleClick}
        aria-current={active ? "page" : undefined}
        className={cn(baseClasses, active ? activeColor : idleColor)}
      >
        <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
        <span className="whitespace-nowrap">{displayLabel}</span>
        <span
          className={cn(
            "absolute bottom-0 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
            active ? "w-full" : "w-0 group-hover:w-full",
          )}
        />
      </button>
    );
  };

  return (
    <>
      {/* Top nav */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 md:h-16 lg:h-20">
            {/* Logo */}
            <Link
              href="/"
              className="group flex items-center press shrink-0"
              aria-label="86 Connect home"
            >
              <Image
                src={scrolled ? "/logo-main.png" : "/logo-white-nav.png"}
                alt="86 Connect"
                width={180}
                height={49}
                className="h-7 sm:h-8 md:h-8 lg:h-9 w-auto group-hover:opacity-90 transition-opacity duration-300"
                priority
              />
            </Link>

            {/* Right side group */}
            <div className="flex items-center gap-2 md:gap-2.5 lg:gap-3">
              {/* Desktop nav — compact at md, full at lg */}
              <nav className="hidden md:flex lg:hidden items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar">
                {NAV_LINKS.map((link) => renderDesktopLink(link, true))}
              </nav>
              <nav className="hidden lg:flex items-center gap-6 lg:gap-7 xl:gap-9">
                {NAV_LINKS.map((link) => renderDesktopLink(link, false))}
              </nav>

              {/* Desktop CTA — compact at md, full at lg */}
              <div className="hidden md:flex lg:hidden items-center gap-2">
                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  className={cn(
                    "inline-flex items-center justify-center w-9 h-9 rounded-lg transition-colors duration-200 cursor-pointer press",
                    scrolled
                      ? "text-foreground/70 hover:text-primary hover:bg-muted/50"
                      : "text-white/85 hover:text-white hover:bg-white/10",
                  )}
                  aria-label={isAuthenticated ? "Account" : "Login"}
                >
                  {isAuthenticated ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <UserRound className="h-4 w-4" />
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (isHome) handleScrollClick("contact");
                    else window.location.href = "/#contact";
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-colors duration-200 cursor-pointer press whitespace-nowrap",
                    scrolled
                      ? "bg-primary text-white hover:bg-red-700"
                      : "bg-white/95 text-slate-900 hover:bg-white",
                  )}
                >
                  <span>Get Started</span>
                </button>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <Link
                  href={isAuthenticated ? "/account" : "/login"}
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-bold transition-colors duration-200 cursor-pointer press",
                    scrolled
                      ? "text-foreground/80 hover:text-primary"
                      : "text-white/85 hover:text-white",
                  )}
                >
                  {isAuthenticated ? (
                    <>
                      <User className="h-4 w-4" />
                      <span>Account</span>
                    </>
                  ) : (
                    <>
                      <UserRound className="h-4 w-4" />
                      <span>Login</span>
                    </>
                  )}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (isHome) handleScrollClick("contact");
                    else window.location.href = "/#contact";
                  }}
                  className={cn(
                    "inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-colors duration-200 cursor-pointer press",
                    scrolled
                      ? "bg-primary text-white hover:bg-red-700"
                      : "bg-white/95 text-slate-900 hover:bg-white",
                  )}
                >
                  <span>Get Started</span>
                  <Mail className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile menu button - only on <md */}
              <button
                type="button"
                onClick={() => setIsOpen((v) => !v)}
                className="md:hidden flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-border shadow-soft-sm cursor-pointer press touch-manipulation"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                {isOpen ? (
                  <X className="h-5 w-5 text-foreground" />
                ) : (
                  <Menu className="h-5 w-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile slide-down menu - only on <md */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 pt-14 sm:pt-16 px-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <nav
            className="relative bg-white rounded-3xl shadow-soft-xl p-2.5 border border-border animate-in fade-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Quick Navigate
              </span>
            </div>
            <div className="space-y-0.5">
              {NAV_LINKS.map((link) => renderMobileNavLink(link))}
            </div>
            <div className="border-t border-border/40 my-2" />
            <div className="space-y-0.5">
              <Link
                href="/book-consultation"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all duration-200 cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <CalendarCheck className="h-5 w-5" />
                Book a Consultation
              </Link>
              <Link
                href="/study-in-china/track-application"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all duration-200 cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <Search className="h-5 w-5" />
                Track Submission
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all duration-200 cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                {isAuthenticated ? (
                  <User className="h-5 w-5" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
                {isAuthenticated ? "My Account" : "Login / Sign Up"}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (isHome) handleScrollClick("contact");
                else window.location.href = "/#contact";
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 bg-gradient-to-r from-primary to-red-600 text-white rounded-2xl font-bold text-sm cursor-pointer press min-h-[48px] shadow-sm hover:shadow-md active:translate-y-[1px] active:shadow-none transition-all"
            >
              <span>Get Started</span>
              <Mail className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}

      {/* Mobile bottom tab bar - only on true mobile <md (768px) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom pointer-events-none">
        <div className="mx-1.5 sm:mx-3 mb-1.5 sm:mb-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-xl px-1 py-1 sm:px-2 sm:py-2 border border-border/60">
            <div className="grid grid-cols-6 gap-0">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = isActive(link);
                const content = (
                  <>
                    <Icon className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                      {link.shortLabel ?? link.label}
                    </span>
                  </>
                );
                const className = cn(
                  "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                  active
                    ? "text-primary"
                    : "text-foreground/55 hover:text-foreground",
                );

                const handleTabClick = () => {
                  if (link.href) return;
                  if (isHome) handleScrollClick(link.target!);
                  else window.location.href = `/#${link.target}`;
                };

                return link.href ? (
                  <Link key={link.label} href={link.href} className={className}>
                    {content}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    type="button"
                    onClick={handleTabClick}
                    aria-current={active ? "page" : undefined}
                    aria-label={link.label}
                    className={className}
                  >
                    {content}
                  </button>
                );
              })}
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px] text-foreground/55 hover:text-foreground"
              >
                {isAuthenticated ? (
                  <User className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                ) : (
                  <UserRound className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                )}
                <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                  {isAuthenticated ? "Me" : "Login"}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
