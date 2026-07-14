import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Mail,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { TrackingForm } from "@/components/tracking/tracking-form";

export const metadata: Metadata = {
  title: "Track Your Shipment — Car Shipping",
  description:
    "Check the status of your car shipment from China. Enter your reference ID and email to see real-time tracking updates.",
  alternates: { canonical: "/car-shipping/track" },
};

export default function TrackCarShipmentPage() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 py-3">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 bg-white border border-border shadow-soft-sm">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-primary transition-colors press"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
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
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Search className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Shipment Tracking
                </span>
              </div>
              <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                Track Your <span className="text-primary">Shipment</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium max-w-xl mx-auto">
                Enter your reference ID and email to see the latest status of
                your vehicle shipment from China.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-soft-md p-6 sm:p-8 lg:p-10 mb-8">
              <Suspense fallback={<TrackFormSkeleton />}>
                <TrackingForm
                  config={{
                    referencePlaceholder: "CAR-XXXXXX",
                    referenceHint: "CAR-123456",
                    noun: "shipment",
                    submissionType: "car_shipping",
                    supportEmail: "shipping@the86connect.com",
                    stages: [
                      {
                        label: "Shipment Pending",
                        description:
                          "Your shipment details are being confirmed.",
                      },
                      {
                        label: "Booking Confirmed",
                        description:
                          "Shipping space has been reserved for your vehicle.",
                      },
                      {
                        label: "Loading",
                        description:
                          "Your vehicle is being loaded onto the vessel.",
                      },
                      {
                        label: "In Transit",
                        description:
                          "Your vehicle is on its way to the destination port.",
                      },
                      {
                        label: "At Destination Port",
                        description:
                          "The vessel has arrived at the destination port.",
                      },
                      {
                        label: "Customs Clearance",
                        description:
                          "Your vehicle is going through customs clearance.",
                      },
                      {
                        label: "Delivered",
                        description:
                          "Your vehicle has been delivered successfully.",
                      },
                    ],
                  }}
                />
              </Suspense>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <HelpCard
                icon={Mail}
                title="Lost your reference?"
                description="Check your confirmation email or contact us."
                href="mailto:shipping@the86connect.com"
                linkLabel="Email us"
              />
              <HelpCard
                icon={Clock}
                title="Sea freight"
                description="Typical transit time is 40-60 days depending on destination."
              />
              <HelpCard
                icon={ShieldCheck}
                title="Secure & insured"
                description="All shipments are fully insured and tracked at every step."
              />
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
          <ArrowLeft className="h-3 w-3 rotate-180" />
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
