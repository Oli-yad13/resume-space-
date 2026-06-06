// One-shot: generate brand assets (logo lockup + square mark icon + favicons)
// from the source lockup PNG. Run from repo root: `node tools/scripts/generate-brand-assets.mjs`
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = resolve(ROOT, "Resume space.png");

const out = (p) => {
  const full = resolve(ROOT, p);
  mkdirSync(dirname(full), { recursive: true });
  return full;
};

if (!existsSync(SRC)) {
  console.error(`Source not found: ${SRC}`);
  process.exit(1);
}

// 1) Detect the mark region: scan columns for content, take the first content
//    block from the left, stop at the first wide transparent gap (mark↔wordmark).
const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const colHasContent = new Array(width).fill(false);
for (let x = 0; x < width; x++) {
  for (let y = 0; y < height; y++) {
    const alpha = data[(y * width + x) * channels + (channels - 1)];
    if (alpha > 16) {
      colHasContent[x] = true;
      break;
    }
  }
}

// first content column
let markStart = colHasContent.indexOf(true);
if (markStart < 0) markStart = 0;

// walk right until a transparent gap of >= 2% of width appears
const gapNeeded = Math.max(8, Math.round(width * 0.02));
let markEnd = markStart;
let gap = 0;
for (let x = markStart; x < width; x++) {
  if (colHasContent[x]) {
    gap = 0;
    markEnd = x;
  } else {
    gap++;
    if (gap >= gapNeeded) break;
  }
}

const markW = markEnd - markStart + 1;
console.log(`Image ${width}x${height} → mark cols [${markStart}..${markEnd}] (w=${markW})`);

// 2) Full lockup → logo.png (downscaled, transparent, trimmed of outer padding)
await sharp(SRC)
  .trim()
  .resize({ width: 1600, withoutEnlargement: true })
  .png()
  .toFile(out("apps/client/public/logo/logo.png"));

// 3) Square mark → icon.png (extract mark, trim, fit onto a square transparent canvas)
const markBuf = await sharp(SRC)
  .extract({ left: markStart, top: 0, width: markW, height })
  .trim()
  .toBuffer();

const ICON = 512;
await sharp(markBuf)
  .resize({ width: ICON, height: ICON, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(out("apps/client/public/icon/icon.png"));

// 4) Favicons (png) for client + artboard + admin, and admin app icon
const faviconBuf = await sharp(markBuf)
  .resize({ width: 64, height: 64, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

for (const p of [
  "apps/client/public/favicon.png",
  "apps/artboard/public/favicon.png",
  "admin/public/favicon.png",
]) {
  await sharp(faviconBuf).toFile(out(p));
}

// also a larger app-icon for admin (Next.js can use /icon.png)
await sharp(markBuf)
  .resize({ width: 256, height: 256, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(out("admin/public/icon.png"));

console.log("Brand assets written:");
console.log("  apps/client/public/logo/logo.png");
console.log("  apps/client/public/icon/icon.png");
console.log("  apps/client/public/favicon.png, apps/artboard/public/favicon.png, admin/public/favicon.png");
console.log("  admin/public/icon.png");
