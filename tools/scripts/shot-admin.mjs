// Screenshot the admin app pages (login + dashboard variants) for visual review.
import puppeteer from "puppeteer";

const browser = await puppeteer.connect({ browserWSEndpoint: "ws://localhost:8080?token=chrome_token" });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });

// 1. Login page
await page.goto("http://host.docker.internal:3001/", { waitUntil: "domcontentloaded", timeout: 60_000 });
await new Promise((r) => setTimeout(r, 3500));
await page.screenshot({ path: "admin-login.png" });

// 2. Log in as super admin in-page so cookies are set on the :3001 origin
const [identifier, password, name] = process.argv.slice(2);
await page.evaluate(
  async (id, pw) => {
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: id, password: pw }),
    });
  },
  identifier,
  password,
);

await page.goto("http://host.docker.internal:3001/dashboard", { waitUntil: "domcontentloaded", timeout: 60_000 });
await new Promise((r) => setTimeout(r, 3500));
await page.screenshot({ path: `admin-dash-${name}.png` });

await page.goto("http://host.docker.internal:3001/dashboard/jobs", { waitUntil: "domcontentloaded", timeout: 60_000 });
await new Promise((r) => setTimeout(r, 3500));
await page.screenshot({ path: `admin-jobs-${name}.png` });

if (name === "super") {
  await page.goto("http://host.docker.internal:3001/dashboard/approvals", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: "admin-approvals.png" });

  await page.goto("http://host.docker.internal:3001/dashboard/org-accounts", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await new Promise((r) => setTimeout(r, 3500));
  await page.screenshot({ path: "admin-org-accounts.png" });
}

console.log("done");
await page.close();
await browser.disconnect();
