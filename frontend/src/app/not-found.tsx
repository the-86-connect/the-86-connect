import type { Metadata } from "next";
import Link from "next/link";
import { Home, Mail, Compass } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for doesn't exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1 min-h-[80vh] flex items-center justify-center bg-section-warm relative overflow-hidden px-4 py-20">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[25rem] h-[25rem] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center max-w-lg">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
            <Compass className="h-10 w-10 text-primary" />
          </div>

          <p className="text-8xl sm:text-9xl font-black font-display text-primary/20 leading-none mb-2 select-none">
            404
          </p>

          <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight mb-3">
            Page Not Found
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved.
            Let&apos;s get you back on track.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 rounded-xl h-12 px-6">
              <Link href="/">
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto gap-2 rounded-xl h-12 px-6">
              <Link href="/#contact">
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link
              href="/study-in-china"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
            >
              Study in China
            </Link>
            <Link
              href="/product-sourcing"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
            >
              Product Sourcing
            </Link>
            <Link
              href="/study-in-china/track-application"
              className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-semibold"
            >
              Track Application
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
