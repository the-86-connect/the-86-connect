import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BookingPageClient } from "./booking-page-client";

export const metadata: Metadata = {
  title: "Book a Free Consultation — 86 Connect",
  description:
    "Schedule a free 30-minute consultation with 86 Connect. Get personalized guidance on studying in China or sourcing products. No commitment required.",
  alternates: { canonical: "/book-consultation" },
  openGraph: {
    title: "Book a Free Consultation — 86 Connect",
    description:
      "Schedule a free 30-minute consultation with 86 Connect. Get personalized guidance on studying in China or sourcing products.",
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
