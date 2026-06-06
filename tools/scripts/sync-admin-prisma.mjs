// Mirror tools/prisma/schema.prisma → admin/prisma/schema.prisma.
// The admin app is outside the pnpm workspace, so it keeps its own Prisma
// client; this script keeps the schema authoritative in tools/prisma/.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const source = resolve(repoRoot, "tools/prisma/schema.prisma");
const target = resolve(repoRoot, "admin/prisma/schema.prisma");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

const bytes = readFileSync(source).length;
console.log(`synced schema.prisma (${bytes} bytes) → admin/prisma/`);
