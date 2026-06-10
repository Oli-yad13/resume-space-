// Render a resume JSON through the live artboard (via browserless Chrome) and
// screenshot each page, reporting margin/overflow diagnostics per page.
// Requires: compose.dev.yml chrome (port 8080) + artboard dev server (:6173).
// Usage (from repo root):
//   node tools/scripts/render-resume.mjs tools/scripts/fixtures/oliyad-flowcv.json out
import fs from "node:fs";
import puppeteer from "puppeteer";

const fixturePath = process.argv[2] || "tools/scripts/fixtures/oliyad-flowcv.json";
const label = process.argv[3] || "cv";
const resume = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

const browser = await puppeteer.connect({
  browserWSEndpoint: "ws://localhost:8080?token=chrome_token",
});
const page = await browser.newPage();
await page.evaluateOnNewDocument((data) => {
  window.localStorage.setItem("resume", JSON.stringify(data));
}, resume);
await page.setViewport({ width: 900, height: 1300, deviceScaleFactor: 2 });
await page.goto("http://host.docker.internal:6173/artboard/preview", {
  waitUntil: "networkidle0",
  timeout: 30_000,
});
await page.waitForSelector('[data-page="1"]', { timeout: 15_000 });
// Wait for web fonts to finish loading (triggers the paginator's re-measure),
// then give React a beat to commit the corrected pagination.
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1200));

// Report any element that sticks out horizontally past its page bounds,
// and the bottom gap of the last element on each page.
// (Run BEFORE element screenshots — those scroll the page and skew rects.)
const overflow = await page.evaluate(() => {
  const report = [];
  for (const pg of document.querySelectorAll("[data-page]")) {
    const pr = pg.getBoundingClientRect();
    const out = [];
    let maxBottom = 0;
    for (const el of pg.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.right > pr.right + 1 || r.left < pr.left - 1) {
        out.push({
          tag: el.tagName,
          cls: String(el.className).slice(0, 60),
          text: (el.textContent ?? "").slice(0, 40),
          left: Math.round(r.left - pr.left),
          right: Math.round(r.right - pr.right),
        });
      }
      if (r.bottom > maxBottom) maxBottom = r.bottom;
    }
    report.push({
      page: pg.dataset.page,
      horizontalOverflows: out.slice(0, 8),
      bottomGap: Math.round(pr.bottom - maxBottom),
      contentClippedBelow: Math.round(maxBottom - pr.bottom) > 0,
    });
  }
  return report;
});
console.log(JSON.stringify(overflow, null, 2));

const pageEls = await page.$$("[data-page]");
console.log("pages rendered:", pageEls.length);
for (let i = 0; i < pageEls.length; i++) {
  await pageEls[i].screenshot({ path: `${label}-p${i + 1}.png` });
  console.log(`saved ${label}-p${i + 1}.png`);
}

await page.close();
await browser.disconnect();
