"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

const CONSENT_KEY = "86connects_cookie_consent";
const CONSENT_VERSION = "1";

type ConsentValue = "accepted" | "rejected";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      // Re-show if the consent version changed (e.g., policy update)
      const storedVersion = localStorage.getItem(`${CONSENT_KEY}_version`);
      if (!stored || storedVersion !== CONSENT_VERSION) {
        // Small delay so it doesn't flash before hydration
        const timer = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage may be unavailable (private mode) — default to hidden
    }
  }, []);

  const setConsent = useCallback((value: ConsentValue) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.setItem(`${CONSENT_KEY}_version`, CONSENT_VERSION);
    } catch {
      // Ignore storage failures
    }
    setVisible(false);
  }, []);

  const handleDismiss = useCallback(() => {
    // Dismissing without explicit choice = rejected for this session
    setConsent("rejected");
  }, [setConsent]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed inset-x-0 above-mobile-tab z-50 p-3 sm:p-5 safe-bottom pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-3xl relative rounded-2xl glass-strong shadow-3d-2xl overflow-hidden border-2 border-white/85">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute -top-16 -right-16 w-40 h-40 orb-red opacity-25" />
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss cookie consent banner"
          className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5">
          <div className="flex items-start gap-3 flex-1">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-primary/40 blur-md rounded-xl" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-red-700 flex items-center justify-center shadow-glow-sm">
                <span className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
                <Cookie className="h-5 w-5 text-white relative drop-shadow" aria-hidden="true" />
              </div>
            </div>
            <div className="text-sm text-foreground leading-relaxed font-medium pr-6">
              We use cookies to improve your browsing experience and analyze
              website traffic. See our{" "}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline font-bold"
              >
                Privacy Policy
              </Link>
              .
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 sm:ml-auto">
            <button
              type="button"
              onClick={() => setConsent("rejected")}
              className="px-4 h-10 text-sm font-bold rounded-xl border-2 border-border bg-card text-foreground hover:border-primary hover:text-primary shadow-3d-xs hover:shadow-3d-sm transition-all duration-200 cursor-pointer press"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => setConsent("accepted")}
              className="group relative px-5 h-10 text-sm font-bold rounded-xl bg-gradient-to-br from-primary via-primary to-red-700 text-primary-foreground shadow-glow hover:shadow-glow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer press overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              <span className="relative">Accept</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
