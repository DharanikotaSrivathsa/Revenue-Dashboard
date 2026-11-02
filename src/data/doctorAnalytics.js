/**
 * Individual doctor analytics.
 *
 * Revenue attribution rules:
 *  - Only completed items count (cancelled / no-show consults and cancelled procedures are not billed revenue).
 *  - Package bills and IPD (inpatient) bills are attributed to the doctor in full (the package / admission is booked against them)
 *    and shown as Package and IPD.
 *  - All other bills count only the doctor's own services: consultation / follow-up and procedures (Procedure).
 *    Lab and pharmacy lines on a normal bill belong to those departments, not to the doctor.
 *  - Collections come from payments allocated to the bill, scaled to the doctor's share of that bill.
 *  - Billed = net + discounts + refunds, so the reconciliation always balances.
 */
import { calculateNonRevenueMetrics } from "./nonRevenueCalculations.js";

export const PAY_MODES = [
  { id: "Cash", label: "Cash" },
  { id: "Card", label: "Card" },
  { id: "UPI", label: "UPI / Digital" },
  { id: "Insurance", label: "Insurance / TPA" },
  { id: "Bank transfer", label: "Bank Transfer / NEFT" }
];

const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);

function attribute(e) {
  const isPkg = e.invoiceType === "PACKAGE";
  const isIpd = e.invoiceType === "IPD";
  const whole = isPkg || isIpd;
  const wholeKey = isIpd ? "ipd" : "package";
  const items = [];
  if (e.consultStatus === "Completed") {
    items.push({ svc: whole ? wholeKey : e.isFollowUp ? "followup" : "consultation", gross: e.consultFee, refund: e.consultRefund, net: e.consultNet });
  }
  if (e.hasProcedure && e.procStatus === "Completed") {
    items.push({ svc: whole ? wholeKey : "treatment", gross: e.procGross, refund: e.procRefund, net: e.procNet });
  }
  if (whole && e.hasLab && e.labStatus === "Completed") {
    items.push({ svc: wholeKey, gross: e.labGross, refund: e.labRefund, net: e.labNet });
  }
  if (whole && e.hasRx) {
    items.push({ svc: wholeKey, gross: e.pharmGross, refund: e.pharmReturn, net: e.pharmNet });
  }

  const svc = { consultation: 0, followup: 0, treatment: 0, package: 0, ipd: 0 };
  let gross = 0, refund = 0, net = 0;
  items.forEach((i) => {
    svc[i.svc] += i.net;
    gross += i.gross || 0;
    refund += i.refund || 0;
    net += i.net || 0;
  });
  const discount = Math.max(0, gross - refund - net);
  const billed = net + discount + refund;
  const collected = e.totalNet > 0 ? Math.min(net, Math.round(e.collected * (net / e.totalNet))) : 0;
  return { svc, billed, discount, refund, net, collected, outstanding: Math.max(0, net - collected) };
}

// Dates are handled as UTC calendar days so the result never shifts with the viewer's timezone.
const toDate = (iso) => new Date(iso + "T00:00:00Z");
const toIso = (d) => d.toISOString().slice(0, 10);
const addDays = (iso, n) => { const d = toDate(iso); d.setUTCDate(d.getUTCDate() + n); return toIso(d); };
const weekStart = (iso) => addDays(iso, -((toDate(iso).getUTCDay() + 6) % 7));

export const bucketKey = (date, view) => (view === "monthly" ? date.slice(0, 7) : view === "weekly" ? weekStart(date) : date);
export const bucketLabel = (key, view) => (view === "monthly" ? key : view === "weekly" ? `Wk ${key.slice(5)}` : key.slice(5));

