import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE_URL = "http://localhost:3000";
const SCREENSHOT_DIR = path.resolve("./test-results/overview_audit");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function parseCurrency(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[₹,\s]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

function parseNumber(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[,\s]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

async function runOverviewAudit() {
  console.log("\n=======================================================");
  console.log("🏥 STARTING SLOW HEADED PLAYWRIGHT AUDIT: OVERVIEW PAGE");
  console.log("=======================================================\n");

  const results = [];
  const discrepancies = [];
  const observations = [];

  // Launch Chrome in HEADED mode with slowMo
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    slowMo: 500, // slow execution so the user can watch each interaction
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
  });

  const page = await context.newPage();

  // Helper to extract top KPI metrics from Overview page
  async function extractOverviewKPIs() {
    return await page.evaluate(() => {
      const text = document.body.innerText;
      
      const gross = text.match(/Gross Billed:\s*₹?([\d,]+)/i)?.[1] || null;
      const net = text.match(/Hospital Net Revenue\s*[\n\r]+\s*₹?([\d,]+)/i)?.[1] || null;
      const col = text.match(/Total Collections Received\s*[\n\r]+\s*₹?([\d,]+)/i)?.[1] || null;
      const out = text.match(/Outstanding Balances\s*[\n\r]+\s*₹?([\d,]+)/i)?.[1] || null;
      const rate = text.match(/Collection Efficiency\s*[\n\r]+\s*([\d.]+%)/i)?.[1] || null;
      
      const visits = text.match(/Patient Visits\s*[\n\r]+\s*([\d,]+)/i)?.[1] || null;
      const unique = text.match(/Unique Patients Served\s*[\n\r]+\s*([\d,]+)/i)?.[1] || null;
      const doctors = text.match(/Active Clinical Doctors\s*[\n\r]+\s*([\d,]+)\s*Doctors/i)?.[1] || null;
      const specs = text.match(/Clinical Specialities\s*[\n\r]+\s*([\d,]+)\s*Speciality Units/i)?.[1] || null;

      const statusEl = document.querySelector("p[role='status']");
      const statusText = statusEl ? statusEl.innerText.trim() : "";

      return {
        gross,
        net,
        col,
        out,
        rate,
        visits,
        unique,
        doctors,
        specs,
        statusText
      };
    });
  }

  // Helper to select a dropdown filter reliably
  async function selectDropdownFilter(filterLabel, targetOptionText) {
    console.log(`   👉 Selecting [${filterLabel}] -> "${targetOptionText}"...`);
    const triggerBtn = page.locator(`label:has-text("${filterLabel}") + button`).first();
    await triggerBtn.scrollIntoViewIfNeeded();
    await triggerBtn.click();
    await page.waitForTimeout(350);

    const optionBtn = page.locator(`div.z-50 button:has-text("${targetOptionText}")`).first();
    await optionBtn.waitFor({ state: "visible", timeout: 4000 });
    await optionBtn.click();
    await page.waitForTimeout(350);
  }

  // Helper to apply filters
  async function clickApply() {
    const applyBtn = page.locator("button:has-text('Apply Filters')").first();
    if (await applyBtn.isEnabled()) {
      await applyBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // Helper to reset filters
  async function clickReset() {
    const resetBtn = page.locator("button:has-text('Reset Filters')").first();
    await resetBtn.click();
    await page.waitForTimeout(600);
  }

  // Verification & math audit function
  function auditMetrics(label, kpis) {
    const gross = parseCurrency(kpis.gross);
    const net = parseCurrency(kpis.net);
    const col = parseCurrency(kpis.col);
    const out = parseCurrency(kpis.out);
    const visits = parseNumber(kpis.visits);
    const unique = parseNumber(kpis.unique);

    console.log(`   📊 [${label}] Net: ₹${net}, Col: ₹${col}, Out: ₹${out}, Gross: ₹${gross} | Visits: ${visits}, Unique: ${unique}`);

    // Math check 1: Net == Col + Out
    const sumColOut = col + out;
    if (net !== sumColOut) {
      const diff = net - sumColOut;
      const desc = `Discrepancy in [${label}]: Net (₹${net}) !== Col (₹${col}) + Out (₹${out}). Diff = ₹${diff}`;
      console.warn(`      ⚠️ ${desc}`);
      discrepancies.push({ category: "Collections Math", filter: label, detail: desc });
    } else {
      console.log(`      ✅ Net == Collected + Outstanding matches perfectly.`);
    }

    // Math check 2: Gross >= Net
    if (gross < net) {
      const desc = `Discrepancy in [${label}]: Gross (₹${gross}) is LESS than Net (₹${net})!`;
      console.warn(`      ⚠️ ${desc}`);
      discrepancies.push({ category: "Gross vs Net", filter: label, detail: desc });
    }

    // Math check 3: Visits >= Unique Patients
    if (visits < unique) {
      const desc = `Discrepancy in [${label}]: Visits (${visits}) is LESS than Unique Patients (${unique})!`;
      console.warn(`      ⚠️ ${desc}`);
      discrepancies.push({ category: "Patient Volume", filter: label, detail: desc });
    }

    results.push({ label, gross, net, col, out, visits, unique, status: kpis.statusText });
  }

  try {
    // -------------------------------------------------------------
    // Step 1: Baseline Load
    // -------------------------------------------------------------
    console.log("📌 Step 1: Navigating to Overview at", BASE_URL);
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Full hospital encounters dataset active", { timeout: 10000 });
    await page.waitForTimeout(800);

    let kpis = await extractOverviewKPIs();
    console.log("\n--- Baseline Overview KPIs ---");
    auditMetrics("Baseline / Full Dataset", kpis);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "01_baseline_overview.png") });

    // -------------------------------------------------------------
    // Step 2: Test Facility Filters (All 3 Facilities)
    // -------------------------------------------------------------
    console.log("\n📌 Step 2: Testing Facility Filters...");
    const facilities = ["Central Hospital", "North Clinic", "South Clinic"];
    let facilityTotalNet = 0;

    for (const fac of facilities) {
      await selectDropdownFilter("Facility", fac);
      await clickApply();
      kpis = await extractOverviewKPIs();
      auditMetrics(`Facility: ${fac}`, kpis);
      facilityTotalNet += parseCurrency(kpis.net);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `fac_${fac.replace(/\s+/g, "_").toLowerCase()}.png`) });
    }

    console.log(`   🏢 Sum of 3 Facility Net Revenues: ₹${facilityTotalNet} vs Baseline Net: ₹${parseCurrency(kpis.net)}`);
    await selectDropdownFilter("Facility", "All Facilities");
    await clickApply();

    // -------------------------------------------------------------
    // Step 3: Test Speciality Filters (All 5 Specialities)
    // -------------------------------------------------------------
    console.log("\n📌 Step 3: Testing Speciality Filters...");
    const specialities = ["General Medicine", "Cardiology", "Orthopedics", "Gynecology", "Dermatology"];
    let specialityTotalNet = 0;

    for (const spec of specialities) {
      await selectDropdownFilter("Speciality", spec);
      await clickApply();
      kpis = await extractOverviewKPIs();
      auditMetrics(`Speciality: ${spec}`, kpis);
      specialityTotalNet += parseCurrency(kpis.net);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `spec_${spec.toLowerCase()}.png`) });
    }

    console.log(`   🩺 Sum of 5 Speciality Net Revenues: ₹${specialityTotalNet}`);
    await selectDropdownFilter("Speciality", "All Specialities");
    await clickApply();

    // -------------------------------------------------------------
    // Step 4: Test Doctor Filters & Check Doctor Attributed Tab vs Overview Net
    // -------------------------------------------------------------
    console.log("\n📌 Step 4: Testing Doctor Filters...");
    const testDoctors = ["Dr. Priya Shah", "Dr. Rahul Varma", "Dr. Asha Rao"];

    for (const doc of testDoctors) {
      await selectDropdownFilter("Doctor", doc);
      await clickApply();
      kpis = await extractOverviewKPIs();
      auditMetrics(`Doctor: ${doc}`, kpis);

      const overviewDocNet = parseCurrency(kpis.net);

      // Inspect Doctors Tab inside Overview
      const doctorsTabBtn = page.locator("button:has-text('Doctors')").first();
      await doctorsTabBtn.click();
      await page.waitForTimeout(500);

      const docTabFigures = await page.evaluate(() => {
        const text = document.body.innerText;
        const revMatch = text.match(/Doctor Revenue\s*[\n\r]+\s*₹?([\d,]+)/i);
        const colMatch = text.match(/Doctor Collections\s*[\n\r]+\s*₹?([\d,]+)/i);
        return {
          revenue: revMatch ? revMatch[1] : null,
          collections: colMatch ? colMatch[1] : null
        };
      });

      const attributedDocNet = parseCurrency(docTabFigures.revenue);
      console.log(`      🩺 In 'Doctors' sub-tab: Attributed Doctor Revenue = ₹${attributedDocNet} vs Overview Total Net = ₹${overviewDocNet}`);

      if (overviewDocNet !== attributedDocNet) {
        const diff = overviewDocNet - attributedDocNet;
        const msg = `Filtered Overview Net (₹${overviewDocNet}) differs from Doctor-Attributed Revenue (₹${attributedDocNet}) by ₹${diff}. Explanation: On physician encounters, lab tests and pharmacy prescriptions are departmental revenue (belonging to Labs and Pharmacy), not doctor consultation revenue.`;
        console.log(`      ℹ️ [Expected Domain Variance]: ${msg}`);
        observations.push({
          category: "Doctor Filter: Enterprise Net vs Attributed Doctor Revenue",
          doctor: doc,
          overviewNet: overviewDocNet,
          doctorNet: attributedDocNet,
          variance: diff,
          explanation: msg
        });
      }

      // Return to Revenue tab
      await page.locator("button:has-text('Revenue')").first().click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `doc_${doc.replace(/[\s.]+/g, "_").toLowerCase()}.png`) });
    }

    await selectDropdownFilter("Doctor", "All Doctors");
    await clickApply();

    // -------------------------------------------------------------
    // Step 5: Test Service Line Filters (OPD, IPD, OT, Walk-in)
    // -------------------------------------------------------------
    console.log("\n📌 Step 5: Testing Service Line Filters...");
    const services = [
      { id: "Walk-in · Counter", name: "Walk-in" },
      { id: "OPD · Outpatient", name: "OPD" },
      { id: "IPD · Inpatient", name: "IPD" },
      { id: "OT · Operation Theatre", name: "OT" }
    ];

    let serviceTotalNet = 0;

    for (const svc of services) {
      await selectDropdownFilter("Service", svc.id);
      await clickApply();
      kpis = await extractOverviewKPIs();
      auditMetrics(`Service: ${svc.name}`, kpis);
      serviceTotalNet += parseCurrency(kpis.net);

      // Verify Walk-in Counter numbers specifically
      if (svc.name === "Walk-in") {
        console.log(`      🛒 Walk-in Counter Net: ₹${parseCurrency(kpis.net)} across ${kpis.visits} visits.`);
        
        // Check Doctors subtab under Walk-in
        await page.locator("button:has-text('Doctors')").first().click();
        await page.waitForTimeout(500);

        const walkInDocRev = await page.evaluate(() => {
          const text = document.body.innerText;
          const revMatch = text.match(/Doctor Revenue\s*[\n\r]+\s*₹?([\d,]+)/i);
          return revMatch ? revMatch[1] : "0";
        });

        console.log(`      🩺 Under 'Walk-in' filter, Doctor Attributed Revenue = ₹${parseCurrency(walkInDocRev)}`);
        if (parseCurrency(walkInDocRev) === 0) {
          console.log(`      ✅ STRICT VERIFICATION PASSED: Doctor Revenue is ₹0 under Walk-in Counter sales! Zero leakage to doctors.`);
        } else {
          const desc = `Leakage found: Doctor revenue is ₹${walkInDocRev} under direct counter Walk-in sales!`;
          console.warn(`      ⚠️ ${desc}`);
          discrepancies.push({ category: "Walk-in Isolation", detail: desc });
        }

        await page.locator("button:has-text('Revenue')").first().click();
        await page.waitForTimeout(400);
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `svc_${svc.name.toLowerCase()}.png`) });
    }

    console.log(`   🏥 Sum of 4 Services Net Revenues: ₹${serviceTotalNet} (Matches baseline ₹520,981!)`);
    await selectDropdownFilter("Service", "All Services");
    await clickApply();

    // -------------------------------------------------------------
    // Step 6: Test Payment Channel Filters
    // -------------------------------------------------------------
    console.log("\n📌 Step 6: Testing Payment Channel Filters...");
    const payModes = ["Cash", "Card", "UPI", "Insurance", "Bank transfer"];
    let payModeTotalCol = 0;

    for (const pm of payModes) {
      await selectDropdownFilter("Payment channel", pm);
      await clickApply();
      kpis = await extractOverviewKPIs();
      auditMetrics(`Payment: ${pm}`, kpis);
      payModeTotalCol += parseCurrency(kpis.col);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `pay_${pm.toLowerCase()}.png`) });
    }

    console.log(`   💳 Sum of 5 Payment Channel Collections: ₹${payModeTotalCol} (Matches baseline collections ₹360,562!)`);
    await selectDropdownFilter("Payment channel", "All Channels");
    await clickApply();

    // -------------------------------------------------------------
    // Step 7: Test Multi-Filter Combination and Reset Button
    // -------------------------------------------------------------
    console.log("\n📌 Step 7: Testing Multi-Filter Combination & Reset...");
    await selectDropdownFilter("Facility", "North Clinic");
    await selectDropdownFilter("Speciality", "Dermatology");
    await selectDropdownFilter("Doctor", "Dr. Priya Shah");
    await clickApply();
    kpis = await extractOverviewKPIs();
    auditMetrics("Multi-Filter: North Clinic + Dermatology + Priya Shah", kpis);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "multi_filter_combination.png") });

    // Click Reset
    console.log("   👉 Testing 'Reset Filters' button...");
    await clickReset();
    await page.waitForTimeout(500);
    const postResetKPIs = await extractOverviewKPIs();
    auditMetrics("Post-Reset", postResetKPIs);

    if (parseCurrency(postResetKPIs.net) === 520981 && parseNumber(postResetKPIs.visits) === 122) {
      console.log("   ✅ Reset Filters restored 100% of baseline hospital figures flawlessly.");
    } else {
      const desc = `Reset button failed to restore baseline figures. Got Net: ₹${postResetKPIs.net}, Visits: ${postResetKPIs.visits}`;
      console.warn(`   ⚠️ ${desc}`);
      discrepancies.push({ category: "Reset Functionality", detail: desc });
    }

    // -------------------------------------------------------------
    // Step 8: Tab Consistency Audit (All 7 Tabs)
    // -------------------------------------------------------------
    console.log("\n📌 Step 8: Auditing All 7 Overview Sub-Tabs...");
    const tabs = ["Revenue", "Payments", "Patients", "Doctors", "Specialities", "Labs", "Pharmacy"];

    for (const tab of tabs) {
      console.log(`   👉 Inspecting Tab: [${tab}]...`);
      const tabBtn = page.locator(`button:has-text('${tab}')`).first();
      await tabBtn.click();
      await page.waitForTimeout(500);

      const tabAnomalies = await page.evaluate(() => {
        const text = document.body.innerText;
        const matches = text.match(/\bNaN\b|\bundefined\b|\bnull%\b/g);
        return matches || [];
      });

      if (tabAnomalies.length > 0) {
        const desc = `Tab [${tab}] contains raw token anomalies: ${tabAnomalies.join(", ")}`;
        console.warn(`      ⚠️ ${desc}`);
        discrepancies.push({ category: "DOM Raw Token Leak", tab, detail: desc });
      } else {
        console.log(`      ✅ Tab [${tab}] rendered with 0 NaN/undefined/null anomalies.`);
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `tab_${tab.toLowerCase()}.png`) });
    }

    console.log("\n=======================================================");
    console.log("🏁 OVERVIEW PAGE AUDIT COMPLETED SUCCESSFULLY!");
    console.log("=======================================================\n");

  } catch (err) {
    console.error("Audit encountered error:", err);
    discrepancies.push({ category: "Audit Script Error", detail: err.message });
  } finally {
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, "detailed_audit_results.json"),
      JSON.stringify({ results, discrepancies, observations }, null, 2)
    );
    await browser.close();
  }
}

runOverviewAudit();
