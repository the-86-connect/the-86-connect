import Link from "next/link";
import { BookOpen, Calendar, ChevronRight } from "lucide-react";
import { fetchBlogPosts } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const posts = await fetchBlogPosts();

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-transparent pt-32 pb-16">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-[-0.03em] text-center">
            Resources
          </h1>
          <p className="text-muted-foreground text-center mt-3 max-w-lg mx-auto">
            Expert guides and insights on studying in China, product sourcing, and more.
          </p>
        </div>
      </section>

      {/* Posts List */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No articles published yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/resources/${post.slug}`}
                  className="group flex items-start gap-4 sm:gap-5 py-5 hover:bg-muted/30 -mx-3 px-3 rounded-xl transition-colors"
                >
                  {/* Thumbnail */}
                  <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted border border-border">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary/25" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="font-display font-bold text-base sm:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2 hidden sm:block">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {post.date}
                      </span>
                      <span className="inline-flex items-center gap-1 text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}