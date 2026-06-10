import fs from "node:fs";
import puppeteer from "puppeteer";

const resume = JSON.parse(fs.readFileSync("tools/scripts/fixtures/user-real.json", "utf8"));
const target = process.argv[2] ?? "pikachu";
const startAs = process.argv[3] ?? "alx";

const browser = await puppeteer.connect({ browserWSEndpoint: "ws://localhost:8080?token=chrome_token" });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));

// Start the builder with the resume on a DIFFERENT template…
const initial = JSON.parse(JSON.stringify(resume));
initial.metadata.template = startAs;
await page.evaluateOnNewDocument((d) => window.localStorage.setItem("resume", JSON.stringify(d)), initial);
await page.setViewport({ width: 1200, height: 1400, deviceScaleFactor: 1.5 });
await page.goto("http://host.docker.internal:6173/artboard/builder", { waitUntil: "networkidle0", timeout: 30000 });
await page.waitForSelector('[data-page="1"]', { timeout: 12000 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1200));

// …then switch templates live via postMessage, exactly like the client does.
const switched = JSON.parse(JSON.stringify(resume));
switched.metadata.template = target;
await page.evaluate((d) => {
  window.postMessage({ type: "SET_RESUME", payload: d }, "*");
}, switched);
await new Promise((r) => setTimeout(r, 1800));

const stats = await page.evaluate(() => {
  return [...document.querySelectorAll("[data-page]")].map((pg) => {
    const pr = pg.getBoundingClientRect();
    let maxBottom = -Infinity;
    let worst = "";
    for (const el of pg.querySelectorAll("*")) {
      if (el.children.length > 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.bottom > maxBottom) {
        maxBottom = r.bottom;
        worst = (el.textContent ?? el.className ?? "").toString().slice(0, 60);
      }
    }
    // normalize out the builder zoom scale
    const scale = pr.height / pg.offsetHeight;
    return {
      bottomGapPx: Math.round((pr.bottom - maxBottom) / scale),
      pageHeight: pg.offsetHeight,
      worst,
    };
  });
});
console.log(`builder ${startAs} -> ${target}:`, JSON.stringify(stats, null, 1));
if (errors.length) console.log("errors:", errors.slice(0, 3));

const pageEls = await page.$$("[data-page]");
for (let i = 0; i < Math.min(pageEls.length, 3); i++) {
  await pageEls[i].screenshot({ path: `builder-${target}-p${i + 1}.png` });
}
await page.close();
await browser.disconnect();
