"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
  duration?: number;
}

interface ParsedValue {
  target: number;
  prefix: string;
  suffix: string;
  scale: "K" | "M" | null;
  isNumeric: boolean;
  rawValue: string;
}

function parseValue(raw: string): ParsedValue {
  const cleaned = raw.trim();
  let prefix = "";
  let suffix = "";
  let scale: "K" | "M" | null = null;

  let numStr = cleaned;

  if (numStr.startsWith("$")) {
    prefix = "$";
    numStr = numStr.slice(1);
  }

  if (numStr.endsWith("%")) {
    suffix = "%";
    numStr = numStr.slice(0, -1);
  } else if (numStr.endsWith("+")) {
    suffix = "+";
    numStr = numStr.slice(0, -1);
  }

  const upperNumStr = numStr.toUpperCase();
  if (upperNumStr.endsWith("M")) {
    scale = "M";
    numStr = numStr.slice(0, -1);
  } else if (upperNumStr.endsWith("K")) {
    scale = "K";
    numStr = numStr.slice(0, -1);
  }

  const num = parseFloat(numStr);
  const isNumeric = !isNaN(num) && isFinite(num) && numStr.length > 0;

  if (!isNumeric) {
    return {
      target: 0,
      prefix: "",
      suffix: "",
      scale: null,
      isNumeric: false,
      rawValue: cleaned,
    };
  }

  const multiplier = scale === "M" ? 1_000_000 : scale === "K" ? 1_000 : 1;
  const target = num * multiplier;

  return { target, prefix, suffix, scale, isNumeric: true, rawValue: cleaned };
}

function formatCount(count: number, parsed: ParsedValue): string {
  if (!parsed.isNumeric) return parsed.rawValue;

  const { prefix, suffix, scale } = parsed;
  let displayNum: string;

  if (scale === "M") {
    displayNum = String(Math.round(count / 1_000_000));
  } else if (scale === "K") {
    displayNum = String(Math.round(count / 1_000));
  } else {
    displayNum = String(Math.floor(count));
  }

  return `${prefix}${displayNum}${scale ?? ""}${suffix}`;
}

export function AnimatedCounter({
  value,
  className = "",
  duration = 1800,
}: AnimatedCounterProps) {
  const initialParsed = parseValue(value);
  const parsedRef = useRef<ParsedValue>(initialParsed);
  const [displayValue, setDisplayValue] = useState<string>(() =>
    initialParsed.isNumeric ? formatCount(0, initialParsed) : initialParsed.rawValue,
  );
  const elementRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);

  // Keep parsed value in sync when prop changes
  useEffect(() => {
    parsedRef.current = parseValue(value);
  }, [value]);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const pv = parsedRef.current;

    // Non-numeric: just display as-is
    if (!pv.isNumeric) {
      setDisplayValue(pv.rawValue);
      return;
    }

    // Respect reduced motion preference
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplayValue(formatCount(pv.target, pv));
      hasAnimatedRef.current = true;
      return;
    }

    const runAnimation = () => {
      if (hasAnimatedRef.current) return;
      hasAnimatedRef.current = true;

      const currentParsed = parsedRef.current;
      const startTime = performance.now();

      const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const current = eased * currentParsed.target;
        setDisplayValue(formatCount(current, currentParsed));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayValue(formatCount(currentParsed.target, currentParsed));
          frameRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={elementRef} className={className}>
      {displayValue}
    </span>
  );
}