import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  Truck,
  BarChart3,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  ArrowRight,
  Target,
  Package,
  Factory,
  Ship,
  PackageCheck,
  Star,
  Layers,
  Calculator,
  Tag,
  Warehouse,
  Percent,
  Eye,
  Scale,
  FileText,
} from "lucide-react";
import { PageNavbar } from "@/components/layout/page-navbar";
import { Footer } from "@/components/layout/footer";
import { SourcingInquiryForm } from "@/components/forms/sourcing-inquiry-form";
import { VideoGallery } from "@/components/sections/video-gallery";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { fetchVideos } from "@/lib/api";
import { SOURCING_TESTIMONIALS } from "@/data/testimonials";
import { FAQ_SECTIONS } from "@/data/faq";

export const metadata: Metadata = {
  title: "Product Sourcing from China — Suppliers, Procurement & Logistics",
  description:
    "Source quality products from China with 86 Connect. Supplier finding, procurement management, and logistics support. 50,000+ verified suppliers, 150+ countries shipped.",
  alternates: { canonical: "/product-sourcing" },
};

const SUB_LINKS = [
  { label: "Overview", target: "overview" },
  { label: "Services", target: "services" },
  { label: "Models", target: "models" },
  { label: "Process", target: "process" },
  { label: "Costs", target: "costs" },
  { label: "FAQ", target: "faq" },
  { label: "Inquire", target: "inquire" },
];

const SERVICES = [
  {
    icon: Search,
    title: "Supplier Finding",
    description:
      "We identify and vet reliable Chinese manufacturers and suppliers that match your product requirements and quality standards.",
    features: [
      "Supplier database with 50,000+ verified factories",
      "Factory audits & quality inspections",
      "Sample procurement & evaluation",
      "Negotiation support",
    ],
    stat: "50K+",
    statLabel: "Verified suppliers",
  },
  {
    icon: BarChart3,
    title: "Procurement Assistance",
    description:
      "End-to-end procurement management from order placement to quality control, ensuring smooth transactions at every stage.",
    features: [
      "Order management & tracking",
      "Quality control inspections",
      "Payment facilitation & escrow",
      "Production timeline monitoring",
    ],
    stat: "100%",
    statLabel: "QC inspected",
  },
  {
    icon: Truck,
    title: "Logistics Support",
    description:
      "Complete shipping and logistics solutions to get your products from Chinese factories to your doorstep efficiently.",
    features: [
      "Freight forwarding (air, sea, rail)",
      "Customs clearance & documentation",
      "Warehousing & consolidation",
      "Door-to-door delivery worldwide",
    ],
    stat: "150+",
    statLabel: "Countries shipped",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    icon: Target,
    title: "Requirements",
    description:
      "Share your product specs, quantity, target price, and timeline. We document every detail.",
  },
  {
    step: "02",
    icon: Search,
    title: "Supplier Sourcing",
    description:
      "We identify 3-5 verified suppliers, negotiate pricing, and arrange samples for evaluation.",
  },
  {
    step: "03",
    icon: Factory,
    title: "Production & QC",
    description:
      "We monitor production, conduct quality inspections, and ensure specifications are met.",
  },
  {
    step: "04",
    icon: Ship,
    title: "Shipping & Delivery",
    description:
      "We handle freight forwarding, customs clearance, and door-to-door delivery to your location.",
  },
];

const CATEGORIES = [
  "Electronics & Gadgets",
  "Textiles & Apparel",
  "Machinery & Equipment",
  "Home & Garden",
  "Auto Parts",
  "Beauty & Personal Care",
  "Sports & Outdoor",
  "Industrial Supplies",
];

