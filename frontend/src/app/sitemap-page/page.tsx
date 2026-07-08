import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { FileText, BookOpen, Shield, Scale, Lock, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Complete sitemap of 86 Connect — all pages and resources for studying in China and product sourcing from China.",
  alternates: { canonical: "/sitemap-page" },
  robots: { index: true, follow: true },
};

const MAIN_PAGES = [
  { name: "Home", href: "/", icon: "🏠", description: "Study in China & Product Sourcing from China" },
  { name: "Study in China", href: "/study-in-china", icon: "🎓", description: "Scholarships, admissions, visas, accommodation" },
  { name: "Product Sourcing", href: "/product-sourcing", icon: "📦", description: "Supplier finding, procurement, quality control, logistics" },
  { name: "Book Consultation", href: "/book-consultation", icon: "📅", description: "Schedule a free consultation" },
  { name: "Resources & Guides", href: "/resources", icon: "📚", description: "Articles and guides about China" },
  { name: "FAQ", href: "/faq", icon: "❓", description: "Frequently asked questions" },
  { name: "Track Application", href: "/study-in-china/track-application", icon: "🔍", description: "Track your study application" },
  { name: "Track Quote", href: "/product-sourcing/track-quote", icon: "📋", description: "Track your sourcing quote" },
];

const LEGAL_PAGES = [
  { name: "Privacy Policy", href: "/privacy-policy", icon: <Shield className="h-4 w-4" /> },
  { name: "Terms of Service", href: "/terms-of-service", icon: <Scale className="h-4 w-4" /> },
  { name: "Data Processing Agreement", href: "/data-processing-agreement", icon: <FileText className="h-4 w-4" /> },
  { name: "Security Policy", href: "/security-policy", icon: <Lock className="h-4 w-4" /> },
  { name: "NDA", href: "/nda", icon: <FileText className="h-4 w-4" /> },
];

const BLOG_POSTS = [
  { name: "Complete Guide to Studying in China 2026", href: "/resources/complete-guide-studying-in-china-2026" },
  { name: "How to Source Products from China", href: "/resources/how-to-source-products-from-china" },
  { name: "Chinese Government Scholarship (CSC) Guide", href: "/resources/chinese-government-scholarship-csc" },
  { name: "Alibaba vs 1688 Supplier Sourcing", href: "/resources/alibaba-vs-1688-supplier-sourcing" },
];

export default function SitemapPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-section-warm relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <header className="text-center mb-12">
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-[-0.04em] mb-4">
              Sitemap
            </h1>
            <p className="text-muted-foreground text-lg">
              Complete list of all pages on 86 Connect
            </p>
          </header>

          {/* Main Pages */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Main Pages
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {MAIN_PAGES.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="text-2xl">{page.icon}</span>
                  <div>
                    <div className="font-semibold text-foreground">{page.name}</div>
                    <div className="text-sm text-muted-foreground">{page.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Blog Posts */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Blog Posts
            </h2>
            <div className="space-y-2">
              {BLOG_POSTS.map((post) => (
                <Link
                  key={post.href}
                  href={post.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{post.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Legal Pages */}
          <section className="mb-12">
            <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full" />
              Legal & Policies
            </h2>
            <div className="space-y-2">
              {LEGAL_PAGES.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  {page.icon}
                  <span className="text-foreground">{page.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/15">
            <p className="text-muted-foreground mb-2">Can&apos;t find what you&apos;re looking for?</p>
            <a
              href="mailto:info@the86connect.com"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <Mail className="h-4 w-4" />
              info@the86connect.com
            </a>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}