import { prisma } from "./prisma";

const SERVICE_PREFIXES: Record<string, string> = {
  "Study in China": "STU",
  "Product Sourcing": "SOU",
  "General": "GEN",
  "Car Shipping": "CAR",
};

const CONTACT_PREFIX = "GEN";

export function getServicePrefix(serviceInterest: string): string {
  return SERVICE_PREFIXES[serviceInterest] ?? CONTACT_PREFIX;
}

export function buildReferenceCode(
  serviceInterest: string,
  randomNum: number,
): string {
  const prefix = getServicePrefix(serviceInterest);
  const padded = randomNum.toString().padStart(6, "0").slice(-6);
  return `${prefix}-${padded}`;
}

function randomSixDigits(): number {
  return Math.floor(Math.random() * 1000000);
}

export async function generateUniqueReferenceCode(
  serviceInterest: string,
): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = buildReferenceCode(serviceInterest, randomSixDigits());
    const existing = await prisma.submission.findUnique({
      where: { referenceCode: code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  // Extremely unlikely fallback — append extra digit
  const fallback = buildReferenceCode(
    serviceInterest,
    Math.floor(Math.random() * 10000000),
  );
  return fallback;
}
