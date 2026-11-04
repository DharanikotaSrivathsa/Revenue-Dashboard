/**
 * Hospital-wide analytics for the Overview page.
 *
 * Rules:
 *  - Revenue is the net amount on each bill. A bill belongs to exactly one invoice type, so nothing is counted twice.
 *  - Billed = net + discounts + refunds, so billed, net, collected and outstanding are always kept apart and reconcile.
 *  - Collections are the payments received on the bill (never the invoice total). Outstanding = net - collected.
 *  - Doctor figures reuse the single-doctor rules (own services, packages and IPD bills only), so the Overview
 *    and each doctor's page always agree.
 *  - Imaging (Radiology) is kept out of lab investigation counts.
 */
import { DOCTORS, DEPARTMENTS, LAB_TEST_TYPES } from "./mockData.js";
import { summarise as summariseDoctor, bucketKey, bucketLabel, bucketKeysInRange, previousRange } from "./doctorAnalytics.js";

export { previousRange };

// Service line a visit belongs to (same values as the Service filter on the other pages)
export const SERVICE_OPTIONS = [
  { id: "OPD", label: "OPD · Outpatient" },
  { id: "IPD", label: "IPD · Inpatient" },
  { id: "OT", label: "OT · Operation Theatre" },
  { id: "Walk-in", label: "Walk-in · Counter" }
];

export const INVOICE_TYPES = [
  { id: "REGISTRATION", label: "Registration" },
  { id: "CONSULTATION", label: "Consultation" },
  { id: "TREATMENT", label: "Treatment" },
  { id: "SERVICE", label: "Service" },
  { id: "IPD", label: "IPD" },
  { id: "PACKAGE", label: "Package" }
];

const LAB_SOURCES = { OPENMRS_ORDER: "Doctor orders", MANUAL: "Walk-in / manual", PACKAGE_PAID: "Package paid" };
const CHANNELS = { OPD: "OPD", WALK_IN: "Walk-in", IPD_OT: "IPD / OT" };
const PHARM_STATUS = { Dispensed: "Fully dispensed", Partial: "Partially dispensed", Returned: "Returned" };

const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);
const pct = (n, d) => (d > 0 ? Math.round((n / d) * 1000) / 10 : 0);
const countBy = (arr, keyFn) => {
  const m = new Map();
  arr.forEach((x) => { const k = keyFn(x); m.set(k, (m.get(k) || 0) + 1); });
  return m;
};
const sumBy = (arr, keyFn, valFn) => {
  const m = new Map();
  arr.forEach((x) => { const k = keyFn(x); m.set(k, (m.get(k) || 0) + valFn(x)); });
  return m;
};

export function money(e) {
  const done = e.consultStatus === "Completed";
  const procDone = e.hasProcedure && e.procStatus === "Completed";
  const labDone = e.hasLab && e.labStatus === "Completed";
  const gross = (done ? e.consultFee : 0) + (procDone ? e.procGross : 0) + (labDone ? e.labGross : 0) + (e.hasRx ? e.pharmGross : 0);
  const refund = (done ? e.consultRefund : 0) + (procDone ? e.procRefund : 0) + (labDone ? e.labRefund : 0) + (e.hasRx ? e.pharmReturn : 0);
  const net = e.totalNet;
  const discount = Math.max(0, gross - refund - net);
  return { net, discount, refund, billed: net + discount + refund };
}

export const applyFilters = (list, f) =>
  list.filter(
    (e) =>
      (!f.from || e.date >= f.from) &&
      (!f.to || e.date <= f.to) &&
      (f.facility === "All" || e.facility === f.facility) &&
      (f.dept === "All" || e.department === f.dept) &&
      (f.doctor === "All" || e.doctorName === f.doctor) &&
      (f.payMode === "All" || e.payMode === f.payMode) &&
      (!f.service || f.service === "All" || e.serviceType === f.service)
  );

