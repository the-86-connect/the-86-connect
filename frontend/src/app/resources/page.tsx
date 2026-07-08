import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, ChevronRight } from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";

export const dynamic = "force-dynamic";

const CATEGORY_BG = {
  "Study in China": "bg-red-50/50",
  "Product Sourcing": "bg-blue-50/50",
  "Guide": "bg-amber-50/50",
} as const;

const CATEGORY_HOVER = {
  "Study in China": "hover:bg-red-50/80",
  "Product Sourcing": "hover:bg-blue-50/80",
  "Guide": "hover:bg-amber-50/80",
} as const;

const CATEGORY_ACCENT = {
  "Study in China": "bg-red-500",
  "Product Sourcing": "bg-blue-500",
  "Guide": "bg-amber-500",
} as const;

export default async function ResourcesPage() {
  const posts = await fetchBlogPosts();

  // Group posts by category
  const categories = ["Study in China", "Product Sourcing", "Guide"] as const;
  const grouped = categories
    .map((cat) => ({
      category: cat,
      posts: posts.filter((p) => p.category === cat),
    }))
    .filter((g) => g.posts.length > 0);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-12">
        {/* Back button + compact header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="w-px h-5 bg-border" />
          <h1 className="font-display font-black text-lg sm:text-xl tracking-tight">
            Resources
          </h1>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No articles published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ category, posts: catPosts }) => {
              const accent = CATEGORY_ACCENT[category as keyof typeof CATEGORY_ACCENT] || "bg-primary";
              const hoverBg = CATEGORY_HOVER[category as keyof typeof CATEGORY_HOVER] || "hover:bg-muted/50";

              return (
                <section key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-1.5 h-4 ${accent} rounded-full`} />
                    <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {category}
                    </h2>
                  </div>
                  <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
                    {catPosts.map((post) => (
                      <Link
                        key={post.id}
                        href={`/resources/${post.slug}`}
                        className={`group flex items-start gap-4 p-4 ${hoverBg} transition-colors`}
                      >
                        {/* Thumbnail */}
                        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-muted/50 border border-border/50">
                          {post.imageUrl ? (
                            <img
                              src={post.imageUrl}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/5 to-transparent flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-primary/20" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <h3 className="font-semibold text-sm sm:text-[15px] leading-snug group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-[13px] text-muted-foreground/70 mt-1 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground/50">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {post.date}
                            </span>
                            <span>{post.readTime}</span>
                            <span className="inline-flex items-center gap-0.5 text-primary/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Read
                              <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}