import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ARTIFACT_DIR = "/Users/vishnu/.gemini/antigravity/brain/00f8abb7-ebda-45f0-a600-24c440d1d550";
const SCREENSHOT_ZIP_DIR = "/tmp/doccure_clean_screenshots";

async function main() {
  if (fs.existsSync(SCREENSHOT_ZIP_DIR)) {
    fs.rmSync(SCREENSHOT_ZIP_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(SCREENSHOT_ZIP_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,960"],
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();

  const pagesToCapture = [
    { name: "01_Hospital_Executive_Overview", url: "http://localhost:3000/?tab=overview" },
    { name: "02_Doctor_Commercial_Intelligence", url: "http://localhost:3000/?tab=doctors&view=financial" },
    { name: "03_Doctor_Products_Sold", url: "http://localhost:3000/?tab=doctors&view=clinical" },
    { name: "04_Doctor_Commercial_Matrix", url: "http://localhost:3000/?tab=doctors&view=matrix" },
    { name: "05_Department_Performance_Clean", url: "http://localhost:3000/?tab=departments" },
    { name: "06_Labs_Diagnostics_Clean", url: "http://localhost:3000/?tab=labs" },
    { name: "07_Pharmacy_Dispensary_Clean", url: "http://localhost:3000/?tab=pharmacy" }
  ];

  for (const item of pagesToCapture) {
    console.log(`Navigating to ${item.name} (${item.url})...`);
    await page.goto(item.url, { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 600));

    // Full page screenshot
    const fullPath = path.join(SCREENSHOT_ZIP_DIR, `${item.name}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });

    // Also copy to artifact dir
    const artifactPath = path.join(ARTIFACT_DIR, `${item.name.toLowerCase()}.png`);
    fs.copyFileSync(fullPath, artifactPath);
    console.log(`Saved ${item.name}.png`);
  }

  await browser.close();

  // Create zip
  const zipPath = path.join(ARTIFACT_DIR, "doccure_hospital_dashboard_full_screenshots.zip");
  execSync(`cd "${SCREENSHOT_ZIP_DIR}" && zip -r "${zipPath}" *.png`);
  console.log(`Created zip at ${zipPath}`);

  // Copy to public/ for web download
  fs.mkdirSync("/Users/vishnu/Downloads/untitled folder/public", { recursive: true });
  fs.copyFileSync(zipPath, "/Users/vishnu/Downloads/untitled folder/public/doccure_hospital_dashboard_full_screenshots.zip");
  // Also copy directly to user's Downloads folder
  fs.copyFileSync(zipPath, "/Users/vishnu/Downloads/doccure_hospital_dashboard_full_screenshots.zip");
  console.log("Copied zip to /Users/vishnu/Downloads/ and public/");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
