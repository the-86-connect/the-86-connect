import type { Metadata } from "next";
import { HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { FAQ_SECTIONS } from "@/data/faq";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Find answers to common questions about studying in China (admissions, scholarships, visas) and product sourcing from China (suppliers, quality control, shipping).",
  alternates: {
    canonical: "/faq",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-section-warm relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <header className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-3d-xs mb-4 sm:mb-5">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Support
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-4 sm:mb-5">
              Frequently Asked <span className="text-gradient-red-animated">Questions</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Everything you need to know about studying in China and sourcing
              products from verified Chinese suppliers.
            </p>
          </header>

          <div className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-card border border-border/60 shadow-3d-xl overflow-hidden mb-10">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-70" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative">
              <FAQAccordion sections={FAQ_SECTIONS} />
            </div>
          </div>

          <div className="text-center p-6 sm:p-8 rounded-3xl bg-primary/5 border border-primary/15">
            <MessageCircle className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-display font-black text-xl sm:text-2xl mb-2">
              Still have questions?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 max-w-md mx-auto">
              Can&apos;t find the answer you&apos;re looking for? Our team is
              ready to help.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all cursor-pointer press"
              >
                Contact Us
              </Link>
              <a
                href="mailto:info@the86connects.com"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white text-foreground rounded-2xl font-black text-sm border border-border hover:border-primary/30 transition-all cursor-pointer press"
              >
                Email Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
