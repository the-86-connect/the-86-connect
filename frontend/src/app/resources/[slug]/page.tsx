import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, GraduationCap, ShoppingCart, Compass } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { fetchBlogPost } from "@/lib/api";
import { getPostBySlug } from "@/data/blog";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Try API first for dynamic posts, fallback to static
  try {
    const post = await fetchBlogPost(slug);
    if (post) {
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
  } catch { /* fall through to static */ }
  const fallback = getPostBySlug(slug);
  if (!fallback) return { title: "Article Not Found" };
  return {
    title: fallback.title,
    description: fallback.excerpt,
    alternates: { canonical: `/resources/${fallback.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: fallback.title,
      description: fallback.excerpt,
      type: "article",
      publishedTime: fallback.date,
      authors: [fallback.author],
      tags: fallback.tags,
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

/** Render HTML content from TipTap or fallback static JSON content */
function renderContent(content: unknown): string {
  // If it's already an HTML string (from TipTap editor)
  if (typeof content === "string") return content;
  // If it's old-style JSON BlogSection[] (from static fallback data)
  if (Array.isArray(content)) {
    return content
      .map((section) => {
        switch (section.type) {
          case "paragraph":
            return `<p>${section.text || ""}</p>`;
          case "heading":
            return section.level === 2
              ? `<h2>${section.text || ""}</h2>`
              : `<h3>${section.text || ""}</h3>`;
          case "list":
            return `<ul>${(section.items || []).map((item: string) => `<li>${item}</li>`).join("")}</ul>`;
          case "tip":
            return `<blockquote><p>${section.text || ""}</p></blockquote>`;
          default:
            return "";
        }
      })
      .join("\n");
  }
  return "";
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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
      imageUrl: fallback.imageUrl || null,
      order: 0,
      published: true,
      createdAt: "",
      updatedAt: "",
    };
  }

  const CatIcon = CATEGORY_ICONS[post.category as keyof typeof CATEGORY_ICONS] || Compass;
  const catColor = CATEGORY_COLORS[post.category as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS["Guide"];
  const htmlContent = renderContent(post.content);

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

          {/* Featured image */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full rounded-2xl mb-10 object-cover max-h-[400px]"
            />
          )}

          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-base prose-p:leading-[1.8] prose-p:text-foreground/90 prose-p:mb-5 prose-ul:mb-6 prose-li:text-base prose-li:leading-relaxed prose-li:text-foreground/90 prose-blockquote:border-l-4 prose-blockquote:border-amber-300 prose-blockquote:bg-amber-50 prose-blockquote:rounded-r-2xl prose-blockquote:py-4 prose-blockquote:px-5 prose-blockquote:not-italic prose-blockquote:text-amber-900 prose-blockquote:font-medium prose-blockquote:text-sm prose-img:rounded-xl prose-img:max-w-full prose-img:my-6 prose-a:text-primary prose-a:underline"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

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
