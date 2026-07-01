/**
 * Seed script: generates demo availability slots so the frontend
 * booking page shows available time slots immediately.
 *
 * Usage: npx tsx src/seed-availability.ts [--reset]
 *
 * --reset   Delete all existing available slots before re-seeding
 *
 * Generates hourly weekday slots (Mon-Fri, 12pm-12am China time) for
 * the next 14 days. Times are stored in China Standard Time (UTC+8).
 */

import dotenv from "dotenv";
dotenv.config();

import { prisma } from "./lib/prisma";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function seed() {
  const reset = process.argv.includes("--reset");

  if (reset) {
    const deleted = await prisma.availabilitySlot.deleteMany({
      where: { status: "available" },
    });
    console.log(`Reset: deleted ${deleted.count} existing slots.\n`);
  }

  console.log("Seeding availability slots...\n");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 12 PM to 12 AM China time (UTC+8), hourly
  const timeSlots = [
    "12:00", "13:00", "14:00", "15:00",
    "16:00", "17:00", "18:00", "19:00",
    "20:00", "21:00", "22:00", "23:00",
  ];

  const records: { date: Date; startTime: string; endTime: string }[] = [];

  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const current = addDays(today, dayOffset);
    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat

    // Skip weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    for (const start of timeSlots) {
      const [h, m] = start.split(":").map(Number);
      const endHour = h + 1;
      const end = `${String(endHour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

      records.push({
        date: current,
        startTime: start,
        endTime: end,
      });
    }
  }

  // Check for existing slots to avoid duplicate key errors
  const fromDate = records[0]?.date ?? today;
  const toDate = addDays(records[records.length - 1]?.date ?? today, 1);

  const existing = await prisma.availabilitySlot.findMany({
    where: { date: { gte: fromDate, lte: toDate } },
    select: { date: true, startTime: true },
  });

  const existingSet = new Set(
    existing.map((s) => `${formatDate(s.date)}|${s.startTime}`),
  );

  const newRecords = records.filter(
    (r) => !existingSet.has(`${formatDate(r.date)}|${r.startTime}`),
  );

  if (newRecords.length === 0) {
    console.log("All slots already exist — nothing to seed.\n");
    await prisma.$disconnect();
    return;
  }

  const result = await prisma.availabilitySlot.createMany({
    data: newRecords,
  });

  console.log(`Created ${result.count} new availability slots.`);
  console.log(`(Skipped ${records.length - newRecords.length} duplicates)\n`);

  // Summary
  const stats = await prisma.availabilitySlot.groupBy({
    by: ["date"],
    _count: { id: true },
    orderBy: { date: "asc" },
  });

  console.log("Slots by date:");
  for (const s of stats) {
    const d = new Date(s.date);
    const label = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    console.log(`  ${label}: ${s._count.id} slots`);
  }

  console.log("\nDone! The booking page should now show available slots.");
  await prisma.$disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
