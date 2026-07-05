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
