import fs from "node:fs";
import puppeteer from "puppeteer";

const resume = JSON.parse(fs.readFileSync("tools/scripts/fixtures/oliyad-flowcv.json", "utf8"));
const TWO_COL = new Set(["azurill", "chikorita", "ditto", "gengar", "glalie", "leafish", "pikachu"]);
const oneCol = [[["summary","experience","projects","skills","volunteer","education","awards","certifications","languages","publications","interests","references"]]];
const twoCol = [[
  ["summary","experience","projects","volunteer","references"],
  ["skills","education","awards","certifications","languages","publications","interests"],
]];

const templates = process.argv[2]?.split(",") ?? ["rhyhorn","kakuna","onyx","nosepass","leafish","bronzor","azurill","ditto","pikachu","glalie","gengar"];

for (const template of templates) {
  const data = JSON.parse(JSON.stringify(resume));
  data.metadata.template = template;
  data.metadata.layout = TWO_COL.has(template) ? twoCol : oneCol;

  let browser;
  try {
    browser = await puppeteer.connect({ browserWSEndpoint: "ws://localhost:8080?token=chrome_token" });
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
    page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
    await page.evaluateOnNewDocument((d) => window.localStorage.setItem("resume", JSON.stringify(d)), data);
    await page.setViewport({ width: 900, height: 1300, deviceScaleFactor: 2 });
    await page.goto("http://host.docker.internal:6173/artboard/preview", { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForSelector('[data-page="1"]', { timeout: 12000 });
    await page.evaluate(() => document.fonts.ready);
    await new Promise((r) => setTimeout(r, 1000));

    const stats = await page.evaluate(() => {
      return [...document.querySelectorAll("[data-page]")].map((pg) => {
        const pr = pg.getBoundingClientRect();
        let maxBottom = 0, maxRight = 0, minLeft = Infinity, minTop = Infinity;
        for (const el of pg.querySelectorAll("*")) {
          if (el.children.length > 0) continue; // leaf elements only = visible ink
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue;
          maxBottom = Math.max(maxBottom, r.bottom);
          maxRight = Math.max(maxRight, r.right);
          minLeft = Math.min(minLeft, r.left);
          minTop = Math.min(minTop, r.top);
        }
        return {
          top: Math.round(minTop - pr.top), left: Math.round(minLeft - pr.left),
          right: Math.round(pr.right - maxRight), bottom: Math.round(pr.bottom - maxBottom),
        };
      });
    });
    console.log(template, "| pages:", stats.length, "| ink margins t/l/r/b:", stats.map(s => `${s.top}/${s.left}/${s.right}/${s.bottom}`).join("  "));
    if (errors.length) console.log(template, "| console errors:", errors.slice(0, 2).join(" ;; "));

    const pageEls = await page.$$("[data-page]");
    for (let i = 0; i < Math.min(pageEls.length, 2); i++) {
      await pageEls[i].screenshot({ path: `t-${template}-p${i + 1}.png` });
    }
    await page.close();
  } catch (e) {
    console.log(template, "| ERROR:", e.message.slice(0, 150));
  }
  try { await browser?.disconnect(); } catch {}
}
