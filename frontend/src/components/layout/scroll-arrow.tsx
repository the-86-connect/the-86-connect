"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";

export function ScrollArrow() {
  const [direction, setDirection] = useState<"down" | "up" | null>(null);
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrolledToBottom = currentScrollY + winHeight >= docHeight - 100;
    const isScrollingUp = currentScrollY < lastScrollY.current;

    lastScrollY.current = currentScrollY;

    if (currentScrollY < 200) {
      // Near top: hide
      setDirection(null);
    } else if (scrolledToBottom) {
      // At bottom: up arrow to go to top
      setDirection("up");
    } else if (isScrollingUp) {
      // Scrolling up: up arrow to go to top
      setDirection("up");
    } else {
      // Scrolling down: down arrow to go to footer
      setDirection("down");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial scroll position check on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleClick = () => {
    if (direction === "down") {
      document.getElementById("footer")?.scrollIntoView({ behavior: "smooth" });
    } else if (direction === "up") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!direction) return null;

  return (
    <button
      onClick={handleClick}
      aria-label={direction === "down" ? "Scroll to footer" : "Scroll to top"}
      className="fixed bottom-44 sm:bottom-24 right-3 sm:right-5 z-50 w-11 h-11 rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-red-700 flex items-center justify-center transition-all duration-300 animate-bounce hover:animate-none hover:scale-110 cursor-pointer border-2 border-white/20 safe-bottom"
    >
      {direction === "down" ? (
        <ArrowDown className="h-5 w-5" />
      ) : (
        <ArrowUp className="h-5 w-5" />
      )}
    </button>
  );
}
