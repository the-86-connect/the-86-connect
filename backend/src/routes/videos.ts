import { Router } from "express";
import { prisma } from "../lib/prisma";

export const videosRouter = Router();

function extractYoutubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
}

videosRouter.get("/", async (req, res) => {
  try {
    const page = req.query.page as string | undefined;
    const where = page ? { page } : {};
    const videos = await prisma.video.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        youtubeId: true,
        title: true,
        page: true,
        order: true,
      },
    });
    res.json({ videos });
  } catch (error) {
    console.error("Fetch videos error:", (error as Error).message);
    res.status(500).json({ error: "Failed to retrieve videos" });
  }
});

export { extractYoutubeId };
