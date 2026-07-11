import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookingPageClient } from "./booking-page-client";

export const metadata: Metadata = {
  title: "Book a Free Consultation",
  description:
    "Schedule a free 30-minute consultation with 86Connect. Get personalized guidance on studying in China or sourcing products from China. No commitment required — book now.",
  alternates: { canonical: "/book-consultation" },
  openGraph: {
    title: "Book a Free Consultation | 86Connect",
    description:
      "Schedule a free 30-minute consultation with 86Connect. Get personalized guidance on studying in China or sourcing products from China. No commitment required.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Book a Free Consultation with 86Connect" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Free Consultation | 86Connect",
    description:
      "Schedule a free 30-minute consultation. Get personalized guidance on studying in China or sourcing products.",
    images: ["/og-image.jpg"],
  },
};

export default function BookConsultationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16 sm:pt-20 min-h-screen bg-section-warm-gradient">
        <BookingPageClient />
      </main>
      <Footer />
    </>
  );
}
