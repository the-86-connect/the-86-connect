import { prisma } from "./prisma";

const PREFIXES: Record<string, string> = {
  "Study in China": "STU",
  "Product Sourcing": "SOU",
  General: "GEN",
};

export async function generateUniqueReferenceCode(
  service: string,
): Promise<string> {
  const prefix = PREFIXES[service] || "GEN";
  for (let attempt = 0; attempt < 10; attempt++) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let suffix = "";
    for (let i = 0; i < 6; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `${prefix}-${suffix}`;
    const existing = await prisma.submission.findUnique({
      where: { referenceCode: code },
      select: { id: true },
    });
    if (!existing) return code;
  }
  // Fallback: use UUID
  return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}