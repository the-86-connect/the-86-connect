import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  Users,
  CheckCircle,
  Award,
  TrendingUp,
  Sparkles,
  Shield,
  Globe,
  Star,
  ArrowRight,
  Target,
  Heart,
  Zap,
  Search,
  FileText,
} from "lucide-react";
import { PageNavbar } from "@/components/layout/page-navbar";
import { Footer } from "@/components/layout/footer";
import { StudyApplicationForm } from "@/components/forms/study-application-form";
import { VideoGallery } from "@/components/sections/video-gallery";
import { Testimonials } from "@/components/sections/testimonials";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import {
  UniversitiesGrid,
  type University,
} from "@/components/sections/universities-grid";
import { fetchVideos } from "@/lib/api";
import { STUDY_TESTIMONIALS } from "@/data/testimonials";
import { FAQ_SECTIONS } from "@/data/faq";

export const metadata: Metadata = {
  title: "Study in China — Scholarships, Admissions & Guidance",
  description:
    "Apply to study in China with 86 Connect. Scholarship applications, university admissions, and end-to-end study abroad guidance. 200+ partner universities, 98% success rate.",
  alternates: { canonical: "/study-in-china" },
};

const SUB_LINKS = [
  { label: "Overview", target: "overview" },
  { label: "Services", target: "services" },
  { label: "Fees", target: "fees" },
  { label: "Universities", target: "universities" },
  { label: "Scholarships", target: "scholarships" },
  { label: "Requirements", target: "requirements" },
  { label: "FAQ", target: "faq" },
  { label: "Apply", target: "apply" },
];

const SERVICES = [
  {
    icon: GraduationCap,
    title: "Scholarship Applications",
    description:
      "Expert guidance through the complete scholarship application process, from document preparation to interview coaching.",
    features: [
      "Full & partial scholarship matching",
      "Application document review",
      "Interview preparation",
      "Deadline tracking",
    ],
    stat: "98%",
    statLabel: "Success rate",
  },
  {
    icon: BookOpen,
    title: "University Admissions",
    description:
      "Comprehensive support for university selection and application, ensuring you find the right program and institution.",
    features: [
      "Personalized university matching",
      "Application strategy & essay support",
      "Document authentication (JW202)",
      "Pre-departure orientation",
    ],
    stat: "200+",
    statLabel: "Partner universities",
  },
  {
    icon: Users,
    title: "Study Abroad Guidance",
    description:
      "End-to-end support for your entire study abroad journey, from planning to arrival and beyond.",
    features: [
      "Visa application assistance",
      "Accommodation arrangements",
      "Airport pickup coordination",
      "Ongoing local support in China",
    ],
    stat: "24/7",
    statLabel: "Local support",
  },
];

