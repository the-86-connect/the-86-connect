import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ServiceSchema } from "@/components/seo/structured-data";
import { HeroSection } from "@/components/sections/hero";
import { ByTheNumbersSection } from "@/components/sections/by-the-numbers";
import { StudyInChinaSection } from "@/components/sections/study-in-china";
import { ProductSourcingSection } from "@/components/sections/product-sourcing";
import { VideoGallery } from "@/components/sections/video-gallery";
import { AboutUsSection } from "@/components/sections/about-us";
import { ContactSection } from "@/components/sections/contact";
import { fetchVideos } from "@/lib/api";

// Force dynamic rendering so videos are fetched fresh on every request
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "86 Connect — Study in China & Product Sourcing from China",
    template: "%s | 86 Connect",
  },
  description:
    "86 Connect is your trusted gateway to China. End-to-end services for Study in China (scholarships, university admissions, visas) and Product Sourcing from China (supplier finding, procurement, quality control, logistics). Serving 30+ countries.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "86 Connect — Study in China & Product Sourcing from China",
    description:
      "Your trusted gateway to China. End-to-end services for studying in China and sourcing products from China's top universities and manufacturers.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "86 Connect — Your Gateway to China" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "86 Connect — Study in China & Product Sourcing from China",
    description:
      "Your trusted gateway to China. Study in China and source products from China with end-to-end support.",
    images: ["/og-image.jpg"],
  },
};

export default async function Home() {
  const videos = await fetchVideos();

  return (
    <>
      <ServiceSchema
        name="Study in China Services"
        description="End-to-end study in China services including scholarship applications (CSC, provincial, university), university admissions, visa processing, accommodation, and pre-departure guidance. 200+ partner universities, 98% success rate."
        url="/study-in-china"
        providerName="86 Connect"
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
        providerName="86 Connect"
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
        {videos.length > 0 && (
          <VideoGallery
            videos={videos}
            title={
              <>
                See <span className="text-primary">86 Connect</span> in Action
              </>
            }
            subtitle="Watch our latest videos showcasing study abroad experiences in China and product sourcing success stories."
          />
        )}
        <AboutUsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
