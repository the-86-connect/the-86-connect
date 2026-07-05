import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { ByTheNumbersSection } from "@/components/sections/by-the-numbers";
import { StudyInChinaSection } from "@/components/sections/study-in-china";
import { ProductSourcingSection } from "@/components/sections/product-sourcing";
import { VideoGallery } from "@/components/sections/video-gallery";
import { AboutUsSection } from "@/components/sections/about-us";
import { ContactSection } from "@/components/sections/contact";
import { fetchVideos } from "@/lib/api";

export const metadata: Metadata = {
  title: {
    default: "86 Connect - Study in China & Product Sourcing Services",
    template: "%s | 86 Connect",
  },
  description:
    "Professional services for Study in China assistance and Product Sourcing from China. Scholarships, university admissions, supplier finding, procurement, and logistics support.",
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const videos = await fetchVideos();

  return (
    <>
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
