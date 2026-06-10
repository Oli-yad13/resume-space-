// Screenshot a single page of a template render: node tools/scripts/shot-page.mjs <template> <pageNum> [outfile]
import fs from "node:fs";
import puppeteer from "puppeteer";

const [template = "bronzor", pageNum = "1", outfile] = process.argv.slice(2);
const resume = JSON.parse(fs.readFileSync("tools/scripts/fixtures/user-real.json", "utf8"));
resume.metadata.template = template;

const browser = await puppeteer.connect({ browserWSEndpoint: "ws://localhost:8080?token=chrome_token" });
const page = await browser.newPage();
await page.evaluateOnNewDocument((d) => localStorage.setItem("resume", JSON.stringify(d)), resume);
await page.setViewport({ width: 900, height: 1300, deviceScaleFactor: 1.5 });
await page.goto("http://host.docker.internal:6173/artboard/preview", { waitUntil: "networkidle0" });
await page.waitForSelector('[data-page="1"]');
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1000));
const els = await page.$$("[data-page]");
const idx = Number(pageNum) - 1;
if (!els[idx]) {
  console.log(`only ${els.length} pages`);
} else {
  const path = outfile ?? `${template}-p${pageNum}-shot.png`;
  await els[idx].screenshot({ path });
  console.log(path);
}
await page.close();
await browser.disconnect();
