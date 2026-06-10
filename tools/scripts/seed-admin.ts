/**
 * Seed (or promote) the platform SUPER_ADMIN account.
 *
 * Usage (PowerShell):
 *   $env:SEED_ADMIN_EMAIL="admin@resumespace.et"; $env:SEED_ADMIN_PASSWORD="..."; pnpm seed:admin
 *
 * If a user with the email already exists (e.g. registered through the client),
 * it is promoted to SUPER_ADMIN instead of being recreated.
 */
import { PrismaClient } from "@prisma/client";
import bcryptjs from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Super Admin";

  if (!email || !password) {
    console.error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables first.");
    process.exit(1);
  }

  if (password.length < 6) {
    console.error("SEED_ADMIN_PASSWORD must be at least 6 characters.");
    process.exit(1);
  }

  const hashedPassword = await bcryptjs.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: "SUPER_ADMIN",
      disabled: false,
      secrets: { update: { password: hashedPassword } },
    },
    create: {
      name,
      email,
      username: "superadmin",
      provider: "email",
      emailVerified: true,
      role: "SUPER_ADMIN",
      secrets: { create: { password: hashedPassword } },
    },
  });

  console.log(`✅ SUPER_ADMIN ready: ${user.email} (id: ${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
