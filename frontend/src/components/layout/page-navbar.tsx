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
      <header
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-border/40 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            : "bg-transparent",
        )}
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
          {/* Full desktop layout (lg+) */}
          <div className="hidden lg:flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-200 press"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Home</span>
              </Link>
              <div className="w-px h-4 bg-border/60" />
              <Link
                href="/"
                className="group flex items-center press"
                aria-label="86 Connect home"
              >
                <Image
                  src="/logo-main.png"
                  alt="86 Connect"
                  width={160}
                  height={44}
                  className="h-8 w-auto group-hover:opacity-90 transition-opacity duration-200"
                  priority
                />
              </Link>
            </div>

            <nav className="flex items-center gap-6 xl:gap-8 overflow-x-auto no-scrollbar">
              {subLinks.map((link) => {
                const isActive = activeSection === link.target;
                return (
                  <button
                    key={link.target}
                    type="button"
                    onClick={() => handleNavClick(link.target)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative px-1 py-2 text-sm font-semibold tracking-[-0.01em] transition-colors duration-200 cursor-pointer press group whitespace-nowrap",
                      isActive
                        ? "text-primary"
                        : "text-foreground/60 hover:text-foreground",
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

            <div className="flex items-center gap-3 shrink-0">
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors duration-200 cursor-pointer press"
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
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-all duration-200 cursor-pointer press shadow-sm hover:shadow-md"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          {/* Compact desktop layout (md) */}
          <div className="hidden md:flex lg:hidden items-center justify-between h-14 md:h-16">
            <Link
              href="/"
              className="flex items-center press shrink-0"
              aria-label="86 Connect home"
            >
              <Image
                src="/logo-main.png"
                alt="86 Connect"
                width={140}
                height={38}
                className="h-7 md:h-8 w-auto"
                priority
              />
            </Link>

            <nav className="flex items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar flex-1 mx-3">
              {subLinks.map((link) => {
                const isActive = activeSection === link.target;
                return (
                  <button
                    key={link.target}
                    type="button"
                    onClick={() => handleNavClick(link.target)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative px-2 py-1.5 text-xs font-semibold tracking-[-0.01em] transition-colors duration-200 cursor-pointer press whitespace-nowrap rounded-md",
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-foreground/60 hover:text-foreground hover:bg-muted/40",
                    )}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-foreground/60 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer press"
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
                onClick={() => handleNavClick(ctaTarget)}
                className="inline-flex items-center px-3 py-2 bg-primary text-white rounded-lg font-semibold text-xs hover:bg-red-700 transition-all cursor-pointer press shadow-sm whitespace-nowrap"
              >
                {ctaLabel}
              </button>
            </div>
          </div>

          {/* Mobile layout (<md) */}
          <div className="md:hidden flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center press min-h-[44px]"
              aria-label="Back to home"
            >
              <Image
                src="/logo-main.png"
                alt="86 Connect"
                width={140}
                height={38}
                className="h-7 w-auto"
                priority
              />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/90 backdrop-blur-sm border border-border/60 shadow-sm cursor-pointer press touch-manipulation"
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
          className="md:hidden fixed inset-0 z-40 pt-14 sm:pt-16 px-3"
          onClick={() => setIsOpen(false)}
        >
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
          <nav
            className="relative bg-white rounded-2xl shadow-xl p-2.5 border border-border/50 animate-in fade-in slide-in-from-top-4 duration-300"
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
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <ArrowLeft className="h-[18px] w-[18px]" />
              Back to Home
            </Link>
            <div className="border-t border-border/50 my-2" />
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
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-[13px] transition-all cursor-pointer press min-h-[46px]",
                      isActive
                        ? "bg-primary text-white shadow-sm"
                        : "text-foreground hover:bg-muted/50",
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    {link.label}
                  </button>
                );
              })}
            </div>
            <div className="border-t border-border/50 my-2" />
            <div className="space-y-0.5">
              <Link
                href={trackHref}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
              >
                <Search className="h-[18px] w-[18px]" />
                Track Submission
              </Link>
              <Link
                href={isAuthenticated ? "/account" : "/login"}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-semibold text-[13px] transition-all cursor-pointer press min-h-[46px] text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 mt-2 bg-primary text-white rounded-xl font-semibold text-sm cursor-pointer press min-h-[48px] shadow-sm active:translate-y-[1px] active:shadow-none transition-all hover:bg-red-700"
            >
              {ctaLabel}
            </button>
          </nav>
        </div>
      )}

      {/* Mobile bottom tab bar - only on <md (768px) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 safe-bottom pointer-events-none">
        <div className="mx-1.5 sm:mx-3 mb-1.5 sm:mb-3 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-soft-xl px-1 py-1 sm:px-2 sm:py-2 border border-border/60">
            <div className="grid grid-cols-6 gap-0">
              <Link
                href="/"
                className="relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px] text-foreground/55 hover:text-foreground"
              >
                <HomeIcon className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
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
                      "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                      activeSection === "services"
                        ? "text-primary"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    <Briefcase className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                      Services
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("universities")}
                    aria-label="Universities"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                      activeSection === "universities"
                        ? "text-primary"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    <Building2 className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                      Uni
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("apply")}
                    aria-label="Apply"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                      activeSection === "apply"
                        ? "text-primary"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    <FileCheck className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
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
                      "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                      activeSection === "services"
                        ? "text-primary"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    <Briefcase className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                      Services
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("models")}
                    aria-label="Models"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                      activeSection === "models"
                        ? "text-primary"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    <GitBranch className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                      Models
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavClick("inquire")}
                    aria-label="Get Quote"
                    className={cn(
                      "relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px]",
                      activeSection === "inquire"
                        ? "text-primary"
                        : "text-foreground/55 hover:text-foreground",
                    )}
                  >
                    <Send className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                    <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                      Quote
                    </span>
                  </button>
                </>
              )}
              <Link
                href={trackHref}
                className="relative flex flex-col items-center justify-center gap-1 py-2 sm:py-2 rounded-xl transition-all duration-200 cursor-pointer press min-h-[50px] sm:min-h-[56px] text-foreground/55 hover:text-foreground"
              >
                <Search className="h-[18px] w-[18px] sm:h-5 sm:w-5 relative z-10" />
                <span className="text-[10px] sm:text-[10px] font-bold leading-none relative z-10">
                  Track
                </span>
              </Link>
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