const UNIVERSITIES: University[] = [
  // Top-Tier (Highly Competitive)
  {
    name: "Zhejiang University",
    location: "Hangzhou",
    rank: "Top-Tier",
    programs: "Engineering, CS, Agriculture",
    scholarship: "Full + Partial",
    tier: "top",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Hangzhou_Zhijiang_Daxue_20120518-25.jpg/960px-Hangzhou_Zhijiang_Daxue_20120518-25.jpg",
  },
  {
    name: "Shanghai Jiao Tong University",
    location: "Shanghai",
    rank: "Top-Tier",
    programs: "Engineering, Medicine, Business",
    scholarship: "Full + Partial",
    tier: "top",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Shanghai_Jiao_Tong_University_Xuhui_campus.jpg/960px-Shanghai_Jiao_Tong_University_Xuhui_campus.jpg",
  },
  {
    name: "Fudan University",
    location: "Shanghai",
    rank: "Top-Tier",
    programs: "Business, Medicine, Sciences",
    scholarship: "Full + Partial",
    tier: "top",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/201704_Gate_of_Fudan_University_Jiangwan_Campus.jpg/960px-201704_Gate_of_Fudan_University_Jiangwan_Campus.jpg",
  },
  {
    name: "Nanjing University",
    location: "Nanjing",
    rank: "Top-Tier",
    programs: "Sciences, Humanities, Business",
    scholarship: "Full + Partial",
    tier: "top",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Main_Gate_of_Nanjing_University_Gulou_Campus_2012-11.JPG/960px-Main_Gate_of_Nanjing_University_Gulou_Campus_2012-11.JPG",
  },
  {
    name: "Wuhan University",
    location: "Wuhan",
    rank: "Top-Tier",
    programs: "Law, Sciences, Humanities",
    scholarship: "Full + Partial",
    tier: "top",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Gate_of_the_Wuhan_University.jpg/960px-Gate_of_the_Wuhan_University.jpg",
  },
  {
    name: "Tongji University",
    location: "Shanghai",
    rank: "Top-Tier",
    programs: "Engineering, Architecture, Medicine",
    scholarship: "Partial",
    tier: "top",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Tongji_University_Multi-functional_Building_and_its_reflection.jpg/960px-Tongji_University_Multi-functional_Building_and_its_reflection.jpg",
  },
  // Mid-Tier (Higher Admission & Scholarship Chances)
  {
    name: "East China Normal University",
    location: "Shanghai",
    rank: "Mid-Tier",
    programs: "Education, Sciences, Business",
    scholarship: "Full + Partial",
    tier: "mid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/East_China_Normal_University_-_Minhang_campus_1.jpg/960px-East_China_Normal_University_-_Minhang_campus_1.jpg",
  },
  {
    name: "Beijing Language & Culture University",
    location: "Beijing",
    rank: "Mid-Tier",
    programs: "Language, Culture, Education",
    scholarship: "Full + Partial",
    tier: "mid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/South_gate_of_BLCU_%2820230206132105%29.jpg/960px-South_gate_of_BLCU_%2820230206132105%29.jpg",
  },
  {
    name: "UIBE",
    location: "Beijing",
    rank: "Mid-Tier",
    programs: "Business, Economics, Trade",
    scholarship: "Full + Partial",
    tier: "mid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/South_gate_of_UIBE_%2820230215153342%29.jpg/960px-South_gate_of_UIBE_%2820230215153342%29.jpg",
  },
  {
    name: "Nanjing Medical University",
    location: "Nanjing",
    rank: "Mid-Tier",
    programs: "Medicine, Pharmacy, Public Health",
    scholarship: "Partial",
    tier: "mid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/201704_Nanjing_Medical_University_Sir_Run_Run_Hospital.jpg/960px-201704_Nanjing_Medical_University_Sir_Run_Run_Hospital.jpg",
  },
  {
    name: "Jiangsu University",
    location: "Zhenjiang",
    rank: "Mid-Tier",
    programs: "Engineering, Agriculture, Medicine",
    scholarship: "Full + Partial",
    tier: "mid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Jiangsu_University_Mengxi_Campus_2013-04.JPG/960px-Jiangsu_University_Mengxi_Campus_2013-04.JPG",
  },
  {
    name: "Zhejiang Normal University",
    location: "Jinhua",
    rank: "Mid-Tier",
    programs: "Education, Sciences, Arts",
    scholarship: "Full + Partial",
    tier: "mid",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Zhejiang_Normal_University_%28228082775%29.jpg/960px-Zhejiang_Normal_University_%28228082775%29.jpg",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Free Consultation",
    description:
      "We assess your goals, academic background, and budget to recommend the best path forward.",
  },
  {
    step: "02",
    title: "University Matching",
    description:
      "We shortlist universities and programs that match your profile and scholarship eligibility.",
  },
  {
    step: "03",
    title: "Application & Documents",
    description:
      "We help prepare, review, and submit your applications with all required documentation.",
  },
  {
    step: "04",
    title: "Visa & Departure",
    description:
      "Once accepted, we guide you through visa, accommodation, and pre-departure orientation.",
  },
];

const FEES = [
  {
    name: "Application Fee",
    price: "$750",
    priceNote: "Non-refundable",
    description: "Covers application to up to 5 universities",
    features: [
      "Up to 5 university applications",
      "Document review & submission",
      "Application tracking",
      "University communication",
    ],
    highlight: false,
  },
  {
    name: "Service / Project Fee",
    price: "$2,500–$3,500",
    priceNote: "Paid after admission secured",
    description: "Paid after JW202 issuance and original admission letter",
    features: [
      "Full advisory & placement service",
      "Scholarship maximization strategy",
      "University negotiation & follow-up",
      "Visa documentation support",
    ],
    highlight: true,
  },
  {
    name: "Supplementary Services",
    price: "$1,500",
    priceNote: "Optional",
    description: "Relocation & settlement support upon arrival",
    features: [
      "Airport pickup",
      "Accommodation check-in assistance",
      "Bank account setup",
      "SIM card registration",
      "Medical check (if required)",
      "School registration assistance",
    ],
    highlight: false,
  },
];

