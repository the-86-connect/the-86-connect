import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceSchema, HomepageFAQSchema } from "@/components/seo/structured-data";
import { HeroSection } from "@/components/sections/hero";
import { ByTheNumbersSection } from "@/components/sections/by-the-numbers";
import { StudyInChinaSection } from "@/components/sections/study-in-china";
import { ProductSourcingSection } from "@/components/sections/product-sourcing";
import { ShippingMethodsSection } from "@/components/sections/shipping-methods";
import { VideoGallery } from "@/components/sections/video-gallery";
import { AboutUsSection } from "@/components/sections/about-us";
import { ContactSection } from "@/components/sections/contact";
import { LatestArticles } from "@/components/sections/latest-articles";
import { FAQAccordion } from "@/components/sections/faq-accordion";
import { fetchVideos } from "@/lib/api";

// Force dynamic rendering so videos are fetched fresh on every request
export const dynamic = "force-dynamic";

const HOMEPAGE_FAQ = [
  {
    category: "About 86Connect",
    items: [
      {
        question: "What is 86Connect?",
        answer:
          "86Connect is a Beijing-based consultancy that helps international students secure admission to China's top universities and assists businesses in sourcing products from verified Chinese manufacturers — all through a single, end-to-end managed service. It is the digital subsidiary of Beijing BridgePath International Consulting Co., Ltd, incorporated in Beijing, China on November 23, 2023.",
      },
      {
        question: "What services does 86Connect offer?",
        answer:
          "86Connect offers two core services: Study in China (scholarship applications, university admissions, visa processing, and accommodation) and Product Sourcing from China (supplier finding and vetting, procurement management, quality control inspections, and logistics coordination). Both services are available as full-service or partial-service arrangements.",
      },
    ],
  },
  {
    category: "Study in China",
    items: [
      {
        question: "How does 86Connect help with studying in China?",
        answer:
          "86Connect provides end-to-end support for studying in China, including CSC, provincial, and university scholarship applications, admission to 200+ partner universities, X1/X2 student visa processing, accommodation arrangement, and 24/7 local support. We have placed 500+ students with a 98% success rate across 30+ countries.",
      },
      {
        question: "Which countries does 86Connect serve for study abroad?",
        answer:
          "86Connect serves students from 50+ countries including Nigeria, Kenya, Ghana, South Africa, Ethiopia, India, Pakistan, Bangladesh, Indonesia, UAE, UK, USA, Canada, and Australia. We specialize in helping African and Asian students access Chinese government scholarships and university programs.",
      },
    ],
  },
  {
    category: "Product Sourcing",
    items: [
      {
        question: "How does 86Connect help with product sourcing from China?",
        answer:
          "86Connect manages the entire product sourcing process: finding and vetting suppliers from our network of 50,000+ verified manufacturers, managing procurement and negotiations, conducting quality control inspections, and coordinating freight forwarding and logistics to 150+ countries worldwide.",
      },
      {
        question: "How can I contact 86Connect?",
        answer:
          "You can contact 86Connect by email at info@the86connect.com, by phone at +86 176 1153 3296, or via WhatsApp. You can also book a free 15-minute consultation through our website or fill out the contact form on the homepage.",
      },
    ],
  },
];

export default async function Home() {
  const videos = await fetchVideos();

  return (
    <>
      <ServiceSchema
        name="Study in China Services"
        description="End-to-end study in China services including scholarship applications (CSC, provincial, university), university admissions, visa processing, accommodation, and pre-departure guidance. 200+ partner universities, 98% success rate."
        url="/study-in-china"
        providerName="86Connect"
        areaServed={["Nigeria", "Kenya", "Ghana", "South Africa", "Ethiopia", "India", "Pakistan", "Bangladesh", "Indonesia", "Philippines", "Vietnam", "UAE", "Saudi Arabia", "UK", "USA", "Canada", "Australia"]}
        serviceType="EducationConsultancy"
        offers={[
          { name: "Scholarship Application", description: "CSC, provincial, and university scholarship applications" },
          { name: "University Admission", description: "200+ partner universities, all programs" },
          { name: "Visa Processing", description: "X1/X2 student visa support" },
        ]}
      />
      <ServiceSchema
        name="Product Sourcing from China"
        description="End-to-end product sourcing from China including supplier finding and vetting, procurement management, quality control inspections, freight forwarding, and logistics coordination. 50,000+ verified suppliers, shipping to 150+ countries."
        url="/product-sourcing"
        providerName="86Connect"
        areaServed={["Nigeria", "Kenya", "Ghana", "South Africa", "India", "Pakistan", "Bangladesh", "UAE", "Saudi Arabia", "USA", "UK", "Canada", "Australia", "Germany"]}
        serviceType="ProcurementService"
        offers={[
          { name: "Supplier Finding", description: "50,000+ verified suppliers across all industries" },
          { name: "Quality Control", description: "Factory audits, pre-shipment inspections" },
          { name: "Logistics", description: "Sea, air, and express freight worldwide" },
        ]}
      />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ByTheNumbersSection />
        <StudyInChinaSection />
        <ProductSourcingSection />
        <ShippingMethodsSection />
        {videos.length > 0 && (
          <VideoGallery
            videos={videos}
            title={
              <>
                See <span className="text-primary">86Connect</span> in Action
              </>
            }
            subtitle="Watch our latest videos showcasing study abroad experiences in China and product sourcing success stories."
          />
        )}
        <LatestArticles />
        <AboutUsSection />
        <ContactSection />
        <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-5 md:px-6 lg:px-8 bg-section-alt">
          <div className="container mx-auto max-w-4xl">
            <FAQAccordion
              sections={HOMEPAGE_FAQ}
              title={
                <>
                  Frequently Asked{" "}
                  <span className="text-primary">Questions</span>
                </>
              }
              ctaText="See All FAQs"
              ctaHref="/faq"
              ctaSubtext="Still have questions? Browse our full FAQ page."
            />
          </div>
        </section>
        <HomepageFAQSchema />
      </main>
      <Footer />
    </>
  );
}