const SERVICE_MODELS = [
  {
    icon: Layers,
    title: "Partial-Service Support",
    subtitle: "For clients with existing suppliers",
    description:
      "Some clients already have their own suppliers and handle their own payments directly. In such cases, we provide targeted support services.",
    features: [
      "Factory and production inspections",
      "Quality assurance and compliance verification",
      "Logistics coordination to destinations such as Ghana, Nigeria, and other international markets",
      "Supplier banking details provided after quotation approval",
    ],
    note: "Clients pay suppliers directly to reduce overall tax burden. We continue to oversee the entire process from coordination to delivery.",
  },
  {
    icon: Package,
    title: "Full-Service Support",
    subtitle: "Complete project management",
    description:
      "Other clients prefer a complete project management solution, where Beijing BridgePath oversees every stage of the process.",
    features: [
      "Identifying and verifying reliable suppliers",
      "Inspecting production and ensuring quality standards",
      "Coordinating procurement and packaging",
      "Managing international logistics and customs clearance at the destination port",
    ],
    note: "Payments handled through Beijing BridgePath's corporate account in China, ensuring transparency, tax compliance, and legal accountability. Every transaction governed by a formal contract.",
  },
];

const COST_INFO = [
  {
    icon: Calculator,
    title: "CBM Calculation",
    description:
      "Once all goods have been received and verified at the warehouse, the total CBM (Cubic Meter) is calculated to determine the shipping cost.",
  },
  {
    icon: Tag,
    title: "Flat-Rate Shipping",
    description:
      "Clients are billed based on a flat rate (duty inclusive), ensuring there are no hidden fees or unexpected charges.",
  },
  {
    icon: Warehouse,
    title: "Warehouse & Delivery",
    description:
      "We coordinate pickup or delivery once goods arrive and are cleared at the destination port. Delivery fee after local warehouse is subject to real-time market conditions.",
  },
  {
    icon: Percent,
    title: "Revenue Model",
    description:
      "We charge a percentage-based consulting and handling fee covering supplier coordination, quality inspection, project management, and logistics supervision.",
  },
];

const VALUE_PROPS = [
  {
    icon: Eye,
    title: "Transparency",
    description:
      "Flat-rate pricing, full disclosure of costs, and clear contracts.",
  },
  {
    icon: Scale,
    title: "Accountability",
    description:
      "Payments handled through a registered corporate account in China.",
  },
  {
    icon: Layers,
    title: "Flexibility",
    description: "Choose between full-service or partial-service arrangements.",
  },
  {
    icon: Truck,
    title: "Efficiency",
    description: "Consolidated logistics management reduces delays and costs.",
  },
];

