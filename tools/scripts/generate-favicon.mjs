// Generates favicon.ico (PNG-in-ICO) from a brand SVG using sharp.
// Usage: node tools/scripts/generate-favicon.mjs [--preview]
import { writeFileSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

// Filled chip so the favicon stays visible on any browser tab background.
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" rx="52" fill="#4F46E5"/>
  <text x="128" y="142" text-anchor="middle" dominant-baseline="central"
    font-family="'IBM Plex Sans', Inter, 'Segoe UI', Arial, Helvetica, sans-serif"
    font-size="124" font-weight="700" letter-spacing="-4" fill="#FFFFFF">RS</text>
</svg>`;

const sizes = [16, 32, 48, 256];

const renderPng = (size) =>
  sharp(Buffer.from(faviconSvg)).resize(size, size).png().toBuffer();

const buildIco = (entries) => {
  // ICONDIR header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  const dataParts = [];

  entries.forEach((png, i) => {
    const b = i * 16;
    dir.writeUInt8(png.size >= 256 ? 0 : png.size, b + 0); // width (0 => 256)
    dir.writeUInt8(png.size >= 256 ? 0 : png.size, b + 1); // height
    dir.writeUInt8(0, b + 2); // palette
    dir.writeUInt8(0, b + 3); // reserved
    dir.writeUInt16LE(1, b + 4); // color planes
    dir.writeUInt16LE(32, b + 6); // bits per pixel
    dir.writeUInt32LE(png.buf.length, b + 8); // size of PNG data
    dir.writeUInt32LE(offset, b + 12); // offset of PNG data
    offset += png.buf.length;
    dataParts.push(png.buf);
  });

  return Buffer.concat([header, dir, ...dataParts]);
};

const root = process.cwd();
const targets = [
  path.join(root, "apps/client/public/favicon.ico"),
  path.join(root, "admin/src/app/favicon.ico"),
];

const buffers = await Promise.all(
  sizes.map(async (size) => ({ size, buf: await renderPng(size) })),
);
const ico = buildIco(buffers);

for (const target of targets) {
  writeFileSync(target, ico);
  console.log(`wrote ${path.relative(root, target)} (${ico.length} bytes)`);
}

if (process.argv.includes("--preview")) {
  const preview = await renderPng(128);
  writeFileSync(path.join(root, "tools/scripts/.favicon-preview.png"), preview);
  console.log("wrote tools/scripts/.favicon-preview.png");
}
