import { PrismaClient } from "@prisma/client";
import { generateUniqueReferenceCode } from "../src/lib/reference-code";

const prisma = new PrismaClient();

async function main() {
  const submissions = await prisma.submission.findMany({
    where: { referenceCode: null },
    select: { id: true, serviceInterest: true },
  });

  console.log(`Found ${submissions.length} submissions without reference codes`);

  let updated = 0;
  for (const s of submissions) {
    const code = await generateUniqueReferenceCode(s.serviceInterest);
    await prisma.submission.update({
      where: { id: s.id },
      data: { referenceCode: code },
    });
    console.log(`  ${s.id} → ${code}`);
    updated++;
  }

  console.log(`\nBackfilled ${updated} submissions with reference codes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