export default async function ProductSourcingPage() {
  const videos = await fetchVideos("sourcing");
  return (
    <>
      <PageNavbar
        accent="Sourcing"
        subLinks={SUB_LINKS}
        ctaLabel="Get Quote"
        ctaTarget="inquire"
        trackHref="/product-sourcing/track-quote"
      />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left content */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-5">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Premium Sourcing Service
                  </span>
                </div>
                <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.04em] mb-5 leading-[1.05]">
                  Product <span className="text-primary">Sourcing</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl font-medium">
                  Source quality products from China&apos;s verified
                  manufacturers. We handle supplier finding, procurement,
                  quality control, and logistics — end to end.
                </p>
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  <a
                    href="#inquire"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 h-12 sm:h-14 bg-primary text-white rounded-2xl font-black text-sm sm:text-base shadow-red hover:bg-red-700 transition-all duration-200 cursor-pointer press"
                  >
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>Get a Quote</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  </a>
                  <a
                    href="#services"
                    className="inline-flex items-center gap-2 px-5 sm:px-6 h-12 sm:h-14 bg-white text-foreground rounded-2xl font-black text-sm sm:text-base border border-border hover:border-primary/30 transition-all duration-200 cursor-pointer press"
                  >
                    <Package className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>Our Services</span>
                  </a>
                </div>
                <Link
                  href="/product-sourcing/track-quote"
                  className="inline-flex items-center gap-2 mt-4 px-4 sm:px-5 h-10 sm:h-12 bg-primary/5 text-primary rounded-xl font-black text-xs sm:text-sm border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 cursor-pointer press"
                >
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span>Track your quote</span>
                  <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                </Link>
              </div>

              {/* Right — sourcing image collage */}
              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 h-72 sm:h-80 lg:h-[26rem] max-w-md sm:max-w-lg mx-auto lg:max-w-none">
                  {/* Large image — spans 2 rows */}
                  <div className="row-span-2 relative rounded-3xl overflow-hidden border border-border shadow-soft-md bg-muted">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=large%20Chinese%20manufacturing%20factory%20warehouse%20workers%20in%20uniform%20assembly%20line%20modern%20industrial%20photorealistic%20high%20quality&image_size=portrait_4_3"
                      alt="Modern Chinese manufacturing factory with assembly line"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white font-black text-sm">
                        Verified Factories
                      </p>
                      <p className="text-white/80 text-xs font-medium">
                        50,000+ suppliers
                      </p>
                    </div>
                  </div>

                  {/* Top right image */}
                  <div className="relative rounded-3xl overflow-hidden border border-border shadow-soft-md bg-muted">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shipping%20containers%20cargo%20port%20cranes%20stacked%20logistics%20China%20export%20photorealistic%20high%20quality&image_size=square"
                      alt="Shipping containers and cargo at a Chinese export port"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white font-black text-xs">
                        Global Logistics
                      </p>
                    </div>
                  </div>

                  {/* Bottom right image */}
                  <div className="relative rounded-3xl overflow-hidden border border-border shadow-soft-md bg-muted">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=quality%20control%20inspection%20electronics%20products%20factory%20worker%20checking%20goods%20magnifier%20photorealistic%20high%20quality&image_size=square"
                      alt="Quality control inspection of manufactured products"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white font-black text-xs">
                        Quality Control
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overview */}
        <section
          id="overview"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Star className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Why Choose Us
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                Trusted by <span className="text-primary">Businesses</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                We&apos;ve helped companies worldwide source products reliably
                and cost-effectively from China.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-16">
              <MetricCard
                icon={Shield}
                value="50K+"
                label="Verified suppliers"
              />
              <MetricCard icon={Globe} value="150+" label="Countries shipped" />
              <MetricCard
                icon={TrendingUp}
                value="$50M+"
                label="Trade volume"
              />
              <MetricCard icon={Zap} value="24/7" label="Live tracking" />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-3xl border border-border shadow-soft-sm p-6 sm:p-8">
              <h3 className="font-display font-black text-xl sm:text-2xl mb-4 text-center">
                Categories We Source
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CATEGORIES.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <PackageCheck className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      {cat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  What We Do
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                From finding the right supplier to delivering to your door.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {SERVICES.map((service) => (
                <ServiceCard key={service.title} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* Service Models */}
        <section
          id="models"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Flexible Engagement
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                Service <span className="text-primary">Models</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Choose the level of support that fits your needs — from targeted
                assistance to complete project management.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              {SERVICE_MODELS.map((model) => {
                const Icon = model.icon;
                return (
                  <div
                    key={model.title}
                    className="bg-white rounded-3xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 p-6 sm:p-7"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary flex items-center justify-center">
                        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-lg sm:text-xl">
                          {model.title}
                        </h3>
                        <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                          {model.subtitle}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
                      {model.description}
                    </p>
                    <ul className="space-y-2.5 mb-4">
                      {model.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm text-foreground font-medium"
                        >
                          <CheckCircle
                            className="h-4 w-4 text-primary shrink-0 mt-0.5"
                            strokeWidth={3}
                          />
                          <span className="leading-relaxed">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {model.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Process */}
        <section
          id="process"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  How It Works
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                The <span className="text-primary">Process</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                A clear, transparent process from inquiry to delivery.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {PROCESS_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="relative bg-white rounded-3xl border-2 border-primary/20 shadow-soft-md hover:shadow-soft-lg hover:border-primary/50 transition-all duration-200 p-7 sm:p-8 overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div className="absolute top-0 inset-x-0 h-2 bg-primary" />

                    <div className="flex items-center justify-between mb-5 mt-1">
                      <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-red">
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div className="text-5xl font-black text-primary">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="font-display font-black text-xl mb-2">
                      {step.title}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How Costs Work */}
        <section
          id="costs"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Tag className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Transparent Pricing
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                How <span className="text-primary">Costs Work</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                No hidden fees. We calculate costs transparently and bill based
                on a flat rate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10">
              {COST_INFO.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="bg-white rounded-3xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 p-5 sm:p-6"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>
                    <h3 className="font-display font-black text-base sm:text-lg mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Value Proposition */}
            <div className="bg-muted/30 rounded-3xl p-6 sm:p-8">
              <h3 className="font-display font-black text-xl sm:text-2xl text-center mb-6">
                Our Value <span className="text-primary">Proposition</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VALUE_PROPS.map((vp) => {
                  const Icon = vp.icon;
                  return (
                    <div key={vp.title} className="text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                      </div>
                      <h4 className="font-black text-sm mb-1">{vp.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                        {vp.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center mt-8">
              <a
                href="/pdfs/company+profile.pdf"
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 sm:px-6 h-12 bg-primary text-white rounded-2xl font-black text-sm shadow-red hover:bg-red-700 transition-all duration-200 cursor-pointer press"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>Download Company Profile (PDF)</span>
              </a>
            </div>
          </div>
        </section>

        {/* Video Gallery */}
        <VideoGallery
          videos={videos}
          title={
            <>
              Watch Our <span className="text-primary">Sourcing</span> in Action
            </>
          }
          subtitle="See how we help businesses source quality products from verified Chinese suppliers."
        />

        {/* Testimonials */}
        <Testimonials
          testimonials={SOURCING_TESTIMONIALS}
          variant="sourcing"
          title={
            <>
              Trusted by <span className="text-primary">Global Businesses</span>
            </>
          }
          subtitle="See how companies around the world have transformed their sourcing with 86 Connect."
        />

        {/* FAQ */}
        <section
          id="faq"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-3xl">
            <FAQAccordion
              sections={FAQ_SECTIONS.slice(2, 4)}
              title={
                <>
                  Sourcing <span className="text-primary">FAQ</span>
                </>
              }
              ctaText="View All FAQs"
              ctaHref="/faq"
              ctaSubtext="Have more questions? Browse our complete FAQ."
            />
          </div>
        </section>

        {/* Inquire */}
        <section
          id="inquire"
          className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Start Sourcing
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] mb-4 leading-[1.05]">
                Submit an <span className="text-primary">Inquiry</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Tell us what you need to source. Our team will contact you
                within 1-2 business days.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-border shadow-soft-md p-6 sm:p-8 lg:p-10">
              <SourcingInquiryForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ============== Helper Components ============== */
function MetricCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center p-5 sm:p-7 rounded-3xl bg-white border border-border shadow-soft-sm">
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

function ServiceCard({ service }: { service: (typeof SERVICES)[number] }) {
  const Icon = service.icon;
  return (
    <div className="bg-white rounded-3xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary flex items-center justify-center">
          <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
        </div>
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-black text-primary leading-none">
            {service.stat}
          </div>
          <div className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mt-0.5">
            {service.statLabel}
          </div>
        </div>
      </div>
      <h3 className="font-display font-black text-xl sm:text-2xl text-foreground mb-2.5">
        {service.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 font-medium">
        {service.description}
      </p>
      <ul className="space-y-2.5">
        {service.features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2.5 text-sm text-foreground font-medium"
          >
            <CheckCircle
              className="h-4 w-4 text-primary shrink-0"
              strokeWidth={3}
            />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
