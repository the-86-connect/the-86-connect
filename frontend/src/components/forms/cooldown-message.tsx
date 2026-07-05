"use client";

import { useState, useEffect } from "react";

interface CooldownMessageProps {
  seconds: number;
  onComplete: () => void;
}

export function CooldownMessage({ seconds, onComplete }: CooldownMessageProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  if (remaining <= 0) return null;

  return (
    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 font-semibold">
      Too many submissions. Please wait {remaining} second
      {remaining !== 1 ? "s" : ""} before trying again.
    </div>
  );
}