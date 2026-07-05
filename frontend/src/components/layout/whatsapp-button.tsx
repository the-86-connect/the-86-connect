"use client";

import { X, Send, AlertCircle } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

const HINT_MESSAGES = [
  "Chat with us! 👋",
  "Need help? We're here! 💬",
  "Questions? Ask us anything! ✨",
  "Study in China? Let's talk! 🎓",
  "Product sourcing? We can help! 📦",
  "Quick reply guaranteed! ⚡",
];

const SHOW_DURATION_MS = 2000; // 2 seconds visible
const HIDE_DURATION_MS = 60 * 1000; // 1 minute hidden
const INITIAL_DELAY_MS = 5000; // 5 seconds before first hint

export function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showHint, setShowHint] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startHintCycle = useCallback(() => {
    // Show hint
    setShowHint(true);
    // Hide after 2 seconds
    hintTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
      // Rotate to next message, wait 1 minute, then show again
      hintTimeoutRef.current = setTimeout(() => {
        setHintIndex((prev) => (prev + 1) % HINT_MESSAGES.length);
        startHintCycle();
      }, HIDE_DURATION_MS);
    }, SHOW_DURATION_MS);
  }, []);

  useEffect(() => {
    // Initial delay before first hint
    const initialTimer = setTimeout(() => startHintCycle(), INITIAL_DELAY_MS);
    return () => {
      clearTimeout(initialTimer);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [startHintCycle]);

  // Don't show hints while chat is open
  useEffect(() => {
    if (isOpen) {
      setShowHint(false);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    } else {
      // Restart hint cycle when chat closes
      const restartTimer = setTimeout(() => startHintCycle(), 3000);
      return () => clearTimeout(restartTimer);
    }
  }, [isOpen, startHintCycle]);

  const phoneNumber = "8617611533296";
  const encodedMessage = encodeURIComponent(message || "Hi, I'm interested in your services!");
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  const handleSend = () => {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
    setMessage("");
  };

  return (
    <div className="fixed bottom-24 sm:bottom-6 right-3 sm:right-5 z-50 flex flex-col items-end gap-2 safe-bottom">
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-soft-xl w-[calc(100vw-24px)] max-w-80 sm:w-80 border border-border animate-in slide-in-from-bottom-4 fade-in duration-250 origin-bottom-right overflow-hidden">
          <div className="bg-[#25D366] px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Chat on WhatsApp</div>
                <div className="text-white/80 text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  Usually replies in a few minutes
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-4 py-3 bg-[#E5DDD5]/30 max-h-60 overflow-y-auto">
            <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2.5 shadow-sm max-w-[85%] mb-3">
              <p className="text-xs text-foreground/70 mb-1 font-medium">86 Connect Team</p>
              <p className="text-sm text-foreground leading-relaxed">
                Hi there! 👋 Have questions about studying in China or product sourcing? We're here to help!
              </p>
              <p className="text-[10px] text-foreground/40 mt-1 text-right">Just now</p>
            </div>
            <div className="flex items-start gap-1.5 px-1">
              <AlertCircle className="h-3 w-3 text-foreground/30 shrink-0 mt-0.5" />
              <p className="text-[10px] text-foreground/40 leading-relaxed">
                End-to-end encrypted. Messages go directly to WhatsApp.
              </p>
            </div>
          </div>

          <div className="p-3 border-t border-border bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 resize-none bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 max-h-24 border border-transparent focus:border-primary/30"
              />
              <button
                onClick={handleSend}
                className="w-9 h-9 bg-[#25D366] rounded-xl flex items-center justify-center text-white hover:bg-[#20BA5A] transition-colors cursor-pointer shadow-sm shrink-0 press"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {!isOpen && showHint && (
        <div className="bg-white rounded-xl px-3 py-2 shadow-soft-md border border-border text-xs font-semibold text-foreground/80 animate-in fade-in duration-300 cursor-pointer max-w-[180px]"
          onClick={() => setIsOpen(true)}
        >
          {HINT_MESSAGES[hintIndex]}
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-white border-r border-b border-border rotate-45" />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-soft-lg hover:bg-[#20BA5A] hover:scale-105 active:scale-95 transition-all duration-250 cursor-pointer press relative group shrink-0"
        aria-label={isOpen ? "Close WhatsApp chat" : "Open WhatsApp chat"}
      >
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20 group-hover:opacity-30 [animation-duration:2.5s]" />
        {isOpen ? (
          <X className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
        ) : (
          <WhatsAppIcon className="h-6 w-6 sm:h-7 sm:w-7 relative z-10" />
        )}
      </button>
    </div>
  );
}
