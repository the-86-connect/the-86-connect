import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  ArrowRight,
  Search,
  Mail,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { TrackingForm } from "@/components/tracking/tracking-form";

export const metadata: Metadata = {
  title: "Track Your Quote — Product Sourcing",
  description:
    "Check the status of your product sourcing inquiry. Enter your reference ID to see the latest updates on supplier sourcing, quotes, and shipping.",
  alternates: { canonical: "/product-sourcing/track-quote" },
};

export default function TrackQuotePage() {
  return (
    <>
      {/* Simple top bar */}
      <header className="fixed top-0 inset-x-0 z-50 py-3">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 bg-white border border-border shadow-soft-sm">
            <Link
              href="/product-sourcing"
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors press"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Product Sourcing</span>
            </Link>
            <Link
              href="/"
              className="group flex items-center gap-2 press"
              aria-label="86Connect home"
            >
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-base">86</span>
              </div>
              <span className="font-display font-black text-lg tracking-tight hidden sm:block text-foreground">
                Connect
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16">
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-3xl">
            {/* Heading */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Quote Tracking
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                Track Your <span className="text-primary">Quote</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium max-w-xl mx-auto">
                Enter your reference ID and email to see the latest status of
                your product sourcing inquiry.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-3xl border border-border shadow-soft-md p-6 sm:p-8 lg:p-10 mb-8">
              <Suspense fallback={<TrackFormSkeleton />}>
                <TrackingForm
                  config={{
                    referencePlaceholder: "SOU-XXXXXX",
                    referenceHint: "SOU-123456",
                    noun: "quote",
                    submissionType: "sourcing",
                    supportEmail: "sourcing@the86connect.com",
                    stages: [
                      {
                        label: "Inquiry Received",
                        description:
                          "We received your sourcing request and assigned a sourcing agent.",
                      },
                      {
                        label: "Supplier Sourcing",
                        description:
                          "We are identifying and vetting verified suppliers for your product.",
                      },
                      {
                        label: "Quotes Received",
                        description:
                          "We gathered pricing from 3-5 suppliers and are preparing your quote.",
                      },
                      {
                        label: "Sample Evaluation",
                        description:
                          "Samples are being arranged or evaluated for quality and specs.",
                      },
                      {
                        label: "Order Confirmed",
                        description:
                          "Supplier is selected, order is placed, and production is scheduled.",
                      },
                      {
                        label: "Shipping Arranged",
                        description:
                          "Production complete. Freight forwarding and shipping are arranged.",
                      },
                    ],
                  }}
                />
              </Suspense>
            </div>

            {/* Help cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <HelpCard
                icon={Mail}
                title="Lost your reference?"
                description="Check your confirmation email or contact us."
                href="mailto:sourcing@the86connect.com"
                linkLabel="Email us"
              />
              <HelpCard
                icon={Clock}
                title="Response time"
                description="Sourcing inquiries are typically reviewed within 1-2 business days."
              />
              <HelpCard
                icon={ShieldCheck}
                title="Secure & private"
                description="Your data is encrypted and never shared with third parties."
              />
            </div>

            {/* CTA back */}
            <div className="text-center mt-10">
              <Link
                href="/product-sourcing#inquire"
                className="inline-flex items-center gap-2 px-5 h-12 bg-white text-foreground rounded-xl font-bold border border-border hover:border-primary/30 transition-all cursor-pointer press"
              >
                <Package className="h-4 w-4 text-primary" />
                <span>Submit a new inquiry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function HelpCard({
  icon: Icon,
  title,
  description,
  href,
  linkLabel,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-soft-sm p-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="font-black text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2">
        {description}
      </p>
      {href && linkLabel && (
        <a
          href={href}
          className="inline-flex items-center gap-1 text-xs font-black text-primary hover:underline"
        >
          {linkLabel}
          <ArrowRight className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function TrackFormSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-5 w-40 bg-muted rounded-md mx-auto" />
      <div className="space-y-4">
        <div className="h-11 bg-muted rounded-xl" />
        <div className="h-11 bg-muted rounded-xl" />
        <div className="h-12 bg-primary/20 rounded-xl" />
      </div>
    </div>
  );
}
