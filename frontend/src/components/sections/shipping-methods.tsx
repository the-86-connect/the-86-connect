"use client";

import { Ship, Plane, Truck, Clock } from "lucide-react";

const shippingMethods = [
  {
    icon: Ship,
    title: "Sea Freight",
    description: "Most economical for large shipments. Ideal for bulk orders with standard delivery timelines.",
    duration: "40-60 days",
    regions: ["Africa", "America", "Europe"],
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-500",
    durationColor: "text-blue-500",
    regionColor: "text-blue-600",
    regionBgColor: "bg-blue-500/5",
    regionBorderColor: "border-blue-500/20",
  },
  {
    icon: Plane,
    title: "Air Freight",
    description: "Faster delivery for time-sensitive goods. Perfect for urgent shipments that need to arrive sooner.",
    duration: "10-12 days",
    regions: ["Africa", "America", "Europe"],
    bgColor: "bg-purple-500/10",
    iconColor: "text-purple-500",
    durationColor: "text-purple-500",
    regionColor: "text-purple-600",
    regionBgColor: "bg-purple-500/5",
    regionBorderColor: "border-purple-500/20",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    description: "Fastest option for urgent small packages. Door-to-door delivery with premium tracking.",
    duration: "2-3 days",
    regions: ["Africa", "America", "Europe"],
    bgColor: "bg-green-500/10",
    iconColor: "text-green-500",
    durationColor: "text-green-500",
    regionColor: "text-green-600",
    regionBgColor: "bg-green-500/5",
    regionBorderColor: "border-green-500/20",
  },
];

export function ShippingMethodsSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-6 lg:px-8 bg-section-alt">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-14">
          <span className="inline-block text-xs sm:text-sm font-black text-primary tracking-[0.2em] uppercase mb-3">
            Shipping Options
          </span>
          <h2 className="font-display font-black text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground tracking-[-0.035em]">
            Reliable <span className="text-primary">International Shipping</span>
          </h2>
          <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
            From China to your doorstep. We offer multiple shipping options to fit your timeline and budget, with full tracking and customs support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {shippingMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div
                key={method.title}
                className="group bg-white rounded-2xl border border-border/80 p-5 sm:p-6 md:p-7 lg:p-8 shadow-soft-sm hover:shadow-soft-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${method.bgColor} ${method.iconColor} mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                </div>

                <h3 className="font-display font-black text-xl sm:text-2xl md:text-2xl lg:text-3xl text-foreground mb-2 sm:mb-3">
                  {method.title}
                </h3>

                <p className="text-sm sm:text-base text-muted-foreground font-medium leading-relaxed mb-4 sm:mb-5">
                  {method.description}
                </p>

                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${method.bgColor} border border-current/20`}>
                  <Clock className={`h-3.5 w-3.5 ${method.durationColor}`} />
                  <span className={`text-xs font-black ${method.durationColor}`}>
                    {method.duration}
                  </span>
                </div>

                <div className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/60">
                  <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2.5">
                    Ships to
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {method.regions.map((region) => (
                      <span
                        key={region}
                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-black ${method.regionBgColor} ${method.regionColor} border ${method.regionBorderColor}`}
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}