// Per day / week / month series. fields: { name: (encounter) => number }
export function series(encounters, view, from, to, fields) {
  const names = Object.keys(fields);
  const blank = (key) => ({ key, label: bucketLabel(key, view), ...Object.fromEntries(names.map((n) => [n, 0])) });
  const map = new Map(bucketKeysInRange(from, to, view).map((k) => [k, blank(k)]));
  encounters.forEach((e) => {
    const k = bucketKey(e.date, view);
    if (!map.has(k)) map.set(k, blank(k));
    const row = map.get(k);
    names.forEach((n) => { row[n] += fields[n](e); });
  });
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

// A patient visit is a completed doctor consultation or a walk-in counter visit (no doctor involved).
// Doctor scorecards still count consultations only; the hospital view also counts counter customers.
const isCounterVisit = (e) => e.doctorId === "DOC-WALKIN";
function patientStats(encounters) {
  const visits = encounters.filter((e) => e.consultStatus === "Completed" || isCounterVisit(e));
  const ids = new Set(visits.map((e) => e.patientId));
  // New vs returning. Consultations carry their own flag. A counter visit has none (by design), so it counts as
  // returning when the patient had an earlier consultation (historicalVisitIndex) or an earlier counter visit here.
  const seenAtCounter = new Set();
  const kinds = [...visits]
    .sort((x, y) => x.date.localeCompare(y.date) || x.id.localeCompare(y.id))
    .map((e) => {
      if (!isCounterVisit(e)) return e.isReturningPatient ? "returning" : "new";
      const returning = e.historicalVisitIndex > 0 || seenAtCounter.has(e.patientId);
      seenAtCounter.add(e.patientId);
      return returning ? "returning" : "new";
    });
  const days = new Set(visits.map((e) => e.date)).size;
  const perPatient = new Map();
  visits.forEach((e) => perPatient.set(e.patientId, (perPatient.get(e.patientId) || 0) + 1));
  const counts = [...perPatient.values()];
  return {
    visits: visits.length,
    counterVisits: visits.filter(isCounterVisit).length,
    unique: ids.size,
    newP: kinds.filter((k) => k === "new").length,
    returning: kinds.filter((k) => k === "returning").length,
    perDay: days > 0 ? Number((visits.length / days).toFixed(2)) : 0,
    ageBins: [
      { name: "Under 30", test: (a) => a < 30 },
      { name: "30–39", test: (a) => a >= 30 && a < 40 },
      { name: "40–49", test: (a) => a >= 40 && a < 50 },
      { name: "50–59", test: (a) => a >= 50 && a < 60 },
      { name: "60+", test: (a) => a >= 60 }
    ].map((b) => ({ name: b.name, value: visits.filter((e) => b.test(e.patientAge)).length })),
    gender: ["Female", "Male"].map((g) => ({ name: g, value: visits.filter((e) => e.patientGender === g).length })),
    frequency: [
      { name: "1 visit", value: counts.filter((c) => c === 1).length },
      { name: "2 visits", value: counts.filter((c) => c === 2).length },
      { name: "3 visits", value: counts.filter((c) => c === 3).length },
      { name: "4+ visits", value: counts.filter((c) => c >= 4).length }
    ]
  };
}

export function summariseHospital(encounters) {
  const rows = encounters.map((e) => ({ e, m: money(e) }));
  const billed = rows.filter((r) => r.m.billed > 0);
  const base = summariseDoctor(encounters); // patient and clinical counts (not its revenue)

  const net = sum(billed, (r) => r.m.net);
  const collected = sum(billed, (r) => r.e.collected);
  const totals = {
    net,
    collected,
    outstanding: sum(billed, (r) => r.e.outstanding),
    gross: sum(billed, (r) => r.m.billed),
    discount: sum(billed, (r) => r.m.discount),
    refund: sum(billed, (r) => r.m.refund),
    rate: pct(collected, net)
  };

  const byType = INVOICE_TYPES.map((t) => ({ ...t, value: sum(billed.filter((r) => r.e.invoiceType === t.id), (r) => r.m.net) }));

  const payModes = base.payModes.map((m) => ({
    id: m.id,
    label: m.label,
    value: sum(billed.filter((r) => r.e.payMode === m.id), (r) => r.e.collected)
  }));
  const status = {
    Paid: billed.filter((r) => r.e.paymentStatus === "Paid").length,
    Partial: billed.filter((r) => r.e.paymentStatus === "Partial").length,
    Unpaid: billed.filter((r) => r.e.paymentStatus === "Unpaid").length
  };
  const refunded = billed.filter((r) => r.m.refund > 0);

  // Departments
  const completed = encounters.filter((e) => e.consultStatus === "Completed" || isCounterVisit(e)); // visits incl. walk-in counter
  const departments = DEPARTMENTS.map((d) => {
    const es = encounters.filter((e) => e.department === d.name);
    const s = summariseDoctor(es);
    const net = sum(es, (e) => e.totalNet);
    const collected = sum(es, (e) => e.collected);
    const deptVisits = es.filter((e) => e.consultStatus === "Completed" || isCounterVisit(e));
    return {
      name: d.name,
      visits: deptVisits.length,
      unique: new Set(deptVisits.map((e) => e.patientId)).size,
      net,
      collected,
      outstanding: sum(es, (e) => e.outstanding),
      doctors: new Set(es.map((e) => e.doctorId)).size,
      followups: s.clinical.followup.completed,
      labOrders: s.clinical.labOrders,
      procedures: s.clinical.procedures,
      admissions: s.clinical.admissions,
      consultation: sum(es, (e) => e.consultNet || 0),
      procedureRev: sum(es, (e) => e.procNet || 0),
      lab: sum(es, (e) => e.labNet || 0),
      pharmacy: sum(es, (e) => e.pharmNet || 0),
      count: es.length
    };
  }).filter((d) => d.count > 0);

  // Doctors (own services, packages and IPD, same rules as the doctor page)
  const doctors = DOCTORS.map((d) => {
    const es = encounters.filter((e) => e.doctorName === d.name);
    if (!es.length) return null;
    const s = summariseDoctor(es);
    return {
      name: d.name,
      short: d.name.replace("Dr. ", ""),
      dept: d.dept,
      visits: s.nonRev.totalPatientVisits,
      unique: s.nonRev.uniquePatients,
      newP: s.nonRev.newPatients,
      returning: s.nonRev.returningPatients,
      followups: s.clinical.followup.completed,
      prescriptions: s.clinical.prescriptions,
      labOrders: s.clinical.labOrders,
      procedures: s.clinical.procedures,
      referrals: s.clinical.referrals,
      admissions: s.clinical.admissions,
      revenue: s.revenue.net,
      collections: s.revenue.collected
    };
  }).filter(Boolean);

  const facilityVisits = [...countBy(completed, (e) => e.facility)].map(([name, value]) => ({ name, value }));

  // Laboratory (imaging excluded)
  const nonImaging = (e) => (e.labTests || []).filter((t) => t.category !== "Radiology");
  // Hospital-wide: every lab order counts, including walk-in counter orders (those have no doctor order id by design)
  const labOrders = encounters.filter((e) => e.hasLab && nonImaging(e).length > 0);
  const labTests = labOrders.flatMap((e) => nonImaging(e).map((t) => ({ t, status: e.labStatus })));
  const labDone = labOrders.filter((e) => e.labStatus === "Completed");
  const lab = {
    requisitions: labOrders.length,
    tests: labTests.length,
    completed: labTests.filter((x) => x.status === "Completed").length,
    pending: labTests.filter((x) => x.status === "Pending").length,
    cancelled: labTests.filter((x) => x.status === "Cancelled").length,
    revenue: sum(labDone, (e) => e.labGross),
    refunds: sum(labDone, (e) => e.labRefund),
    net: sum(labOrders, (e) => e.labNet),
    collections: sum(labOrders, (e) => (e.totalNet > 0 ? Math.round(e.collected * (e.labNet / e.totalNet)) : 0)),
    avgTurnaround: 0,
    completionRate: 0
  };
  const doneTests = labTests.filter((x) => x.status === "Completed");
  lab.avgTurnaround = doneTests.length ? Math.round(sum(doneTests, (x) => x.t.avgTurnaroundMins) / doneTests.length) : 0;
  lab.completionRate = pct(lab.completed, lab.tests);
  lab.byDiscipline = [...countBy(labTests, (x) => x.t.category)].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  lab.bySource = [...sumBy(labOrders, (e) => LAB_SOURCES[e.labSource] || e.labSource, (e) => e.labNet)].map(([name, value]) => ({ name, value }));
  const tat = new Map(LAB_TEST_TYPES.map((t) => [t.name, t.avgTurnaroundMins]));
  lab.turnaround = [...new Set(labTests.map((x) => x.t.name))]
    .map((name) => ({ name: name.replace(/\s*\(.*\)/, ""), value: tat.get(name) || 0 }))
    .sort((a, b) => b.value - a.value);

  // Pharmacy
  const rx = encounters.filter((e) => e.hasRx);
  const exclTax = sum(rx, (e) => e.pharmNetExclTax);
  const grossProfit = sum(rx, (e) => e.pharmGrossProfit);
  const pharmacy = {
    prescriptions: rx.length,
    full: rx.filter((e) => e.pharmStatus === "Dispensed").length,
    partial: rx.filter((e) => e.pharmStatus === "Partial").length,
    returned: rx.filter((e) => e.pharmStatus === "Returned").length,
    gross: sum(rx, (e) => e.pharmGross),
    returns: sum(rx, (e) => e.pharmReturn),
    net: sum(rx, (e) => e.pharmNet),
    gst: sum(rx, (e) => e.pharmTaxAmount),
    cogs: sum(rx, (e) => e.pharmCOGS),
    grossProfit,
    margin: pct(grossProfit, exclTax)
  };
  pharmacy.discount = Math.max(0, pharmacy.gross - pharmacy.returns - pharmacy.net);
  pharmacy.byChannel = [...sumBy(rx, (e) => CHANNELS[e.pharmChannel] || e.pharmChannel, (e) => e.pharmNet)].map(([name, value]) => ({ name, value }));
  pharmacy.byStatus = Object.entries(PHARM_STATUS).map(([k, name]) => ({ name, value: rx.filter((e) => e.pharmStatus === k).length }));
  const cats = new Map();
  rx.forEach((e) => {
    const name = (e.drugCategory || "Other").split(" & ")[0];
    const c = cats.get(name) || { name, revenue: 0, profit: 0, excl: 0 };
    c.revenue += e.pharmNet;
    c.profit += e.pharmGrossProfit;
    c.excl += e.pharmNetExclTax;
    cats.set(name, c);
  });
  pharmacy.byCategory = [...cats.values()].map((c) => ({ ...c, value: c.revenue, margin: pct(c.profit, c.excl) })).sort((a, b) => b.revenue - a.revenue);

  const invoices = billed
    .map(({ e, m }) => ({
      id: e.id,
      date: e.date,
      patient: e.patientName,
      type: e.invoiceType,
      dept: e.department,
      doctor: e.doctorName,
      billed: m.billed,
      discount: m.discount,
      refund: m.refund,
      collected: e.collected,
      outstanding: e.outstanding,
      payMode: e.payMode,
      status: e.paymentStatus
    }))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));

  return {
    totals,
    byType,
    payModes,
    status,
    refunded: { count: refunded.length, amount: sum(refunded, (r) => r.m.refund) },
    departments,
    doctors,
    facilityVisits,
    lab,
    pharmacy,
    invoices,
    patients: patientStats(encounters),
    activeDoctors: doctors.length,
    activeDepartments: departments.length
  };
}