const SCHOLARSHIP_TYPES = [
  {
    type: "A",
    title: "Full Scholarship + Stipend",
    coverage: "Tuition + Accommodation + Monthly Stipend",
    color: "bg-green-50 text-green-700 border-green-200",
    description:
      "The most comprehensive scholarship covering all major costs plus a monthly living stipend.",
  },
  {
    type: "B",
    title: "Full Scholarship",
    coverage: "Tuition + Accommodation",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Covers both tuition fees and on-campus accommodation.",
  },
  {
    type: "C",
    title: "Tuition Scholarship",
    coverage: "Tuition Only",
    color: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Covers tuition fees. Student handles accommodation and living expenses.",
  },
  {
    type: "D",
    title: "Partial Scholarship",
    coverage: "Varies",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Partial coverage that varies by university and program.",
  },
  {
    type: "E",
    title: "First-Year Scholarship",
    coverage: "Tuition (First Year Only)",
    color: "bg-rose-50 text-rose-700 border-rose-200",
    description:
      "Tuition covered for the first year. Student funds subsequent years.",
  },
];

const REQUIREMENTS = [
  "Passport-sized photograph",
  "Passport ID page (copy)",
  "Academic transcripts (scanned color copy)",
  "Highest degree certificate/diploma (scanned color copy)",
  "Foreigner Physical Examination Form (provided by our agency)",
  "Non-criminal record certificate",
  "English proficiency (IELTS >= 5.0 or equivalent, or Duolingo where applicable)",
  "Completed university application form (provided after program selection)",
  "Guarantee letter (for applicants under 18)",
  "Additional documents if required by specific universities",
];

const DETAILED_PROCESS = [
  {
    step: "01",
    title: "Initial Consultation",
    description:
      "Meet with our team to assess your goals, academic background, and budget.",
  },
  {
    step: "02",
    title: "Program Selection",
    description:
      "Select your preferred program and/or university from our partner network.",
  },
  {
    step: "03",
    title: "Document Submission",
    description: "Submit all required documents for review and preparation.",
  },
  {
    step: "04",
    title: "Application Fee",
    description:
      "Pay the $750 application fee to begin processing up to 5 applications.",
  },
  {
    step: "05",
    title: "University Review",
    description: "Universities review and process your application.",
  },
  {
    step: "06",
    title: "Pre-Admission Results",
    description: "Receive pre-admission decisions from applied universities.",
  },
  {
    step: "07",
    title: "Service Fee Payment",
    description: "Pay the service/project fee ($2,500-$3,500) to proceed.",
  },
  {
    step: "08",
    title: "Admission Letter & JW202",
    description:
      "Receive your official Admission Letter and JW202 immigration document.",
  },
  {
    step: "09",
    title: "Visa Application",
    description: "Apply for your student visa with our documentation support.",
  },
];

const STUDENT_NOTES = [
  {
    icon: "\ud83d\udcb0",
    title: "Cost of Living",
    description:
      "Generally lower than Europe and the US. Utilities and daily expenses are affordable. Costs vary depending on city and institution.",
  },
  {
    icon: "\ud83d\udcca",
    title: "Economic Stability",
    description:
      "China has a stable economy with prices of everyday goods remaining relatively stable over time.",
  },
  {
    icon: "\ud83d\udcbc",
    title: "Working While Studying",
    description:
      "International students are not allowed to freely work. Limited work/internship opportunities may be available depending on university policies.",
  },
  {
    icon: "\ud83d\udee1\ufe0f",
    title: "Safety & Student Life",
    description:
      "China is considered very safe with advanced infrastructure and campus facilities. Exposure to international academic environments.",
  },
  {
    icon: "\ud83d\udce3\ufe0f",
    title: "Language",
    description:
      "Learning Chinese (Mandarin) is strongly recommended for daily life, integration, and future opportunities.",
  },
];

