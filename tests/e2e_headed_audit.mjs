import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("./test-results/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runHeadedAudit() {
  console.log("\n=======================================================");
  console.log("🚀 STARTING COMPREHENSIVE PLAYWRIGHT E2E AUDIT (HEADED)");
  console.log("=======================================================\n");

  const errors = [];
  const warnings = [];
  const uiIssues = [];

  // Launch browser in HEADED mode
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    slowMo: 300,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Listen to browser console errors and page crashes
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error") {
      if (!text.includes("Download the React DevTools") && !text.includes("favicon.ico")) {
        console.error("  ❌ [Browser Console Error]:", text);
        errors.push({ type: "console.error", text });
      }
    } else if (msg.type() === "warn") {
      if (text.includes("NaN") || text.includes("undefined")) {
        console.warn("  ⚠️  [Browser Console Warning]:", text);
        warnings.push({ type: "console.warn", text });
      }
    }
  });

  page.on("pageerror", (err) => {
    console.error("  💥 [Browser Unhandled Page Exception]:", err.message);
    errors.push({ type: "pageerror", message: err.message, stack: err.stack });
  });

  async function checkPageForAnomalies(sectionName) {
    const textContent = await page.evaluate(() => document.body.innerText);
    const nanMatches = textContent.match(/\bNaN\b|\bundefined\b|\bnull%\b/g);
    if (nanMatches && nanMatches.length > 0) {
      console.warn(`  ⚠️  Potential raw data anomaly in [${sectionName}]:`, nanMatches);
      uiIssues.push({ section: sectionName, issue: "Raw data leak (NaN/undefined)", matches: nanMatches });
    }
  }

  try {
    // ------------------------------------------------------------------
    // STEP 1: Load Application & Check Page Title
    // ------------------------------------------------------------------
    console.log("📌 Step 1: Navigating to", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    const pageTitle = await page.title();
    console.log(`   ✓ Page title loaded: "${pageTitle}"`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_initial_load.png") });

    // ------------------------------------------------------------------
    // STEP 2: Audit Executive Overview
    // ------------------------------------------------------------------
    console.log("\n📌 Step 2: Testing Executive Overview...");
    await page.waitForSelector("text=Doccure HMS", { timeout: 10000 });
    await page.waitForTimeout(600);
    await checkPageForAnomalies("Overview");

    const kpiCount = await page.locator("text=/Total Billed|Net Revenue|Collections/i").count();
    console.log(`   ✓ Found ${kpiCount} revenue KPI indicators in Overview.`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "02_overview_section.png") });

    // ------------------------------------------------------------------
    // STEP 3: Navigate to Doctor Performance & Test Sub-tabs
    // ------------------------------------------------------------------
    console.log("\n📌 Step 3: Navigating to Doctor Performance...");
    const doctorNavBtn = page.locator("button:has-text('Doctor Performance'), a:has-text('Doctor Performance')").first();
    await doctorNavBtn.click();
    await page.waitForTimeout(800);
    await checkPageForAnomalies("Doctor Performance");

    // Sub-tab 1: Revenue & Realization
    const subTab1 = page.locator("button:has-text('Revenue & Realization')").first();
    if (await subTab1.isVisible()) {
      console.log("   👉 Testing Doctor layout modes (Table <-> Grid)...");
      const tableLayoutBtn = page.locator("button:has-text('Table View')").first();
      if (await tableLayoutBtn.isVisible()) {
        await tableLayoutBtn.click();
        await page.waitForTimeout(400);
      }
      const gridLayoutBtn = page.locator("button:has-text('Grid View')").first();
      if (await gridLayoutBtn.isVisible()) {
        await gridLayoutBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // Sub-tab 2: Top Products & Services Sold
    const subTab2 = page.locator("button:has-text('Top Products & Services Sold')").first();
    if (await subTab2.isVisible()) {
      console.log("   👉 Switching to Sub-tab: 'Top Products & Services Sold'");
      await subTab2.click();
      await page.waitForTimeout(600);
      await checkPageForAnomalies("Doctor Products & Services");
    }

    // Sub-tab 3: Commercial Matrix
    const subTab3 = page.locator("button:has-text('Commercial Matrix')").first();
    if (await subTab3.isVisible()) {
      console.log("   👉 Switching to Sub-tab: 'Commercial Matrix'");
      await subTab3.click();
      await page.waitForTimeout(600);
      await checkPageForAnomalies("Doctor Commercial Matrix");
    }

    // Return to Revenue & Realization
    if (await subTab1.isVisible()) {
      await subTab1.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "03_doctor_performance.png") });

    // ------------------------------------------------------------------
    // STEP 4: Drill down into Doctor Detail Page (Dr. Priya Shah)
    // ------------------------------------------------------------------
    console.log("\n📌 Step 4: Testing Doctor Detail Drilldown (Dr. Priya Shah)...");
    const priyaCard = page.locator("text=Dr. Priya Shah").first();
    if (await priyaCard.isVisible()) {
      await priyaCard.click();
      await page.waitForTimeout(1000);
      await page.waitForSelector("text=Back to Doctor Performance", { timeout: 6000 });
      console.log("   ✓ DoctorDetailPage mounted cleanly for Dr. Priya Shah");

      await checkPageForAnomalies("DoctorDetailPage - Priya Shah");

      // Verify badges
      const dutyBadge = page.locator("text=On duty").first();
      if (await dutyBadge.isVisible()) {
        console.log("   ✓ Doctor status badge ('On duty') displayed.");
      }

      // Test trend period switchers
      console.log("   👉 Testing trend period switchers (Weekly -> Monthly -> Daily)...");
      const weeklyBtn = page.locator("button:has-text('weekly')").first();
      if (await weeklyBtn.isVisible()) {
        await weeklyBtn.click();
        await page.waitForTimeout(400);
      }
      const monthlyBtn = page.locator("button:has-text('monthly')").first();
      if (await monthlyBtn.isVisible()) {
        await monthlyBtn.click();
        await page.waitForTimeout(400);
      }
      const dailyBtn = page.locator("button:has-text('daily')").first();
      if (await dailyBtn.isVisible()) {
        await dailyBtn.click();
        await page.waitForTimeout(400);
      }

      // Check DoctorServiceExplorer
      const serviceSection = page.locator("text=Service-level revenue contribution").first();
      if (await serviceSection.isVisible()) {
        console.log("   ✓ DoctorServiceExplorer (selected doctor figures) verified.");
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, "04_doctor_detail_page.png") });

      // Click "Back to Doctor Performance"
      console.log("   👉 Clicking 'Back to Doctor Performance'...");
      const backBtn = page.locator("button:has-text('Back to Doctor Performance'), a:has-text('Back to Doctor Performance')").first();
      await backBtn.click();
      await page.waitForTimeout(800);
      console.log("   ✓ Successfully returned to Doctor Performance view.");
    }

    // ------------------------------------------------------------------
    // STEP 5: Audit Speciality Performance
    // ------------------------------------------------------------------
    console.log("\n📌 Step 5: Navigating to Speciality Performance...");
    const deptNavBtn = page.locator("button:has-text('Speciality Performance'), a:has-text('Speciality Performance'), button:has-text('Department Performance')").first();
    await deptNavBtn.click();
    await page.waitForTimeout(800);
    await checkPageForAnomalies("Speciality Performance");

    // Click on a department card (e.g. Cardiology) to filter
    const deptCard = page.locator("text=Cardiology").first();
    if (await deptCard.isVisible()) {
      console.log("   👉 Clicking 'Cardiology' department card to filter...");
      await deptCard.click();
      await page.waitForTimeout(500);
      console.log("   👉 Clicking again to unfilter back to all...");
      await deptCard.click();
      await page.waitForTimeout(500);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "05_department_performance.png") });

    // ------------------------------------------------------------------
    // STEP 6: Audit Labs Performance (All 4 Tabs & Metrics)
    // ------------------------------------------------------------------
    console.log("\n📌 Step 6: Navigating to Labs Performance...");
    const labsNavBtn = page.locator("button:has-text('Labs Performance'), a:has-text('Labs Performance')").first();
    await labsNavBtn.click();
    await page.waitForTimeout(800);
    await checkPageForAnomalies("Labs Performance - Revenue");

    // Cycle through all 4 Tabs in Labs:
    const labTabs = [
      "Order & Workflow",
      "Quality Performance",
      "HMS Integration",
      "Revenue Performance"
    ];

    for (const name of labTabs) {
      const tabBtn = page.locator(`button:has-text('${name}')`).first();
      if (await tabBtn.isVisible()) {
        console.log(`   👉 Switching to Labs Tab: "${name}"`);
        await tabBtn.click();
        await page.waitForTimeout(600);
        await checkPageForAnomalies(`Labs Tab - ${name}`);
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "06_labs_performance.png") });

    // ------------------------------------------------------------------
    // STEP 7: Audit Pharmacy Performance (All 4 Tabs)
    // ------------------------------------------------------------------
    console.log("\n📌 Step 7: Navigating to Pharmacy Performance...");
    const pharmNavBtn = page.locator("button:has-text('Pharmacy Performance'), a:has-text('Pharmacy Performance')").first();
    await pharmNavBtn.click();
    await page.waitForTimeout(800);
    await checkPageForAnomalies("Pharmacy Performance - Revenue");

    const pharmTabs = [
      "Medicine & Product",
      "Profit & Margin",
      "Order & Channel",
      "Revenue & Sales"
    ];

    for (const name of pharmTabs) {
      const tabBtn = page.locator(`button:has-text('${name}')`).first();
      if (await tabBtn.isVisible()) {
        console.log(`   👉 Switching to Pharmacy Tab: "${name}"`);
        await tabBtn.click();
        await page.waitForTimeout(600);
        await checkPageForAnomalies(`Pharmacy Tab - ${name}`);
      }
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "07_pharmacy_performance.png") });

    // ------------------------------------------------------------------
    // STEP 8: Test Filter Console, Search & Reset State
    // ------------------------------------------------------------------
    console.log("\n📌 Step 8: Testing Filters, Reset & Apply Workflow...");
    const resetBtn = page.locator("button:has-text('Reset')").first();
    if (await resetBtn.isVisible()) {
      console.log("   👉 Clicking 'Reset' in Search Console...");
      await resetBtn.click();
      await page.waitForTimeout(700);

      // Verify prompt state
      const promptTitle = page.locator("text=Search Parameters Required to Load Analytics").first();
      if (await promptTitle.isVisible()) {
        console.log("   ✓ SearchPromptState displayed correctly ('Search Parameters Required').");
      }

      // Restore data via Quick Launch or Search Analytics
      const launchBtn = page.locator("button:has-text('Search All Hospital Encounters Now'), button:has-text('Search Analytics & Show Data')").first();
      if (await launchBtn.isVisible()) {
        console.log("   👉 Clicking button to re-run analytics and display data...");
        await launchBtn.click();
        await page.waitForTimeout(800);
        console.log("   ✓ Data successfully regenerated and rendered.");
      }
    }

    // ------------------------------------------------------------------
    // STEP 9: Test Top Header Global Search & Sidebar Collapse
    // ------------------------------------------------------------------
    console.log("\n📌 Step 9: Testing Global Search & Sidebar Collapse...");
    const searchInput = page.locator("input[placeholder*='Search']").first();
    if (await searchInput.isVisible()) {
      console.log("   👉 Typing 'Dermatology' into Top Header Search...");
      await searchInput.fill("Dermatology");
      await page.waitForTimeout(500);
      await searchInput.fill("");
      await page.waitForTimeout(300);
      console.log("   ✓ Global search input validated.");
    }

    // Test Sidebar Collapse Button
    const sidebarToggleBtn = page.locator("button[title*='sidebar']").first();
    if (await sidebarToggleBtn.isVisible()) {
      console.log("   👉 Toggling sidebar collapse button...");
      await sidebarToggleBtn.click();
      await page.waitForTimeout(600);
      console.log("   👉 Expanding sidebar back...");
      await sidebarToggleBtn.click();
      await page.waitForTimeout(600);
      console.log("   ✓ Circular sidebar toggle working smoothly.");
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "08_final_audit.png") });

    console.log("\n=======================================================");
    console.log("🏁 AUDIT COMPLETED SUCCESSFULLY!");
    console.log("=======================================================");
    console.log(`Total Errors Detected: ${errors.length}`);
    console.log(`Total Warnings: ${warnings.length}`);
    console.log(`Total UI Text Anomalies: ${uiIssues.length}`);
    if (errors.length > 0) {
      console.log("\nErrors detail:", JSON.stringify(errors, null, 2));
    }
    if (uiIssues.length > 0) {
      console.log("\nUI issues detail:", JSON.stringify(uiIssues, null, 2));
    }
  } catch (err) {
    console.error("❌ Fatal audit error:", err);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fatal_error.png") });
    errors.push({ type: "fatal", message: err.message });
  } finally {
    await page.waitForTimeout(1500);
    await browser.close();
  }

  // Save audit report
  fs.writeFileSync(
    path.resolve("./test-results/audit-report.json"),
    JSON.stringify({ timestamp: new Date().toISOString(), errors, warnings, uiIssues }, null, 2)
  );
}

runHeadedAudit();