export function summarise(encounters) {
  const rows = encounters.map((e) => ({ e, a: attribute(e) }));
  const billedRows = rows.filter((r) => r.a.billed > 0);

  const total = (k) => sum(billedRows, (r) => r.a[k]);
  const svc = (k) => sum(billedRows, (r) => r.a.svc[k]);
  const revenue = {
    consultation: svc("consultation"),
    followup: svc("followup"),
    treatment: svc("treatment"),
    package: svc("package"),
    ipd: svc("ipd"),
    billed: total("billed"),
    discount: total("discount"),
    refund: total("refund"),
    net: total("net"),
    collected: total("collected"),
    outstanding: total("outstanding")
  };
  revenue.collectionRate = pct(revenue.collected, revenue.net);

  const payModes = PAY_MODES.map((m) => ({
    ...m,
    value: sum(billedRows.filter((r) => r.e.payMode === m.id), (r) => r.a.collected)
  }));
  const status = {
    Paid: billedRows.filter((r) => r.e.paymentStatus === "Paid").length,
    Partial: billedRows.filter((r) => r.e.paymentStatus === "Partial").length,
    Unpaid: billedRows.filter((r) => r.e.paymentStatus === "Unpaid").length
  };

  const completed = encounters.filter((e) => e.consultStatus === "Completed");
  const nonRev = calculateNonRevenueMetrics(encounters);

  // Patients
  const ageBins = [
    { name: "Under 30", test: (a) => a < 30 },
    { name: "30–39", test: (a) => a >= 30 && a < 40 },
    { name: "40–49", test: (a) => a >= 40 && a < 50 },
    { name: "50–59", test: (a) => a >= 50 && a < 60 },
    { name: "60+", test: (a) => a >= 60 }
  ].map((b) => ({ name: b.name, value: completed.filter((e) => b.test(e.patientAge)).length }));
  const gender = ["Female", "Male"].map((g) => ({ name: g, value: completed.filter((e) => e.patientGender === g).length }));
  const perPatient = new Map();
  completed.forEach((e) => perPatient.set(e.patientId, (perPatient.get(e.patientId) || 0) + 1));
  const counts = [...perPatient.values()];
  const frequency = [
    { name: "1 visit", value: counts.filter((c) => c === 1).length },
    { name: "2 visits", value: counts.filter((c) => c === 2).length },
    { name: "3 visits", value: counts.filter((c) => c === 3).length },
    { name: "4+ visits", value: counts.filter((c) => c >= 4).length }
  ];

  // Clinical workflow. Imaging (Radiology) is not a laboratory investigation.
  const labTestsOf = (e) => (e.labTests || []).filter((t) => t.category !== "Radiology");
  const labOrders = encounters.filter((e) => e.hasLab && e.labOrderId && labTestsOf(e).length > 0);
  const followUps = encounters.filter((e) => e.isFollowUp);
  const followup = {
    completed: followUps.filter((e) => e.consultStatus === "Completed").length,
    pending: followUps.filter((e) => e.consultStatus === "Pending" || e.consultStatus === "Scheduled").length,
    cancelled: followUps.filter((e) => e.consultStatus === "Cancelled").length,
    missed: followUps.filter((e) => e.consultStatus === "No-show").length
  };
  const clinical = {
    prescriptions: nonRev.prescriptionsWritten,
    labOrders: labOrders.length,
    labTests: sum(labOrders, (e) => labTestsOf(e).length),
    procedures: nonRev.proceduresPerformed,
    referrals: nonRev.referralsMade,
    admissions: nonRev.admissionsInitiated,
    followup
  };

  const ops = {
    consultsBooked: encounters.length,
    consultsCompleted: completed.length,
    admissions: nonRev.admissionsInitiated,
    linkedAdmissions: encounters.filter((e) => e.admissionId && e.invoiceType === "IPD").length
  };

  return { rows, billedRows, revenue, payModes, status, nonRev, ageBins, gender, frequency, clinical, ops, completed };
}

export function bucketKeysInRange(from, to, view) {
  const keys = [];
  if (!from || !to || from > to) return keys;
  if (view === "monthly") {
    let [y, m] = from.slice(0, 7).split("-").map(Number);
    const last = to.slice(0, 7);
    for (;;) {
      const k = `${y}-${String(m).padStart(2, "0")}`;
      keys.push(k);
      if (k >= last) break;
      m += 1;
      if (m > 12) { m = 1; y += 1; }
    }
    return keys;
  }
  const step = view === "weekly" ? 7 : 1;
  for (let d = view === "weekly" ? weekStart(from) : from; d <= to; d = addDays(d, step)) keys.push(d);
  return keys;
}

export function revenueTrend(billedRows, view, from, to) {
  const map = new Map(bucketKeysInRange(from, to, view).map((k) => [k, { key: k, billed: 0, net: 0, collected: 0 }]));
  billedRows.forEach(({ e, a }) => {
    const k = bucketKey(e.date, view);
    const cur = map.get(k) || { key: k, billed: 0, net: 0, collected: 0 };
    cur.billed += a.billed;
    cur.net += a.net;
    cur.collected += a.collected;
    map.set(k, cur);
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key)).map((d) => ({ ...d, label: bucketLabel(d.key, view) }));
}

// Daily series for count-based line charts, filled so every day in the period shows.
export function dailySeries(encounters, from, to, fields) {
  const days = [];
  if (from && to) {
    for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  }
  const map = new Map(days.map((d) => [d, { key: d, label: d.slice(5), ...Object.fromEntries(Object.keys(fields).map((f) => [f, 0])) }]));
  encounters.forEach((e) => {
    const row = map.get(e.date);
    if (!row) return;
    Object.entries(fields).forEach(([f, fn]) => { row[f] += fn(e); });
  });
  return [...map.values()];
}

export function previousRange(from, to) {
  if (!from || !to) return null;
  const len = Math.round((toDate(to) - toDate(from)) / 86400000) + 1;
  const pTo = addDays(from, -1);
  return { from: addDays(pTo, -(len - 1)), to: pTo };
}

export const invoiceRows = (rows) =>
  rows
    .filter((r) => r.a.billed > 0)
    .sort((x, y) => y.e.date.localeCompare(x.e.date) || y.e.id.localeCompare(x.e.id))
    .map(({ e, a }) => ({
      id: e.id,
      date: e.date,
      patient: e.patientName,
      type: e.invoiceType,
      billed: a.billed,
      discount: a.discount,
      refund: a.refund,
      collected: a.collected,
      outstanding: a.outstanding,
      payMode: e.payMode,
      status: e.paymentStatus
    }));
