import type { Metadata } from "next";
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
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BreadcrumbSchema, AboutPageSchema } from "@/components/seo/structured-data";
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

const SITE_URL = "https://www.the86connect.com";

export const metadata: Metadata = {
  title: "About 86Connect — Your Trusted Gateway to China",
  description:
    "86Connect is your trusted gateway to China. We provide end-to-end services for Study in China and Product Sourcing from China. Learn about our story, mission, and values.",
  keywords: [
    "86Connect",
    "86connect",
    "the 86 connect",
    "86 connect china",
    "86 connect about",
    "about 86 connect",
    "86 connect services",
    "86 connect company",
    "86 connect beijing",
    "Study in China",
    "Product Sourcing from China",
    "China education consultancy",
    "China sourcing agent",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: `${SITE_URL}/about`,
    siteName: "86Connect",
    title: "About 86Connect — Your Trusted Gateway to China",
    description:
      "86Connect is your trusted gateway to China. Learn about our story, mission, and how we help international students study in China and businesses source products from China.",
    images: [{ url: `${SITE_URL}/logo-main.png`, width: 180, height: 49, alt: "About 86Connect — Your Trusted Gateway to China", type: "image/png" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@86connect",
    creator: "@86connect",
    title: "About 86Connect — Your Trusted Gateway to China",
    description:
      "Learn about 86Connect, your trusted gateway to China for studying and sourcing products.",
    images: [`${SITE_URL}/logo-main.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function AboutPage() {
  return (
    <>
      <BreadcrumbSchema items={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
      <AboutPageSchema />
      <Navbar />
      <main className="flex-1">
        <section className="relative py-12 sm:py-16 md:py-20 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-orange-50" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent" />
          
          <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
                  <Heart className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Who We Are
                  </span>
                </div>
                <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] mb-6 leading-[1.05]">
                  About <span className="text-primary">86Connect</span>
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium mb-8 max-w-xl mx-auto lg:mx-0">
                  Your trusted partner for unlocking China&apos;s educational and economic opportunities. Serving clients across 50+ countries worldwide.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/book-consultation"
                    className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all cursor-pointer press"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <span>Book a Free Consultation</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/#contact"
                    className="inline-flex items-center gap-2 h-12 px-6 bg-white text-foreground rounded-2xl font-black text-sm border border-border hover:border-primary/30 transition-all cursor-pointer press"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-red-400/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white rounded-3xl border border-border/60 shadow-3d-xl p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center p-3">
                      <Image src="/favicon-86-connect-official.png" alt="86Connect" fill className="object-contain brightness-0 invert" sizes="64px" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-primary">
                        Since 2023
                      </div>
                      <div className="text-lg font-black text-foreground">
                        86Connect
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {DIFFERENTIATORS.map((item) => (
                      <div key={item.label} className={cn("p-4 rounded-xl border border-border/60", item.bgGradient)}>
                        <div className="flex items-center gap-2 mb-2">
                          <item.icon className="h-4 w-4 text-primary" />
                          <span className="text-xs font-black uppercase text-muted-foreground">{item.label}</span>
                        </div>
                        <div className="text-2xl font-black text-primary">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              <div className="bg-white rounded-2xl border border-border/80 shadow-soft-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center p-2 relative">
                    <Image src="/favicon-86-connect-official.png" alt="86Connect" fill className="object-contain brightness-0 invert" sizes="48px" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-primary">
                      Our Story
                    </div>
                    <div className="text-sm text-muted-foreground font-bold">
                      Incorporated November 2023
                    </div>
                  </div>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-[-0.035em] mb-4">
                  Bridging <span className="text-primary">China & the World</span>
                </h2>

                <p className="text-base text-foreground leading-relaxed mb-4 font-semibold">
                  <span className="font-black">86Connect</span> is the digital
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

                <p className="text-base text-muted-foreground leading-relaxed font-medium">
                  We provide a seamless online gateway for individuals and
                  businesses seeking to expand, source, or study in China. With a
                  strategic presence in West Africa, we connect overseas clients
                  with trusted Chinese suppliers and universities — ensuring smooth
                  end-to-end operations from sourcing to delivery, and from
                  application to enrollment.
                </p>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-2xl p-6 sm:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-white/90">
                    Our Mission & Vision
                  </div>
                </div>

                <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl mb-4 leading-tight text-white">
                  Simplifying Access to China&apos;s Opportunities
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="font-black text-white mb-2">Our Mission</h3>
                    <p className="text-sm text-white/95 leading-relaxed font-medium">
                      We exist to simplify access to China&apos;s educational and
                      economic opportunities. Whether you&apos;re a student seeking a
                      world-class education or a business looking to source quality
                      products, we provide the expertise, connections, and support you
                      need to succeed.
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-xl p-4">
                    <h3 className="font-black text-white mb-2">Our Vision</h3>
                    <p className="text-sm text-white/95 leading-relaxed font-medium">
                      To be the most trusted bridge between China and the world,
                      empowering individuals and businesses to achieve their goals
                      through exceptional service, transparency, and innovation.
                    </p>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href="/book-consultation"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-white text-red-500 rounded-xl font-black text-sm hover:bg-white/95 transition-all duration-200 cursor-pointer press shadow-soft-sm hover:shadow-soft-md"
                  >
                    <CalendarCheck className="h-4 w-4" />
                    <span>Book a Free Call</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-section-alt">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Our Value Proposition
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] mb-4">
                Our Core <span className="text-primary">Values</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                These values guide everything we do and define our commitment to excellence
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((value) => (
                <div key={value.title} className={cn("group rounded-2xl border border-border/80 shadow-soft-sm hover:shadow-soft-md hover:border-primary/25 transition-all duration-300 p-6", value.bgGradient)}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-red-500 flex items-center justify-center mb-4">
                    <value.icon className="h-6 w-6 text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-display font-black text-xl mb-2 tracking-[-0.02em] text-foreground">
                    {value.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Our Global Presence
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] mb-4">
                Serving <span className="text-primary">50+ Countries</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                From our headquarters in Beijing, we provide services to clients across Africa, Asia, Middle East, Europe, and Americas
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {["Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia", "India", "Pakistan", "Bangladesh", "Indonesia", "Philippines", "UAE", "Saudi Arabia", "UK", "USA", "Canada", "Australia", "Germany", "France"].map((country) => (
                <div key={country} className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/30 transition-colors">
                  <Globe className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm font-bold text-foreground">{country}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-red-500 to-red-700">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-[-0.035em] mb-4 text-white">
                Get in Touch
              </h2>
              <p className="text-lg text-white/90 leading-relaxed font-medium">
                We would love to hear from you and discuss how we can help
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-white mb-2">Address</h3>
                <p className="text-sm text-white/90 font-medium">Beijing, China</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-white mb-2">Phone</h3>
                <p className="text-sm text-white/90 font-medium">+86-138-0000-0000</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-black text-white mb-2">Email</h3>
                <p className="text-sm text-white/90 font-medium">info@the86connect.com</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 h-12 px-8 bg-white text-red-500 rounded-2xl font-black text-sm hover:bg-white/95 transition-all cursor-pointer press shadow-lg"
              >
                <CalendarCheck className="h-4 w-4" />
                <span>Schedule a Free Consultation</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 h-12 px-8 bg-white/20 text-white rounded-2xl font-black text-sm hover:bg-white/30 transition-all cursor-pointer press border border-white/30"
              >
                <Mail className="h-4 w-4" />
                <span>Send a Message</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}