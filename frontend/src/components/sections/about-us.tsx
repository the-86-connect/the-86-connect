import {
  Globe,
  Shield,
  Heart,
  Calendar,
  Award,
  Zap,
  Eye,
  Scale,
  Layers,
  Truck,
  Target,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const VALUES = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Flat-rate pricing, full disclosure of costs, and clear contracts. No hidden fees or unexpected charges.",
    bgGradient: "bg-gradient-to-br from-sky-50 to-blue-50",
  },
  {
    icon: Scale,
    title: "Accountability",
    description:
      "Payments handled through a registered corporate account in China, ensuring legal compliance and trust.",
    bgGradient: "bg-gradient-to-br from-amber-50 to-orange-50",
  },
  {
    icon: Layers,
    title: "Flexibility",
    description:
      "Choose between full-service or partial-service arrangements tailored to your needs and budget.",
    bgGradient: "bg-gradient-to-br from-emerald-50 to-green-50",
  },
  {
    icon: Truck,
    title: "Efficiency",
    description:
      "Consolidated logistics management and supplier coordination reduce delays and costs at every stage.",
    bgGradient: "bg-gradient-to-br from-violet-50 to-purple-50",
  },
];

const DIFFERENTIATORS = [
  { label: "Established", value: "Nov 2023", icon: Calendar, bgGradient: "bg-gradient-to-br from-sky-50 to-cyan-50" },
  { label: "Verified Partners", value: "50K+", icon: Shield, bgGradient: "bg-gradient-to-br from-emerald-50 to-teal-50" },
  { label: "Countries Served", value: "50+", icon: Globe, bgGradient: "bg-gradient-to-br from-amber-50 to-yellow-50" },
  { label: "Client Satisfaction", value: "98%", icon: Award, bgGradient: "bg-gradient-to-br from-rose-50 to-pink-50" },
];

export function AboutUsSection() {
  return (
    <section
      id="about-us"
      className="relative py-16 sm:py-20 md:py-24 lg:py-28 px-4 sm:px-5 md:px-6 lg:px-8 bg-section-alt"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10 md:mb-12 lg:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
            <Heart className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-black uppercase tracking-wider text-primary">
              Who We Are
            </span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] mb-4 leading-[1.05]">
            About <span className="text-primary">86 Connect</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
            Your trusted partner for unlocking China&apos;s opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          <div className="md:col-span-7 bg-white rounded-2xl border border-border/80 shadow-soft-sm p-5 sm:p-6 md:p-7 lg:p-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary flex items-center justify-center p-2 relative">
                <Image src="/favicon-86-connect-official.png" alt="86 Connect" fill className="object-contain brightness-0 invert" sizes="56px" />
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

            <h3 className="font-display font-black text-xl sm:text-2xl md:text-2xl lg:text-3xl tracking-[-0.035em] mb-3 sm:mb-4 md:mb-4 lg:mb-5">
              Bridging <span className="text-primary">China & the World</span>
            </h3>

            <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4 font-semibold">
              <span className="font-black">86 Connect</span> is the digital
              subsidiary of{" "}
              <span className="font-black">
                Beijing BridgePath International Consulting Co., Ltd
              </span>
              , a dynamic consulting firm incorporated in Beijing, China on
              November 23, 2023.
            </p>

            <div className="flex items-start gap-3 bg-primary/5 rounded-xl px-4 py-3 border border-primary/10 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-px">
                <span className="text-white font-black text-xs">86</span>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                The number{" "}
                <span className="font-black text-primary">86</span>{" "}is
                China&apos;s international dialing code — it symbolizes our role
                as the direct line connecting you to everything China has to
                offer.
              </p>
            </div>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-medium">
              We provide a seamless online gateway for individuals and
              businesses seeking to expand, source, or study in China. With a
              strategic presence in West Africa, we connect overseas clients
              with trusted Chinese suppliers and universities — ensuring smooth
              end-to-end operations from sourcing to delivery, and from
              application to enrollment.
            </p>
          </div>

          <div className="md:col-span-5 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-5 sm:p-6 md:p-7 lg:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-4 sm:mb-5">
              <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white/90">
                Our Mission
              </div>
            </div>

            <h3 className="font-display font-black text-xl sm:text-2xl md:text-2xl lg:text-3xl mb-3 sm:mb-4 leading-tight text-white">
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

            <div className="mt-auto pt-5 sm:pt-6">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-red-500 rounded-xl font-black text-sm hover:bg-white/95 transition-all duration-200 cursor-pointer press shadow-soft-sm hover:shadow-soft-md lift-sm"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Book a Free Call</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-10 sm:mb-12 md:mb-14 lg:mb-16">
          {DIFFERENTIATORS.map((item) => (
            <MetricCard
              key={item.label}
              value={item.value}
              label={item.label}
              icon={item.icon}
              gradient={item.bgGradient}
            />
          ))}
        </div>

        <div>
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
              <Zap className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Our Value Proposition
              </span>
            </div>
            <h3 className="font-display font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-[-0.035em]">
              Our Core <span className="text-primary">Values</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {VALUES.map((value) => (
              <ValueCard key={value.title} value={value} />
            ))}
          </div>
        </div>

        <div className="mt-10 sm:mt-12 md:mt-14 lg:mt-16 bg-white rounded-2xl border border-border/80 shadow-soft-sm p-5 sm:p-6 md:p-7 lg:p-8 flex flex-col md:flex-row items-center md:items-start lg:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <CalendarCheck className="h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary" />
            </div>
            <div>
              <h4 className="font-display font-black text-lg sm:text-xl leading-tight">
                Ready to connect with China?
              </h4>
              <p className="text-sm text-muted-foreground font-medium mt-0.5">
                Book a free 15-minute consultation with our team.
              </p>
            </div>
          </div>
          <Link
            href="/book-consultation"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black text-sm hover:bg-red-700 transition-colors duration-200 cursor-pointer press shadow-soft-sm hover:shadow-soft-md lift-sm shrink-0"
          >
            <CalendarCheck className="h-4 w-4" />
            <span>Book a Call</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  value,
  label,
  icon: Icon,
  gradient,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  gradient?: string;
}) {
  return (
    <div className={cn("text-center p-4 sm:p-5 md:p-5 lg:p-7 rounded-2xl border border-border/80 shadow-soft-sm hover:shadow-soft-md transition-shadow lift-sm", gradient || "bg-white")}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-3 lg:mb-4">
        <Icon className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 text-primary" />
      </div>
      <div className="text-2xl sm:text-3xl md:text-3xl lg:text-5xl font-black text-primary mb-1 sm:mb-1.5 lg:mb-2 leading-none">
        {value}
      </div>
      <div className="text-xs sm:text-xs md:text-sm text-muted-foreground font-bold">
        {label}
      </div>
    </div>
  );
}

function ValueCard({ value }: { value: (typeof VALUES)[number] }) {
  const Icon = value.icon;

  return (
    <div className={cn("group rounded-2xl border border-border/80 shadow-soft-sm hover:shadow-soft-md hover:border-primary/25 transition-all duration-300 p-5 sm:p-5 md:p-6 lift-sm", value.bgGradient)}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center mb-3 sm:mb-4">
        <Icon className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" strokeWidth={2} />
      </div>

      <h4 className="font-display font-black text-lg sm:text-lg md:text-xl mb-2 tracking-[-0.02em] text-foreground">
        {value.title}
      </h4>

      <p className="text-sm sm:text-sm md:text-[15px] text-slate-600 leading-relaxed font-medium">
        {value.description}
      </p>
    </div>
  );
}
