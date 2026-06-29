"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

/**
 * Single WhatsApp number — available 24/7.
 */
const WHATSAPP_NUMBER = "8617611533296";

type ContextMessage = {
  label: string;
  message: string;
};

function getMessage(pathname: string): ContextMessage {
  if (pathname.startsWith("/study-in-china/track-application")) {
    return {
      label: "Study Application Tracking",
      message:
        "Hi! I'm from your website and I'm checking on my study application status. Could you help me?",
    };
  }
  if (pathname.startsWith("/study-in-china")) {
    return {
      label: "Study in China",
      message:
        "Hi! I'm from your website and I'm interested in studying in China. I'd like to know more about the application process and scholarships.",
    };
  }
  if (pathname.startsWith("/product-sourcing/track-quote")) {
    return {
      label: "Sourcing Quote Tracking",
      message:
        "Hi! I'm from your website and I'm checking on my product sourcing quote status. Could you help me?",
    };
  }
  if (pathname.startsWith("/product-sourcing")) {
    return {
      label: "Product Sourcing",
      message:
        "Hi! I'm from your website and I'm interested in product sourcing from China. I'd like to know more about your sourcing services.",
    };
  }
  return {
    label: "General Inquiry",
    message:
      "Hi! I'm from your website and I'd like to learn more about your services.",
  };
}

export function WhatsAppButton() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { label, message } = getMessage(pathname);
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message,
  )}`;

  return (
    <div className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-50 flex items-end gap-2">
      {/* Tooltip / label */}
      {showTooltip && (
        <div className="hidden sm:block mb-1.5 px-3.5 py-2 rounded-xl bg-white border border-border animate-in fade-in slide-in-from-right-2 duration-300">
          <p className="text-xs font-black text-foreground whitespace-nowrap">
            Chat with us
          </p>
          <p className="text-[10px] text-muted-foreground font-semibold whitespace-nowrap">
            {label} ·{" "}
            <span className="text-primary">Online 24/7</span>
          </p>
        </div>
      )}

      {/* Button */}
      <div className="relative">
        {/* Wave / pulse rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30 [animation-duration:2.5s]" />
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 [animation-duration:2.5s] [animation-delay:1.2s]" />
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Chat on WhatsApp — ${label}`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className="group relative w-14 h-14 rounded-full bg-[#25D366] border-b-[5px] border-b-[#128C7E] flex items-center justify-center hover:bg-[#1ebe5d] hover:border-b-[#0e6b5e] active:translate-y-[3px] active:border-b-[2px] transition-all duration-150"
        >
          {/* Online status dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white z-10" />
          <MessageCircle className="relative w-7 h-7 text-white" />
        </a>
      </div>
    </div>
  );
}
