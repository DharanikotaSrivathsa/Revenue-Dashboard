import puppeteer from "puppeteer-core";

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1440,960"],
    defaultViewport: { width: 1440, height: 960 }
  });

  const page = await browser.newPage();
  await page.goto("http://localhost:3000", { waitUntil: "networkidle0" });

  // 1. Initial State: Only Search Console and Doccure Medical Cards visible (Data is HIDDEN)
  await page.screenshot({ path: ".screenshots/doccure_1_search_state.png" });

  // 2. Click the Search Analytics Button inside Doccure Search Console
  await page.evaluate(() => {
    const searchBtn = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Search Analytics"));
    if (searchBtn) searchBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: ".screenshots/doccure_2_data_revealed.png" });

  // 3. Navigate to Doctor Performance
  await page.evaluate(() => {
    const docNav = Array.from(document.querySelectorAll("button")).find(b => b.textContent.includes("Doctor Performance"));
    if (docNav) docNav.click();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: ".screenshots/doccure_3_doctor_cards_grid.png" });

  await browser.close();
  console.log("Doccure experience captured successfully!");
}

capture().catch(console.error);
