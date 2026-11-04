// Playwright check: Service filter (incl. Walk-in) on the Labs and Pharmacy pages.
// Expected values come from the same seeded dataset the page uses; the UI is read from the DOM.
// Run with the dev server up:  node tests/e2e_walkin_filters.mjs
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { generateEncounters } from "../src/data/mockData.js";
import { computeLabAnalytics, labServiceOf } from "../src/data/labAnalytics.js";
import { computePharmacyAnalytics, pharmServiceOf } from "../src/data/pharmacyAnalytics.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const SHOTS = path.resolve("./test-results/screenshots");
fs.mkdirSync(SHOTS, { recursive: true });

const FROM = "2026-10-01";
const TO = "2026-10-29";
const inRange = generateEncounters().filter((e) => e.date >= FROM && e.date <= TO);

const SERVICES = [
  { value: "All", label: "All Services (4)" },
  { value: "Walk-in", label: "Walk-in · Counter" },
  { value: "OPD", label: "OPD · Outpatient" },
  { value: "IPD", label: "IPD · Inpatient" },
  { value: "OT", label: "OT · Operation Theatre" },
];

const labEnc = (svc) => (svc === "All" ? inRange : inRange.filter((e) => labServiceOf(e) === svc));
// Pharmacy: the Walk-in view must hold exactly the counter (WALK_IN channel) prescriptions.
const pharmEnc = (svc) =>
  svc === "All" ? inRange
    : svc === "Walk-in" ? inRange.filter((e) => e.hasRx && e.pharmChannel === "WALK_IN")
      : inRange.filter((e) => pharmServiceOf(e) === svc);

const results = [];
const record = (name, expected, actual) => {
  const ok = String(expected) === String(actual);
  results.push({ ok, name, expected, actual });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  expected=${expected} actual=${actual}`);
};

// Data-level invariants, independent of the UI: every order belongs to exactly one service line.
const count = (rows, f) => rows.filter(f).length;
const parts = ["Walk-in", "OPD", "IPD", "OT"];
record("Labs · filters sum to All", count(inRange, (e) => e.hasLab),
  parts.reduce((s, p) => s + count(inRange, (e) => e.hasLab && labServiceOf(e) === p), 0));
record("Labs · Walk-in = counter (MANUAL) orders", count(inRange, (e) => e.hasLab && e.labSource === "MANUAL"),
  count(inRange, (e) => e.hasLab && labServiceOf(e) === "Walk-in"));
record("Pharmacy · filters sum to All", count(inRange, (e) => e.hasRx),
  parts.reduce((s, p) => s + count(inRange, (e) => e.hasRx && pharmServiceOf(e) === p), 0));
record("Pharmacy · Walk-in = counter (WALK_IN) sales", count(inRange, (e) => e.hasRx && e.pharmChannel === "WALK_IN"),
  count(inRange, (e) => e.hasRx && pharmServiceOf(e) === "Walk-in"));

// HEADED=1 opens a visible browser (slowed down so the filter changes can be watched).
const headed = !!process.env.HEADED;
const browser = await chromium.launch({ channel: "chrome", headless: !headed, slowMo: headed ? 400 : 0 });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(e.message));

// Reads the big number of the KPI card whose label matches.
const kpi = (label) =>
  page.evaluate((l) => {
    const span = [...document.querySelectorAll("span")].find((s) => s.textContent.trim().toLowerCase() === l.toLowerCase());
    let el = span;
    while (el && !el.querySelector(".text-3xl, .text-2xl")) el = el.parentElement;
    return el ? el.querySelector(".text-3xl, .text-2xl").textContent.trim() : null;
  }, label);

const setService = async (current, target) => {
  await page.locator("button", { hasText: current.label }).first().click();
  await page.locator("button", { hasText: target.label }).last().click();
  await page.getByText("Search Analytics & Show Data").click();
  await page.waitForTimeout(500);
  return target;
};

await page.goto(BASE_URL, { waitUntil: "networkidle" });

async function sweep(section, navLabel, tabLabel, run) {
  console.log(`\n--- ${section} ---`);
  await page.locator("button, a", { hasText: navLabel }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("tab", { name: tabLabel }).first().click();
  let current = SERVICES[0];
  for (const svc of SERVICES) {
    if (svc !== current) current = await setService(current, svc);
    await run(svc);
    await page.screenshot({ path: path.join(SHOTS, `walkin_${section}_${svc.value}.png`) });
  }
  // restore filter for the next section
  if (current !== SERVICES[0]) await setService(current, SERVICES[0]);
}

await sweep("labs", "Labs Performance", /Order & Workflow|Orders/, async (svc) => {
  const L = computeLabAnalytics(labEnc(svc.value));
  record(`Labs · ${svc.value} · Total Orders`, L.orders.total, (await kpi("Total Orders"))?.replace(/,/g, ""));
  if (svc.value === "Walk-in") {
    const body = await page.evaluate(() => document.body.innerText);
    record("Labs · Walk-in · no OPD/IPD orders leak in", "0 OPD/IPD orders", body.includes("0 OPD/IPD orders") ? "0 OPD/IPD orders" : "leak");
  }
});

await sweep("pharmacy", "Pharmacy Performance", /Order & Channel|Orders/, async (svc) => {
  const P = computePharmacyAnalytics(pharmEnc(svc.value));
  record(`Pharmacy · ${svc.value} · Total Orders`, P.totals.orders, (await kpi("Total Pharmacy Orders"))?.replace(/,/g, ""));
});

const body = await page.evaluate(() => document.body.innerText);
record("No NaN/undefined on page", "none", /\bNaN\b|\bundefined\b/.test(body) ? "found" : "none");
record("No uncaught page errors", 0, pageErrors.length);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
