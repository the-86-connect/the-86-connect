import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero";
import { ByTheNumbersSection } from "@/components/sections/by-the-numbers";
import { StudyInChinaSection } from "@/components/sections/study-in-china";
import { ProductSourcingSection } from "@/components/sections/product-sourcing";
import { AboutUsSection } from "@/components/sections/about-us";
import { ContactSection } from "@/components/sections/contact";

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

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ByTheNumbersSection />
        <StudyInChinaSection />
        <ProductSourcingSection />
        <AboutUsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
