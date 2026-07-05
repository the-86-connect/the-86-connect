"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const prevPathRef = useRef<string>(pathname);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const addTimeout = (fn: () => void, ms: number) => {
      const t = setTimeout(fn, ms);
      timeouts.push(t);
      return t;
    };
    const clearAll = () => {
      timeouts.forEach(clearTimeout);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };

    setVisible(true);
    setProgress(8);

    let p = 8;
    const tick = () => {
      p += Math.random() * 10 + 2;
      if (p >= 82) p = 82;
      setProgress(p);
      if (p < 82) {
        addTimeout(tick, 200 + Math.random() * 200);
      }
    };
    addTimeout(tick, 80);

    const finish = () => {
      clearAll();
      setProgress(100);
      addTimeout(() => {
        setVisible(false);
        addTimeout(() => setProgress(0), 250);
      }, 300);
    };

    const raf = requestAnimationFrame(() => {
      addTimeout(finish, 400);
    });
    rafRef.current = raf;

    return clearAll;
  }, [pathname]);

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.2s ease" }}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"
        style={{
          width: `${progress}%`,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      />
    </div>
  );
}
