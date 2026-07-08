import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock } from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";
import { BLOG_POSTS } from "@/data/blog";

export async function LatestArticles() {
  // Try API first, fallback to static
  let posts = await fetchBlogPosts();
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
      imageUrl: p.imageUrl || null,
      order: 0,
      published: true,
    }));
  }

  const latest = posts.slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section className="section-padding bg-section-light">
      <div className="container mx-auto max-w-7xl px-4 sm:px-5 md:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-[-0.03em]">
              Latest{" "}
              <span className="text-primary">Articles</span>
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base mt-2 max-w-lg">
              Expert guides and insights on studying in China and product sourcing.
            </p>
          </div>
          <Link
            href="/resources"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-red-700 transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latest.map((post) => (
            <Link
              key={post.id}
              href={`/resources/${post.slug}`}
              className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-soft-lg transition-all duration-300 lift"
            >
              {post.imageUrl ? (
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary/25" />
                </div>
              )}
              <div className="p-5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary mb-3">
                  <BookOpen className="h-3 w-3" />
                  {post.category}
                </span>
                <h3 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-red-700 transition-colors"
          >
            View All Articles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}