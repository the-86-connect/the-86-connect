import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, GraduationCap, ShoppingCart, Compass, Lightbulb } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { fetchBlogPost } from "@/lib/api";
import { BLOG_POSTS, getPostBySlug } from "@/data/blog";
import type { BlogSection } from "@/data/blog";

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/resources/${post.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

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

function renderSection(section: BlogSection, idx: number) {
  switch (section.type) {
    case "paragraph":
      return (
        <p key={idx} className="text-base leading-[1.8] text-foreground/90 mb-5">
          {section.text}
        </p>
      );
    case "heading":
      if (section.level === 2) {
        return (
          <h2 key={idx} className="font-display font-black text-2xl sm:text-3xl mt-10 mb-4 tracking-tight">
            {section.text}
          </h2>
        );
      }
      return (
        <h3 key={idx} className="font-display font-bold text-xl mt-8 mb-3 tracking-tight">
          {section.text}
        </h3>
      );
    case "list":
      return (
        <ul key={idx} className="space-y-2.5 mb-6 pl-1">
          {section.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-base leading-relaxed text-foreground/90">
              <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case "tip":
      return (
        <div key={idx} className="flex gap-3 p-5 my-6 rounded-2xl bg-amber-50 border border-amber-200/70">
          <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-amber-900 font-medium">{section.text}</p>
        </div>
      );
    default:
      return null;
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Try API first, fallback to static
  let post = await fetchBlogPost(slug);
  if (!post) {
    const fallback = getPostBySlug(slug);
    if (!fallback) notFound();
    post = {
      id: fallback.slug,
      slug: fallback.slug,
      title: fallback.title,
      excerpt: fallback.excerpt,
      category: fallback.category,
      date: fallback.date,
      readTime: fallback.readTime,
      author: fallback.author,
      tags: fallback.tags,
      content: fallback.content,
      order: 0,
      published: true,
      createdAt: "",
      updatedAt: "",
    };
  }

  const CatIcon = CATEGORY_ICONS[post.category as keyof typeof CATEGORY_ICONS] || Compass;
  const catColor = CATEGORY_COLORS[post.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS["Guide"];

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white">
        <article className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>

          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${catColor}`}
              >
                <CatIcon className="h-3 w-3" />
                {post.category}
              </span>
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl tracking-[-0.04em] leading-[1.1] mb-5">
              {post.title}
            </h1>

            <div className="flex items-center gap-5 text-sm text-muted-foreground font-semibold">
              <span>{post.author}</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
            </div>
          </header>

          <div className="prose prose-lg max-w-none">
            {post.content.map((section, idx) => renderSection(section, idx))}
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/15 text-center">
              <h3 className="font-display font-black text-xl mb-2">
                Ready to get started?
              </h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
                {post.category === "Study in China" || post.category === "Guide"
                  ? "Apply to study in China with expert guidance from our team."
                  : "Start sourcing products from verified Chinese suppliers."}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/study-in-china#apply"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-primary text-white rounded-xl font-black text-sm hover:bg-red-700 transition-all cursor-pointer press"
                >
                  <GraduationCap className="h-4 w-4" />
                  Study in China
                </Link>
                <Link
                  href="/product-sourcing#inquire"
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-white text-foreground rounded-xl font-black text-sm border border-border hover:border-primary/30 transition-all cursor-pointer press"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Source Products
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
