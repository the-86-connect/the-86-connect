/**
 * Reset admin_users table so ADMIN_PASSWORD env var works as bootstrap again.
 *
 * Usage:
 *   1. Set DATABASE_URL in backend/.env to your Render PostgreSQL EXTERNAL connection string
 *      (Format: postgresql://user:pass@host:port/dbname?sslmode=require)
 *   2. Run: npx tsx scripts/reset-admin.ts
 *   3. Restart the Render backend (so it picks up the empty admin_users table)
 *   4. Login at admin.the86connect.com using ADMIN_PASSWORD env var value
 *
 * What this script does:
 *   - Lists all current admin users (so you can see what's there)
 *   - Deletes ALL admin users from the database
 *   - This makes the backend fall back to ADMIN_PASSWORD env var on next login
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Force the production schema (PostgreSQL), not the dev schema (SQLite)
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "\n[ERROR] DATABASE_URL is not set. Please set it in backend/.env to your Render PostgreSQL EXTERNAL connection string.",
    );
    console.error(
      'Format: postgresql://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require\n',
    );
    process.exit(1);
  }

  console.log("\n=== Admin User Reset Tool ===");
  console.log("Database:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));
  console.log("");

  // List current admin users
  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  if (admins.length === 0) {
    console.log("[INFO] No admin users found in database.");
    console.log("[INFO] ADMIN_PASSWORD env var should already work as bootstrap.");
    console.log("[INFO] If login still fails, check that ADMIN_PASSWORD is set on Render.");
    return;
  }

  console.log(`[INFO] Found ${admins.length} admin user(s) in database:`);
  admins.forEach((a, i) => {
    console.log(
      `  ${i + 1}. ${a.email} (${a.name}) — role: ${a.role} — last login: ${a.lastLoginAt || "never"} — created: ${a.createdAt.toISOString()}`,
    );
  });
  console.log("");

  // Delete all admin users
  const result = await prisma.adminUser.deleteMany({});
  console.log(`[OK] Deleted ${result.count} admin user(s).`);

  // Optionally create a fresh admin with the ADMIN_PASSWORD env var, if available
  if (process.env.ADMIN_PASSWORD) {
    const email = process.env.ADMIN_EMAIL || "admin@the86connect.com";
    const name = process.env.ADMIN_NAME || "Admin";
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const newAdmin = await prisma.adminUser.create({
      data: { email, name, passwordHash, role: "superadmin" },
      select: { id: true, email: true, name: true, role: true },
    });

    console.log(`[OK] Created fresh superadmin user:`);
    console.log(`     Email: ${newAdmin.email}`);
    console.log(`     Name:  ${newAdmin.name}`);
    console.log(`     Role:  ${newAdmin.role}`);
    console.log(`     Password: (matches ADMIN_PASSWORD env var)`);
  } else {
    console.log("[INFO] ADMIN_PASSWORD env var is not set locally.");
    console.log("[INFO] The env var bootstrap on Render will work on next login.");
  }

  console.log("\n=== Done ===");
  console.log("Next steps:");
  console.log("  1. Restart the Render backend (Settings → Manual Deploy → Clear build cache & deploy)");
  console.log("  2. Visit https://admin.the86connect.com");
  console.log("  3. Login with the ADMIN_PASSWORD value set on Render\n");
}

main()
  .catch((err) => {
    console.error("\n[FATAL]", err.message);
    if (err.message.includes("PrismaClientInitializationError")) {
      console.error(
        "\nTroubleshooting: This usually means DATABASE_URL is wrong or unreachable.",
      );
      console.error("Make sure you are using the EXTERNAL Render PostgreSQL URL (not internal).");
      console.error("Make sure ?sslmode=require is appended to the connection string.\n");
    }
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
