"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Users,
  MonitorSmartphone,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Film,
  CalendarCheck,
  FileText,
  Truck,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
  hash: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, hash: "#overview" },
  { id: "submissions", label: "Submissions", icon: Inbox, hash: "#submissions" },
  { id: "car-shipments", label: "Car Shipments", icon: Truck, hash: "#car-shipments" },
  { id: "consultations", label: "Consultations", icon: CalendarCheck, hash: "#consultations" },
  { id: "users", label: "Users", icon: Users, hash: "#users" },
  { id: "videos", label: "Videos", icon: Film, hash: "#videos" },
  { id: "blog", label: "Blog Posts", icon: FileText, hash: "#blog" },
  { id: "sessions", label: "Sessions", icon: MonitorSmartphone, hash: "#sessions" },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [activeHash, setActiveHash] = useState("#submissions");
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  // Load collapsed state from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("admin-sidebar-collapsed");
      if (stored !== null) {
        // One-time localStorage hydration on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCollapsed(stored === "true");
      }
    } catch {
      // localStorage unavailable (private mode, quota exceeded) — use default
    }
    setMounted(true);
  }, []);

  // Persist collapsed state
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("admin-sidebar-collapsed", String(collapsed));
      } catch {
        // localStorage unavailable — silently ignore
      }
    }
  }, [collapsed, mounted]);

  // Read hash on mount and listen for changes
  useEffect(() => {
    const updateHash = () => {
      const hash = window.location.hash || "#overview";
      setActiveHash(hash);
    };
    updateHash();
    window.addEventListener("hashchange", updateHash);
    return () => window.removeEventListener("hashchange", updateHash);
  }, []);

  const handleNavClick = useCallback(
    (hash: string) => {
      window.location.hash = hash;
      setMobileOpen(false);
    },
    [],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/admin/login");
  }, [logout, router]);

  if (!mounted) {
    return (
      <aside className="hidden lg:block w-[64px] shrink-0 border-r border-border/40 bg-white/60" />
    );
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white border border-border shadow-sm cursor-pointer press"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 z-50 h-full flex flex-col border-r border-border/40 bg-white/60 backdrop-blur-xl transition-all duration-300 ease-in-out",
          collapsed ? "w-[64px]" : "w-64",
          // Mobile: slide in/out
          "lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
      >
        {/* Logo / Header */}
        <div
          className={cn(
            "flex items-center h-16 shrink-0 border-b border-border/40 px-4",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all duration-300",
              collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-black text-sm">86</span>
            </div>
            <span className="font-bold text-sm tracking-tight whitespace-nowrap">
              Admin
            </span>
          </div>
          {/* Collapse toggle — desktop only */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-muted transition-colors cursor-pointer shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = activeHash === item.hash;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.hash)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer press",
                  collapsed ? "justify-center px-2" : "",
                  isActive
                    ? "bg-gradient-to-r from-primary to-red-700 text-white shadow-lg shadow-primary/25"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/80",
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-white" : "text-foreground/50",
                  )}
                />
                <span
                  className={cn(
                    "whitespace-nowrap overflow-hidden transition-all duration-300",
                    collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer — logout */}
        <div className="shrink-0 border-t border-border/40 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-foreground/60 hover:text-red-600 hover:bg-red-50/80 transition-all duration-200 cursor-pointer press w-full",
              collapsed ? "justify-center px-2" : "",
            )}
            title={collapsed ? "Logout" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap overflow-hidden transition-all duration-300",
                collapsed ? "w-0 opacity-0" : "w-auto opacity-100",
              )}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}