export default async function StudyInChinaPage() {
  const videos = await fetchVideos("study");
  return (
    <>
      <PageNavbar
        accent="Study"
        subLinks={SUB_LINKS}
        ctaLabel="Apply Now"
        ctaTarget="apply"
        trackHref="/study-in-china/track-application"
      />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left content */}
              <div className="lg:col-span-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-5">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-primary">
                    Premium Education Service
                  </span>
                </div>
                <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-[-0.035em] mb-5 leading-[1.05]">
                  Study in <span className="text-primary">China</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl font-medium">
                  Your gateway to China&apos;s top universities. We handle
                  scholarships, admissions, visas, and ongoing support — so you
                  can focus on your education.
                </p>
                <div className="flex flex-col gap-3 w-full sm:flex-row sm:flex-wrap sm:gap-3 sm:w-auto">
                  <a
                    href="#apply"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 sm:px-6 h-12 sm:h-14 sm:w-auto bg-primary text-white rounded-xl sm:rounded-lg font-black text-sm sm:text-base shadow-red hover:bg-red-700 transition-all duration-200 cursor-pointer press"
                  >
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>Start Application</span>
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                  </a>
                  <a
                    href="#universities"
                    className="inline-flex items-center justify-center gap-2 w-full px-5 sm:px-6 h-12 sm:h-14 sm:w-auto bg-slate-900 text-white rounded-xl sm:rounded-lg font-black text-sm sm:text-base border border-slate-900 hover:bg-slate-800 hover:border-slate-800 transition-all duration-200 cursor-pointer press shadow-md"
                  >
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    <span>View Universities</span>
                  </a>
                  <Link
                    href="/study-in-china/track-application"
                    className="inline-flex items-center justify-center gap-2 w-full px-4 sm:px-5 h-12 sm:h-12 sm:w-auto bg-primary/5 text-primary rounded-xl font-black text-sm sm:text-sm border-2 border-primary/20 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200 cursor-pointer press"
                  >
                    <Search className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
                    <span>Track your application</span>
                    <ArrowRight className="h-4 w-4 sm:h-4 sm:w-4 shrink-0" />
                  </Link>
                </div>
              </div>

              {/* Right — campus image collage */}
              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 grid-rows-2 gap-3 sm:gap-4 h-72 sm:h-80 lg:h-[26rem] max-w-md sm:max-w-lg mx-auto lg:max-w-none">
                  {/* Large image — spans 2 rows */}
                  <div className="row-span-2 relative rounded-2xl overflow-hidden border border-border shadow-soft-sm bg-muted">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tsinghua%20University%20Beijing%20campus%20grand%20entrance%20gate%20traditional%20Chinese%20architecture%20autumn%20golden%20trees%20students%20walking%20photorealistic%20high%20quality&image_size=portrait_4_3"
                      alt="Tsinghua University campus entrance in Beijing"
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white font-black text-sm">
                        Tsinghua University
                      </p>
                      <p className="text-white/80 text-xs font-medium">
                        Beijing, China
                      </p>
                    </div>
                  </div>

                  {/* Top right image */}
                  <div className="relative rounded-2xl overflow-hidden border border-border shadow-soft-sm bg-muted">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20university%20students%20walking%20on%20campus%20modern%20buildings%20cherry%20blossom%20spring%20photorealistic%20high%20quality&image_size=square"
                      alt="International students on a Chinese university campus"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white font-black text-xs">
                        Campus Life
                      </p>
                    </div>
                  </div>

                  {/* Bottom right image */}
                  <div className="relative rounded-2xl overflow-hidden border border-border shadow-soft-sm bg-muted">
                    <img
                      src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20Chinese%20university%20library%20building%20glass%20facade%20blue%20sky%20photorealistic%20high%20quality&image_size=square"
                      alt="Modern Chinese university library building"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-white font-black text-xs">
                        Modern Facilities
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
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Why Choose Us
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                A Record of <span className="text-primary">Success</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Since 2023, we&apos;ve helped students from 30+ countries
                achieve their dream of studying in China.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-16">
              <MetricCard
                icon={TrendingUp}
                value="500+"
                label="Students placed"
              />
              <MetricCard icon={Award} value="98%" label="Acceptance rate" />
              <MetricCard icon={Globe} value="30+" label="Countries served" />
              <MetricCard
                icon={Shield}
                value="200+"
                label="Partner universities"
              />
            </div>

            {/* Process steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {PROCESS_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="bg-white rounded-2xl border border-border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 p-5 sm:p-6"
                >
                  <div className="text-3xl font-black text-primary mb-3">
                    {step.step}
                  </div>
                  <h3 className="font-display font-black text-lg mb-2 tracking-[-0.035em]">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  What We Do
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                Our <span className="text-primary">Services</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Complete support from scholarship applications to arriving in
                China.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {SERVICES.map((service) => (
                <ServiceCard key={service.title} service={service} />
              ))}
            </div>
          </div>
        </section>

        {/* Fees & Pricing */}
        <section
          id="fees"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Transparent Pricing
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                Fees & <span className="text-primary">Pricing</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Clear, upfront fees with no hidden costs. University fees
                (tuition, accommodation, insurance) are separate from our
                service fees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mb-8">
              {FEES.map((fee) => (
                <div
                  key={fee.name}
                  className={`bg-white rounded-2xl border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 p-6 sm:p-7 relative ${fee.highlight ? "border-primary shadow-soft-md" : "border-border"}`}
                >
                  {fee.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                      Core Service
                    </div>
                  )}
                  <h3 className="font-display font-black text-lg sm:text-xl mb-2 tracking-[-0.035em]">
                    {fee.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-3xl sm:text-4xl font-black text-primary">
                      {fee.price}
                    </span>
                    <span className="text-sm text-muted-foreground font-semibold ml-2">
                      {fee.priceNote}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 font-medium">
                    {fee.description}
                  </p>
                  <ul className="space-y-2">
                    {fee.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-sm text-foreground font-medium"
                      >
                        <CheckCircle
                          className="h-4 w-4 text-primary shrink-0 mt-0.5"
                          strokeWidth={3}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto">
              <p className="text-sm text-amber-900 leading-relaxed font-medium">
                <strong className="font-black">Refund Policy:</strong>{" "}
                Application fee is non-refundable under all circumstances.
                Service fee is generally non-refundable; in limited cases where
                a student cannot be admitted upon arrival, partial refunds may
                be considered. No refund if issues arise due to the student's
                actions or negligence.
              </p>
            </div>

            <div className="text-center mt-8">
              <a
                href="/pdfs/Scholarship_Advisory_Detailed.pdf"
                download
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 sm:px-6 h-12 bg-primary text-white rounded-lg font-black text-sm shadow-red hover:bg-red-700 transition-all duration-200 cursor-pointer press"
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>Download Full Guide (PDF)</span>
              </a>
            </div>
          </div>
        </section>

        {/* Universities */}
        <section
          id="universities"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-24"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Star className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Partner Universities
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                Top <span className="text-primary">Universities</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                We partner with China&apos;s most prestigious universities
                across all major fields of study.
              </p>
            </div>

            <UniversitiesGrid universities={UNIVERSITIES} />
          </div>
        </section>

        {/* Scholarship Types */}
        <section
          id="scholarships"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Award className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Scholarship Options
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                Types of <span className="text-primary">Scholarships</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Scholarship outcomes depend on academic performance, CSCA
                results, and overall application strength.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {SCHOLARSHIP_TYPES.map((sch) => (
                <div
                  key={sch.type}
                  className="bg-white rounded-2xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 p-5 sm:p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg border ${sch.color}`}
                    >
                      {sch.type}
                    </div>
                    <h3 className="font-display font-black text-base sm:text-lg leading-tight tracking-[-0.035em]">
                      {sch.title}
                    </h3>
                  </div>
                  <div className="text-xs font-black uppercase tracking-wider text-primary mb-2">
                    {sch.coverage}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                    {sch.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5 sm:p-6 max-w-3xl mx-auto">
              <h4 className="font-black text-sm text-blue-900 mb-2 flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                CSCA Entrance Examination
              </h4>
              <p className="text-sm text-blue-900 leading-relaxed font-medium">
                For undergraduate (bachelor's degree) applicants, the China
                Scholastic Competency Assessment (CSCA) is a mandatory
                standardized entrance examination. Subjects depend on the
                intended course of study. Strong performance significantly
                improves scholarship chances.
              </p>
            </div>
          </div>
        </section>

        {/* Video Gallery */}
        <VideoGallery
          videos={videos}
          title={
            <>
              Watch Our <span className="text-primary">Study in China</span>{" "}
              Stories
            </>
          }
          subtitle="See real experiences from international students studying in China through 86 Connect."
        />

        {/* Testimonials */}
        <Testimonials
          testimonials={STUDY_TESTIMONIALS}
          variant="study"
          title={
            <>
              Student <span className="text-primary">Success Stories</span>
            </>
          }
          subtitle="Hear from international students who achieved their dreams of studying in China with our support."
        />

        {/* Requirements & Process */}
        <section
          id="requirements"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-muted/30 scroll-mt-24"
        >
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <BookOpen className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Get Prepared
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                Requirements & <span className="text-primary">Process</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Everything you need to prepare and the steps from consultation
                to enrollment.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {/* Requirements */}
              <div className="bg-white rounded-2xl border border-border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 p-6 sm:p-7">
                <h3 className="font-display font-black text-xl mb-4 tracking-[-0.035em]">
                  Document Checklist
                </h3>
                <ul className="space-y-2.5">
                  {REQUIREMENTS.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-foreground font-medium"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-primary shrink-0 mt-0.5"
                        strokeWidth={3}
                      />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Process */}
              <div className="bg-white rounded-2xl border border-border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 p-6 sm:p-7">
                <h3 className="font-display font-black text-xl mb-4 tracking-[-0.035em]">
                  Application Process
                </h3>
                <ol className="space-y-3">
                  {DETAILED_PROCESS.map((step) => (
                    <li key={step.step} className="flex items-start gap-3">
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-sm text-primary">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-black text-sm text-foreground">
                          {step.title}
                        </div>
                        <div className="text-xs text-muted-foreground leading-relaxed font-medium">
                          {step.description}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Student Life Notes */}
            <div className="mt-8">
              <h3 className="font-display font-black text-xl text-center mb-6 tracking-[-0.035em]">
                Living in China
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {STUDENT_NOTES.map((note) => (
                  <div
                    key={note.title}
                    className="bg-white rounded-2xl border border-border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 p-5"
                  >
                    <div className="text-2xl mb-2">{note.icon}</div>
                    <h4 className="font-black text-sm mb-1.5">{note.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {note.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Apply */}
        <section
          id="apply"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-10 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 border border-primary/15 mb-4">
                <Target className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  Get Started
                </span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.035em] mb-4 leading-[1.05]">
                Apply to <span className="text-primary">Study in China</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                Fill out the application below and our team will contact you
                within 2-3 business days.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-border shadow-soft-md p-6 sm:p-8 lg:p-10">
              <StudyApplicationForm />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-white scroll-mt-24"
        >
          <div className="container mx-auto max-w-3xl">
            <FAQAccordion
              sections={FAQ_SECTIONS.slice(0, 2)}
              title={
                <>
                  Frequently Asked{" "}
                  <span className="text-primary">Questions</span>
                </>
              }
              ctaText="View All FAQs"
              ctaHref="/faq"
              ctaSubtext="Have more questions? Browse our complete FAQ."
            />
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
    <div className="text-center p-5 sm:p-7 rounded-2xl bg-white border border-border shadow-soft-sm hover:shadow-soft-md transition-all duration-200">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
      </div>
      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-1 sm:mb-2 leading-none">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground font-semibold">
        {label}
      </div>
    </div>
  );
}

function ServiceCard({ service }: { service: (typeof SERVICES)[number] }) {
  const Icon = service.icon;
  return (
    <div className="bg-white rounded-2xl border border-border shadow-soft-sm hover:shadow-soft-md hover:border-primary/30 transition-all duration-200 p-6 sm:p-7">
      <div className="flex items-center justify-between mb-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center">
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
      <h3 className="font-display font-black text-xl sm:text-2xl text-foreground mb-2.5 tracking-[-0.035em]">
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
