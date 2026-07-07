"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Phone, Calendar, ArrowRight } from "lucide-react";

const SESSION_KEY = "booking-popup-dismissed-session";
const AUTO_SHOW_INTERVAL = 5 * 60 * 1000; // 5 minutes
const AUTO_SHOW_DURATION = 3000; // 3 seconds
const HOME_DELAY = 1500; // homepage initial delay
const MESSAGE_INTERVAL = 3500;

const MESSAGES = [
  "Need guidance on studying in China?",
  "Looking for verified Chinese suppliers?",
  "Want to explore scholarship options?",
  "Need help with university applications?",
  "Ready to source products from China?",
];

export function BookingPopup() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [visible, setVisible] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [dismissedSession, setDismissedSession] = useState(false);

  // Track which "source" caused visibility so systems don't interfere
  const visibleSource = useRef<"home" | "auto" | null>(null);
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nestedAutoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check sessionStorage on mount (homepage dismissal tracking)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        // One-time sessionStorage hydration on mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDismissedSession(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []);

  // ─── Homepage Popup ───────────────────────────────────────────
  // Show popup on homepage load after a short delay,
  // unless already dismissed during this session.
  useEffect(() => {
    if (!isHome || dismissedSession) return;
    const timer = setTimeout(() => {
      visibleSource.current = "home";
      setVisible(true);
    }, HOME_DELAY);
    return () => clearTimeout(timer);
  }, [isHome, dismissedSession]);

  // ─── Global Auto-Show (every 5 min, for 3 sec) ──────────────
  useEffect(() => {
    const interval = setInterval(() => {
      // Don't interrupt an already-showing homepage popup
      if (visibleSource.current === "home") return;

      visibleSource.current = "auto";
      setVisible(true);
      setExiting(false);

      // Auto-vanish after 3 seconds
      autoHideTimer.current = setTimeout(() => {
        if (visibleSource.current === "auto") {
          setExiting(true);
          nestedAutoHideTimer.current = setTimeout(() => {
            setVisible(false);
            setExiting(false);
          }, 300);
        }
      }, AUTO_SHOW_DURATION);
    }, AUTO_SHOW_INTERVAL);

    return () => {
      clearInterval(interval);
      if (autoHideTimer.current) {
        clearTimeout(autoHideTimer.current);
        autoHideTimer.current = null;
      }
      if (nestedAutoHideTimer.current) {
        clearTimeout(nestedAutoHideTimer.current);
        nestedAutoHideTimer.current = null;
      }
    };
  }, []);

  // ─── Rotate Messages ─────────────────────────────────────────
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, MESSAGE_INTERVAL);
    return () => clearInterval(interval);
  }, [visible]);

  // ─── Dismiss ──────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    // Cancel any pending auto-hide timer
    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }

    // If on homepage, save to sessionStorage (won't show again until refresh)
    if (isHome) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // ignore
      }
      setDismissedSession(true);
    }

    visibleSource.current = null;
    setExiting(true);
    setTimeout(() => {
      setVisible(false);
      setExiting(false);
    }, 300);
  }, [isHome]);

  if (!visible) return null;

  return (
    <div
      className={`fixed top-1/2 -translate-y-1/2 right-3 sm:right-4 z-50 max-w-[280px] sm:max-w-[300px] w-[calc(100vw-1.5rem)] sm:w-[calc(100vw-2rem)] transition-all duration-300 ${
        exiting ? "opacity-0 translate-x-4 scale-95" : "opacity-100 translate-x-0 scale-100"
      }`}
    >
      <div className="bg-gradient-to-br from-red-600 via-red-500 to-rose-500 rounded-2xl shadow-2xl shadow-red-900/30 overflow-hidden text-white">
        <div className="p-3 sm:p-4">
          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-red-700/60 hover:bg-red-800 flex items-center justify-center transition-colors"
          >
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" strokeWidth={3} />
          </button>

          {/* Icon + Rotating text */}
          <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3 pr-5 sm:pr-6">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
            </div>
            <div>
              <p
                key={msgIndex}
                className="text-xs sm:text-sm font-bold text-white leading-snug animate-in fade-in slide-in-from-bottom-1 duration-300"
              >
                {MESSAGES[msgIndex]}
              </p>
              <p className="text-[11px] sm:text-xs text-white/80 font-medium mt-0.5">
                Book a{" "}
                <span className="font-bold text-white underline decoration-white/40">
                  free 30-min
                </span>{" "}
                consultation
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/book-consultation"
            onClick={dismiss}
            className="flex items-center justify-center gap-1.5 w-full h-9 sm:h-10 bg-white text-red-600 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm hover:bg-white/90 transition-all duration-200 cursor-pointer press"
          >
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Book Free Call</span>
            <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </Link>

          <p className="text-[9px] sm:text-[10px] text-white/50 text-center mt-1.5 sm:mt-2 font-medium">
            No commitment · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
