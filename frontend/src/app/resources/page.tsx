import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, Calendar, ArrowRight, GraduationCap, ShoppingCart, Compass } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { fetchBlogPosts } from "@/lib/api";
import { BLOG_POSTS } from "@/data/blog";

export const metadata: Metadata = {
  title: "Resources & Guides",
  description:
    "Expert guides, tips, and insights about studying in China (scholarships, admissions, CSC, visas) and sourcing products from China (suppliers, quality control, logistics, import costs). Free resources from 86 Connect.",
  alternates: {
    canonical: "/resources",
  },
  openGraph: {
    title: "Resources & Guides | 86 Connect",
    description:
      "Expert guides about studying in China and sourcing products from China. Free resources on scholarships, admissions, suppliers, logistics, and more.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "86 Connect Resources & Guides" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Resources & Guides | 86 Connect",
    description:
      "Free expert guides on studying in China and sourcing products from China. Scholarships, suppliers, logistics, and more.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const CATEGORY_ICONS = {
  "Study in China": GraduationCap,
  "Product Sourcing": ShoppingCart,
  "Guide": Compass,
} as const;

const CATEGORY_COLORS = {
  "Study in China": "bg-red-50 text-red-700 border-red-200",
  "Product Sourcing": "bg-blue-50 text-blue-700 border-blue-200",
  "Guide": "bg-amber-50 text-amber-700 border-amber-200",
} as const;

export default async function ResourcesPage() {
  let posts = await fetchBlogPosts();

  // Fallback to hardcoded data if API returns empty
  if (posts.length === 0) {
    posts = BLOG_POSTS.map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      date: p.date,
      readTime: p.readTime,
      author: p.author,
      tags: p.tags,
      order: 0,
      published: true,
    }));
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-section-warm relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-[28rem] h-[28rem] bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-[24rem] h-[24rem] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <header className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 shadow-3d-xs mb-4 sm:mb-5">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                Resources
              </span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl tracking-[-0.04em] mb-4 sm:mb-5">
              Guides & <span className="text-gradient-red-animated">Insights</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto font-medium">
              Expert articles to help you study in China and source products
              from verified Chinese suppliers.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {posts.map((post) => {
              const category = post.category as keyof typeof CATEGORY_ICONS;
              const CatIcon = CATEGORY_ICONS[category] || Compass;
              const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS["Guide"];
              return (
                <Link
                  key={post.slug}
                  href={`/resources/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-3xl bg-card border border-border/60 p-6 sm:p-7 shadow-soft-sm hover:shadow-soft-xl hover:border-primary/30 transition-all duration-300 cursor-pointer press"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${catColor}`}
                    >
                      <CatIcon className="h-3 w-3" />
                      {post.category}
                    </span>
                  </div>
                  <h2 className="font-display font-black text-lg sm:text-xl leading-tight mb-3 group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-semibold">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all">
                      Read <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center p-6 sm:p-8 rounded-3xl bg-primary/5 border border-primary/15">
            <BookOpen className="h-10 w-10 text-primary mx-auto mb-3" />
            <h3 className="font-display font-black text-xl sm:text-2xl mb-2">
              Need personalized help?
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-5 max-w-md mx-auto">
              Our team provides one-on-one guidance for study applications and
              sourcing projects.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/study-in-china#apply"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-primary text-white rounded-2xl font-black text-sm hover:bg-red-700 transition-all cursor-pointer press"
              >
                <GraduationCap className="h-4 w-4" />
                Study in China
              </Link>
              <Link
                href="/product-sourcing#inquire"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 bg-white text-foreground rounded-2xl font-black text-sm border border-border hover:border-primary/30 transition-all cursor-pointer press"
              >
                <ShoppingCart className="h-4 w-4" />
                Source Products
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
