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
import { LatestArticles } from "@/components/sections/latest-articles";
import { fetchVideos } from "@/lib/api";

// Force dynamic rendering so videos are fetched fresh on every request
export const dynamic = "force-dynamic";

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
      </main>
      <Footer />
    </>
  );
}
