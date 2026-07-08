import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Calendar, ChevronRight } from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";

export const dynamic = "force-dynamic";

const CATEGORY_HOVER = {
  "Study in China": "hover:bg-red-50/80",
  "Product Sourcing": "hover:bg-blue-50/80",
  "Guide": "hover:bg-amber-50/80",
} as const;

const CATEGORY_BADGE = {
  "Study in China": "bg-red-50 text-red-700 border-red-200",
  "Product Sourcing": "bg-blue-50 text-blue-700 border-blue-200",
  "Guide": "bg-amber-50 text-amber-700 border-amber-200",
} as const;

const PAGE_SIZE = 8;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function ResourcesPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page || "1") || 1);
  const { posts, total, page, totalPages } = await fetchBlogPosts(currentPage, PAGE_SIZE);

  // Build page links
  const getPageUrl = (p: number) => `/resources${p > 1 ? `?page=${p}` : ""}`;

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 pt-20 pb-12">
        {/* Back + Header */}
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
          <span className="text-xs text-muted-foreground ml-auto">
            {total} article{total !== 1 ? "s" : ""}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No articles published yet.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-border/50 rounded-xl border border-border/50 overflow-hidden">
              {posts.map((post) => {
                const hoverBg = CATEGORY_HOVER[post.category as keyof typeof CATEGORY_HOVER] || "hover:bg-muted/50";
                const badge = CATEGORY_BADGE[post.category as keyof typeof CATEGORY_BADGE] || CATEGORY_BADGE["Guide"];

                return (
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
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge}`}>
                          {post.category}
                        </span>
                        <span className="text-[11px] text-muted-foreground/50">{post.readTime}</span>
                      </div>
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
                        <span className="inline-flex items-center gap-0.5 text-primary/60 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Read
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Link
                  href={getPageUrl(page - 1)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    page <= 1
                      ? "pointer-events-none text-muted-foreground/30 bg-muted/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-disabled={page <= 1}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Link>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={getPageUrl(p)}
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-sm font-bold transition-colors ${
                      p === page
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {p}
                  </Link>
                ))}

                <Link
                  href={getPageUrl(page + 1)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    page >= totalPages
                      ? "pointer-events-none text-muted-foreground/30 bg-muted/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                  aria-disabled={page >= totalPages}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}