"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/auth-context";
import { UserAuthProvider } from "@/context/user-auth-context";
import { ContactProvider } from "@/context/contact-context";
import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { ScrollArrow } from "@/components/layout/scroll-arrow";
import { BookingPopup } from "@/components/layout/booking-popup";

export function RouteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <AuthProvider>
        <UserAuthProvider>{children}</UserAuthProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <UserAuthProvider>
        <ContactProvider>
          {children}
          <Toaster />
          <CookieConsent />
          <WhatsAppButton />
          <ScrollArrow />
          <BookingPopup />
        </ContactProvider>
      </UserAuthProvider>
    </AuthProvider>
  );
}