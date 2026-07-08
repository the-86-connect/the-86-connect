import { Router } from "express";
import { prisma } from "../lib/prisma";

export const blogRouter = Router();

/** Public: fetch published blog posts with pagination */
blogRouter.get("/", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 8));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          excerpt: true,
          category: true,
          date: true,
          readTime: true,
          author: true,
          tags: true,
          imageUrl: true,
          order: true,
          published: true,
          createdAt: true,
        },
      }),
      prisma.blogPost.count({ where: { published: true } }),
    ]);

    res.json({
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Fetch blog posts error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve blog posts" });
  }
});

/** Public: fetch a single published blog post by slug */
blogRouter.get("/:slug", async (req, res) => {
  try {
    const post = await prisma.blogPost.findFirst({
      where: { slug: req.params.slug, published: true },
    });
    if (!post) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    res.json({ post });
  } catch (error) {
    console.error("Fetch blog post error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve blog post" });
  }
});
