"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Menu,
  X,
  User,
  UserRound,
  LogIn,
  Search,
  LayoutDashboard,
  Briefcase,
  GitBranch,
  HelpCircle,
  Send,
  Building2,
  FileCheck,
  ClipboardList,
  Home as HomeIcon,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/user-auth-context";

interface SubNavLink {
  label: string;
  target: string;
}

interface PageNavbarProps {
  accent: string;
  subLinks: SubNavLink[];
  ctaLabel: string;
  ctaTarget: string;
  trackHref: string;
}

export function PageNavbar({
  accent,
  subLinks,
  ctaLabel,
  ctaTarget,
  trackHref,
}: PageNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState(subLinks[0]?.target ?? "");
  const { isAuthenticated } = useUserAuth();
  const pathname = usePathname();
  const isSIC = pathname === "/study-in-china";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      for (const link of subLinks) {
        const el = document.getElementById(link.target);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140 && rect.bottom >= 140) {
            setActiveSection(link.target);
            break;
          }
        }
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [subLinks]);

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

  const handleNavClick = useCallback((target: string) => {
    setIsOpen(false);
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const getSubIcon = (target: string) => {
    switch (target) {
      case "overview":
        return LayoutDashboard;
      case "services":
        return Briefcase;
      case "process":
        return GitBranch;
      case "universities":
        return Building2;
      case "faq":
        return HelpCircle;
      case "apply":
        return FileCheck;
      case "inquire":
        return Send;
      default:
        return ClipboardList;
    }
  };

  return (
    <>
      {/* Desktop + mobile top nav */}
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-border/60 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between h-16 lg:h-20">
            {/* Logo + back */}
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors press"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <div className="w-px h-5 bg-border" />
              <Link
                href="/"
                className="group flex items-center press"
                aria-label="86 Connect home"
              >
                <Image
                  src={scrolled ? "/logo-main.png" : "/logo-white-nav.png"}
                  alt="86 Connect"
                  width={180}
                  height={49}
                  className="h-9 w-auto group-hover:opacity-90 transition-opacity"
                  priority
                />
              </Link>
            </div>

            {/* Desktop sub-nav — clean text links with underline */}
            <nav className="flex items-center gap-8">
              {subLinks.map((link) => {
                const isActive = activeSection === link.target;
                return (
                  <button
                    key={link.target}
                    type="button"
                    onClick={() => handleNavClick(link.target)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative px-1 py-2 text-sm font-bold tracking-wide transition-colors duration-200 cursor-pointer press group",
                      isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-primary rounded-full transition-all duration-300",
                        isActive ? "w-full" : "w-0 group-hover:w-full",
                      )}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Desktop CTA + Profile */}
            <div className="flex items-center gap-3">
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-foreground/70 hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors duration-200 cursor-pointer press"
              >
                {isAuthenticated ? (
                  <User className="h-4 w-4" />
                ) : (
                  <UserRound className="h-4 w-4" />
                )}
                <span>{isAuthenticated ? "Account" : "Login"}</span>
              </Link>
              <button
                type="button"
                onClick={() => handleNavClick(ctaTarget)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors duration-200 cursor-pointer press"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="lg:hidden flex items-center justify-between h-16 sm:h-18">
            <Link
              href="/"
              className="flex items-center press min-h-[44px]"
              aria-label="Back to home"
            >
              <Image
                src={scrolled ? "/logo-main.png" : "/logo-white-nav.png"}
                alt="86 Connect"
                width={160}
                height={44}
                className="h-8 w-auto"
                priority
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-border shadow-soft-sm cursor-pointer press touch-manipulation"
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
              <ArrowLeft className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                On This Page
              </span>
            </div>
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              Back to Home
            </Link>
            <div className="border-t border-border/60 my-2" />
            <div className="space-y-0.5">
              {subLinks.map((link) => {
                const isActive = activeSection === link.target;
                const Icon = getSubIcon(link.target);
                return (
                  <button
                    key={link.target}
                    type="button"
                    onClick={() => handleNavClick(link.target)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px]",
                      isActive
                        ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-red-sm"
                        : "text-foreground hover:bg-muted/70",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {link.label}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border/60 my-2" />
            <div className="space-y-0.5">
              <Link
                href={trackHref}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                <Search className="h-[18px] w-[18px]" />
                Track Submission
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-bold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/70"
              >
                {isAuthenticated ? (
                  <User className="h-[18px] w-[18px]" />
                ) : (
                  <UserRound className="h-[18px] w-[18px]" />
                )}
                {isAuthenticated ? "My Account" : "Login / Sign Up"}
              </Link>
            </div>
            <button
              type="button"
              onClick={() => handleNavClick(ctaTarget)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 bg-gradient-to-r from-primary to-red-700 text-white rounded-2xl font-black text-sm cursor-pointer press min-h-[48px] shadow-red-sm active:translate-y-[1px] active:shadow-none transition-all"
            >
              {ctaLabel}
            </button>
          </nav>
        </div>
      )}

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom pointer-events-none">
        <div className="mx-2 sm:mx-3 mb-2 sm:mb-3 pointer-events-auto">
          <div className="bg-white rounded-3xl shadow-soft-xl px-1.5 py-1.5 sm:px-2 sm:py-2 border border-border">
            <div className="grid grid-cols-6 gap-0.5 sm:gap-1">
              <Link
                href="/"
                className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px] text-foreground/70 hover:text-foreground"
              >
                <HomeIcon className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                  Home
                </span>
              </Link>
              {isSIC ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick("services")}
                    aria-label="Services"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                      activeSection === "services"
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      Services
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("universities")}
                    aria-label="Universities"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                      activeSection === "universities"
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <Building2 className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      Uni
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("apply")}
                    aria-label="Apply"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                      activeSection === "apply"
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <FileCheck className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      Apply
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleNavClick("services")}
                    aria-label="Services"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                      activeSection === "services"
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      Services
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("models")}
                    aria-label="Models"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                      activeSection === "models"
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <GitBranch className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      Models
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("inquire")}
                    aria-label="Get Quote"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px]",
                      activeSection === "inquire"
                        ? "text-primary"
                        : "text-foreground/70 hover:text-foreground",
                    )}
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                      Quote
                    </span>
                  </button>
                </>
              )}
              <Link
                href={trackHref}
                className="relative flex flex-col items-center justify-center gap-0.5 py-1.5 sm:py-2 rounded-2xl transition-all duration-200 cursor-pointer press min-h-[52px] sm:min-h-[56px] text-foreground/70 hover:text-foreground"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                <span className="text-[9px] sm:text-[10px] font-black leading-none relative z-10">
                  Track
                </span>
              </Link>
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
