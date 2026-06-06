#!/usr/bin/env node

/**
 * This script generates preview images for all resume templates.
 *
 * Prerequisites:
 * 1. Start the development server: pnpm dev
 * 2. Make sure http://localhost:5173 is accessible
 * 3. Run this script: node tools/scripts/generate-template-previews.mjs
 */

import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templates = [
  "alx",
  "azurill",
  "bronzor",
  "chikorita",
  "ditto",
  "gengar",
  "glalie",
  "kakuna",
  "leafish",
  "nosepass",
  "onyx",
  "pikachu",
  "rhyhorn",
];

const CLIENT_URL = "http://localhost:5173";
const ARTBOARD_URL = `${CLIENT_URL}/artboard/preview`;
const JSON_DIR = path.join(__dirname, "../../apps/client/public/templates/json");
const OUTPUT_DIR = path.join(__dirname, "../../apps/client/public/templates/jpg");

async function generatePreview(browser, templateName) {
  console.log(`📸 Generating preview for ${templateName}...`);

  const page = await browser.newPage();

  try {
    // Load template data
    const templatePath = path.join(JSON_DIR, `${templateName}.json`);
    const templateData = JSON.parse(fs.readFileSync(templatePath, "utf-8"));

    // Ensure template metadata is set
    if (!templateData.metadata) templateData.metadata = {};
    templateData.metadata.template = templateName;

    // Set resume data in localStorage before navigation
    await page.evaluateOnNewDocument((data) => {
      window.localStorage.setItem("resume", JSON.stringify(data));
    }, templateData);

    // Set viewport to A4 size (794 x 1123 px at 96 DPI)
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 2,
    });

    console.log(`   ⏳ Loading ${ARTBOARD_URL}...`);

    // Navigate to preview page
    await page.goto(ARTBOARD_URL, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for content to fully render
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Take screenshot
    const screenshot = await page.screenshot({
      type: "jpeg",
      quality: 85,
      fullPage: false,
    });

    // Save to file
    const outputPath = path.join(OUTPUT_DIR, `${templateName}.jpg`);
    fs.writeFileSync(outputPath, screenshot);

    console.log(`   ✅ ${templateName}.jpg saved successfully\n`);
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}\n`);
  } finally {
    await page.close();
  }
}

async function checkServerRunning() {
  console.log(`🔍 Checking if dev server is running at ${CLIENT_URL}...`);

  try {
    const response = await fetch(CLIENT_URL);
    if (response.ok) {
      console.log("✅ Dev server is running!\n");
      return true;
    }
  } catch (error) {
    console.error("❌ Dev server is not running!");
    console.error("\n📌 Please start the dev server first:");
    console.error("   pnpm dev\n");
    console.error("   Then run this script again.\n");
    return false;
  }
}

async function main() {
  console.log("🚀 Template Preview Generator\n");
  console.log("=".repeat(50));
  console.log();

  // Check if dev server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    process.exit(1);
  }

  // Create output directory if needed
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`📂 JSON templates: ${JSON_DIR}`);
  console.log(`📂 Output directory: ${OUTPUT_DIR}`);
  console.log(`📋 Templates to process: ${templates.length}\n`);
  console.log("=".repeat(50));
  console.log();

  // Launch browser once for all templates
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  });

  try {
    // Generate previews sequentially
    for (const template of templates) {
      await generatePreview(browser, template);
    }

    console.log("=".repeat(50));
    console.log("✨ All template previews regenerated successfully!");
    console.log(`📁 Check: ${OUTPUT_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
