import puppeteer from "puppeteer-core";

async function inspectDoccure() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,960"],
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();
  try {
    await page.goto("https://doccure.dreamstechnologies.com", { waitUntil: "networkidle2", timeout: 30000 });
    await page.screenshot({ path: ".screenshots/doccure_home.png" });
    const title = await page.title();
    console.log("Doccure title:", title);
  } catch (err) {
    console.error("Failed to load doccure:", err.message);
  } finally {
    await browser.close();
  }
}

inspectDoccure();
