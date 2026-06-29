"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSection {
  category: string;
  items: FAQItem[];
}

interface FAQAccordionProps {
  sections: FAQSection[];
  title?: ReactNode;
  ctaText?: string;
  ctaHref?: string;
  ctaSubtext?: string;
}

export function FAQAccordion({
  sections,
  title,
  ctaText,
  ctaHref,
  ctaSubtext,
}: FAQAccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      {title && (
        <div className="text-center space-y-4 mb-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
            <HelpCircle className="h-4 w-4" />
            FAQ
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight">
            {title}
          </h2>
        </div>
      )}
      {sections.map((section, sIdx) => (
        <div key={sIdx}>
          <h3 className="font-display font-black text-xl sm:text-2xl mb-4 text-foreground">
            {section.category}
          </h3>
          <div className="space-y-3">
            {section.items.map((item, qIdx) => {
              const key = `${sIdx}-${qIdx}`;
              const isOpen = openItems.has(key);
              return (
                <div
                  key={key}
                  className={cn(
                    "rounded-2xl border bg-card transition-all duration-300 overflow-hidden",
                    isOpen
                      ? "border-primary/30 shadow-soft-md"
                      : "border-border/60 hover:border-primary/20",
                  )}
                >
                  <button
                    onClick={() => toggle(key)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className="font-bold text-sm sm:text-base text-foreground leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300",
                        isOpen && "rotate-180 text-primary",
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {ctaText && ctaHref && (
        <div className="text-center pt-4 space-y-3">
          {ctaSubtext && (
            <p className="text-muted-foreground text-sm">{ctaSubtext}</p>
          )}
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all hover:gap-3 press"
          >
            {ctaText}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
