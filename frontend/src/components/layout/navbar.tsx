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
  LogIn,
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
            "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px]",
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
          "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px]",
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

  const renderDesktopLink = (link: NavLink) => {
    const active = isActive(link);
    const baseClasses =
      "relative px-1 py-2 text-sm font-bold tracking-wide transition-colors duration-200 cursor-pointer press";

    if (link.href) {
      return (
        <Link
          key={link.label}
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={cn(
            baseClasses,
            active
              ? "text-primary"
              : "text-foreground/70 hover:text-foreground",
          )}
        >
          {link.label}
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
        className={cn(
          baseClasses,
          "group",
          active ? "text-primary" : "text-foreground/70 hover:text-foreground",
        )}
      >
        {link.label}
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
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo — white when transparent (over dark hero), dark when scrolled (white bg) */}
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
                className="h-8 lg:h-9 w-auto group-hover:opacity-90 transition-opacity"
                priority
              />
            </Link>

            {/* Desktop nav — clean horizontal text links with underline indicator */}
            <nav className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => renderDesktopLink(link))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-foreground/80 hover:text-primary transition-colors duration-200 cursor-pointer press"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors duration-200 cursor-pointer press"
              >
                <span>Get Started</span>
                <Mail className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-border shadow-soft-sm cursor-pointer press touch-manipulation"
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
      </header>

      {/* Mobile slide-down menu */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 pt-16 px-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
          <nav
            className="relative bg-white rounded-3xl shadow-soft-xl p-2.5 border border-border animate-in fade-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Quick Navigate
              </span>
            </div>
            <div className="space-y-0.5">
              {NAV_LINKS.map((link) => renderMobileNavLink(link))}
            </div>
            <div className="border-t border-border/60 my-2" />
            <div className="space-y-0.5">
              <Link
                href="/book-consultation"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <CalendarCheck className="h-4.5 w-4.5" />
                Book a Consultation
              </Link>
              <Link
                href="/study-in-china/track-application"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <Search className="h-4.5 w-4.5" />
                Track Submission
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                {isAuthenticated ? (
                  <User className="h-4.5 w-4.5" />
                ) : (
                  <UserRound className="h-4.5 w-4.5" />
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 bg-gradient-to-r from-primary to-red-700 text-white rounded-2xl font-black text-sm cursor-pointer press min-h-[48px] shadow-red-sm active:translate-y-[1px] active:shadow-none transition-all"
            >
              <span>Get Started</span>
              <Mail className="h-4 w-4" />
            </button>
          </nav>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom pointer-events-none">
        <div className="mx-2 sm:mx-3 mb-2 sm:mb-3 pointer-events-auto">
          <div className="bg-white rounded-3xl shadow-soft-xl px-1.5 py-1.5 sm:px-2 sm:py-2 border border-border">
            <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const active = isActive(link);
                const content = (
                  <>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      {link.shortLabel ?? link.label}
                    </span>
                  </>
                );
                const className = cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                  active
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground",
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
                className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px] text-foreground/70 hover:text-foreground"
              >
                {isAuthenticated ? (
                  <User className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                ) : (
                  <UserRound className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                )}
                <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
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
