import { Router } from "express";
import { prisma } from "../lib/prisma";

export const blogRouter = Router();

/** Public: fetch all published blog posts */
blogRouter.get("/", async (_req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
        order: true,
        published: true,
        createdAt: true,
      },
    });
    res.json({ posts });
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
