import {
  Globe,
  Shield,
  Heart,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Eye,
  Scale,
  Layers,
  Truck,
  Target,
} from "lucide-react";

const VALUES = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Flat-rate pricing, full disclosure of costs, and clear contracts. No hidden fees or unexpected charges.",
  },
  {
    icon: Scale,
    title: "Accountability",
    description:
      "Payments handled through a registered corporate account in China, ensuring legal compliance and trust.",
  },
  {
    icon: Layers,
    title: "Flexibility",
    description:
      "Choose between full-service or partial-service arrangements tailored to your needs and budget.",
  },
  {
    icon: Truck,
    title: "Efficiency",
    description:
      "Consolidated logistics management and supplier coordination reduce delays and costs at every stage.",
  },
];

const DIFFERENTIATORS = [
  { label: "Years of Experience", value: "10+", icon: TrendingUp },
  { label: "Verified Partners", value: "50K+", icon: Shield },
  { label: "Countries Served", value: "50+", icon: Globe },
  { label: "Client Satisfaction", value: "98%", icon: Award },
];

export function AboutUsSection() {
  return (
    <section
      id="about-us"
      className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-section-alt"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
            <Heart className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Who We Are
            </span>
          </div>
          <h2 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-4 leading-[1.05]">
            About <span className="text-primary">86 Connect</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
            Your trusted partner for unlocking China&apos;s opportunities
          </p>
        </div>

        {/* Company Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-12 sm:mb-16">
          {/* Story - large card */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-border shadow-soft-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary flex items-center justify-center">
                <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-primary">
                  Our Story
                </div>
                <div className="text-xs text-muted-foreground font-bold">
                  Incorporated November 2023
                </div>
              </div>
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl mb-3 sm:mb-4">
              Bridging{" "}
              <span className="text-primary">China & the World</span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3 sm:mb-4 font-medium">
              <span className="font-black text-foreground">86 Connect</span> is
              the digital subsidiary of{" "}
              <span className="font-black text-foreground">
                Beijing BridgePath International Consulting Co., Ltd
              </span>
              , a dynamic consulting firm incorporated on November 23, 2023 in
              Beijing, China. The number{" "}
              <span className="font-black text-primary">86</span> represents
              China&apos;s international dialing code, symbolizing our role as
              the direct connection to everything China has to offer.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              We provide a seamless online gateway for individuals and
              businesses seeking to expand, source, or study in China. With a
              strategic presence in West Africa, we connect overseas clients
              with trusted Chinese suppliers and universities — ensuring smooth
              end-to-end operations from sourcing to delivery, and from
              application to enrollment.
            </p>
          </div>

          {/* Mission - red card */}
          <div className="lg:col-span-5 bg-gradient-to-br from-primary to-red-800 rounded-3xl p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Target className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/90">
                Our Mission
              </div>
            </div>

            <h3 className="font-display font-black text-2xl sm:text-3xl mb-3 sm:mb-4 leading-tight text-white">
              Simplifying Access to China&apos;s Opportunities
            </h3>
            <p className="text-sm sm:text-base text-white/95 leading-relaxed mb-3 sm:mb-4 font-medium">
              We exist to simplify access to China&apos;s educational and
              economic opportunities. Whether you&apos;re a student seeking a
              world-class education or a business looking to source quality
              products, we provide the expertise, connections, and support you
              need to succeed.
            </p>
            <p className="text-sm sm:text-base text-white/95 leading-relaxed font-medium">
              Our team combines deep local knowledge with international
              experience, ensuring you receive culturally informed, practically
              useful guidance at every step.
            </p>

            {/* Quote */}
            <div className="mt-auto pt-6 border-t border-white/30">
              <p className="text-xs sm:text-sm font-black text-white italic">
                &ldquo;Connecting the world to China, one success at a
                time.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-16">
          {DIFFERENTIATORS.map((item) => (
            <MetricCard
              key={item.label}
              value={item.value}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>

        {/* Core Values */}
        <div>
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Our Value Proposition
              </span>
            </div>
            <h3 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em]">
              Our Core <span className="text-primary">Values</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {VALUES.map((value) => (
              <ValueCard key={value.title} value={value} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  value,
  label,
  icon: Icon,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
}) {
  return (
    <div className="text-center p-5 sm:p-7 rounded-3xl bg-white border border-border shadow-soft-sm hover:shadow-soft-md transition-shadow lift-sm">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-1 sm:mb-2 leading-none">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-bold">
        {label}
      </div>
    </div>
  );
}

function ValueCard({ value }: { value: (typeof VALUES)[number] }) {
  const Icon = value.icon;
  return (
    <div className="bg-white rounded-3xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 p-5 sm:p-6 lift-sm card-shine">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
      </div>
      <h4 className="font-display font-black text-lg sm:text-xl mb-2">
        {value.title}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
        {value.description}
      </p>
    </div>
  );
}
