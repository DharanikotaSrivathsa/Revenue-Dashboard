/**
 * Service-level view of what each doctor orders / prescribes / performs:
 * lab tests, lab profiles, procedures, packages and medications.
 *
 * Rules
 *  - Every bill produces its lines exactly once, so nothing is double counted.
 *  - A package bill is one Package line for the whole bill (its tests / medicines are inside the package).
 *  - A lab order becomes a Lab test (one test) or a Profile (a bundle of two or more tests). Imaging (Radiology) is left out.
 *  - Lab revenue is the order's net amount shared by test price, so it adds up to the real lab net.
 *  - The demo data has no item names for procedures, packages and medications, so a name is chosen from the
 *    catalogue in a fixed way per bill. Totals and counts are real; the item names are illustrative.
 */
import { NAMED_PROCEDURES, NAMED_MEDICATIONS, NAMED_PACKAGES } from "./commercialAnalytics.js";

export const SERVICE_TYPES = [
  { id: "test", label: "Lab tests", unit: "tests", color: "#6366f1" },
  { id: "profile", label: "Profiles", unit: "profiles", color: "#7c3aed" },
  { id: "procedure", label: "Procedures", unit: "procedures", color: "#2563eb" },
  { id: "package", label: "Packages", unit: "packages", color: "#d97706" },
  { id: "medication", label: "Medications", unit: "units", color: "#0d9488" }
];

const hash = (str) => {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};
const pickBy = (list, key) => list[hash(key) % list.length];
const shortName = (n) => n.replace(/\s*\(.*?\)/g, "");

export function serviceLines(e) {
  const lines = [];
  const add = (service, name, units, revenue, sub) => {
    if (revenue > 0) lines.push({ service, name, sub, units, revenue, encId: e.id, date: e.date, patient: e.patientName, patientId: e.patientId, doctor: e.doctorName });
  };

  if (e.invoiceType === "PACKAGE") {
    const pkg = pickBy(NAMED_PACKAGES, e.id + "pkg");
    add("package", pkg.name, 1, e.totalNet, pkg.description);
    return lines;
  }

  if (e.hasLab && e.labStatus === "Completed" && e.labGross > 0) {
    const tests = (e.labTests || []).filter((t) => t.category !== "Radiology");
    const base = tests.reduce((s, t) => s + t.basePrice, 0);
    const net = Math.round(e.labNet * (base / e.labGross));
    // The same test can appear twice on one order; a profile lists each different test once.
    const names = [...new Set(tests.map((t) => shortName(t.name)))].sort();
    if (tests.length > 0 && names.length === 1) add("test", tests[0].name, tests.length, net, tests[0].category);
    else if (names.length > 1) add("profile", names.join(" + "), 1, net, `${names.length} tests bundled`);
  }

  if (e.hasProcedure && e.procStatus === "Completed" && e.procNet > 0) {
    const inDept = NAMED_PROCEDURES.filter((p) => p.department === e.department);
    const proc = pickBy(inDept.length ? inDept : NAMED_PROCEDURES, e.id + "proc");
    add("procedure", proc.name, 1, e.procNet, proc.category);
  }

  if (e.hasRx && e.pharmNet > 0) {
    const meds = NAMED_MEDICATIONS.filter((m) => m.category === e.drugCategory);
    const med = meds.length ? pickBy(meds, e.id + "med") : null;
    add("medication", med ? med.name : e.drugCategory || "Other medicines", Math.max(1, Math.round(e.pharmNet / (med ? med.unitMRP : 150))), e.pharmNet, med ? med.category : "Medicine category");
  }
  return lines;
}

const sum = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);

// Every service item sold in the filtered period (by any doctor), with the viewed doctor's figures beside the hospital's.
// Items the viewed doctor never ordered are kept, so the user can search any service and see "not ordered by this doctor".
export function buildServiceIndex(scoped, doctorName) {
  const lines = scoped.flatMap(serviceLines);
  const map = new Map();
  lines.forEach((l) => {
    const key = `${l.service}|${l.name}`;
    const it = map.get(key) || { key, name: l.name, sub: l.sub, service: l.service, hospitalUnits: 0, hospitalRevenue: 0, doctorMap: new Map(), mine: [] };
    it.hospitalUnits += l.units;
    it.hospitalRevenue += l.revenue;
    const d = it.doctorMap.get(l.doctor) || { name: l.doctor, units: 0, revenue: 0 };
    d.units += l.units;
    d.revenue += l.revenue;
    it.doctorMap.set(l.doctor, d);
    if (l.doctor === doctorName) it.mine.push(l);
    map.set(key, it);
  });
  const doctorNames = [...new Set(scoped.map((e) => e.doctorName))];
  return [...map.values()].map((it) => {
    const units = sum(it.mine, (l) => l.units);
    const revenue = sum(it.mine, (l) => l.revenue);
    const doctors = doctorNames
      .map((name) => it.doctorMap.get(name) || { name, units: 0, revenue: 0 })
      .sort((a, b) => b.revenue - a.revenue);
    const rank = revenue > 0 ? doctors.findIndex((d) => d.name === doctorName) + 1 : null;
    return {
      key: it.key,
      name: it.name,
      sub: it.sub,
      service: it.service,
      units,
      revenue,
      patients: new Set(it.mine.map((l) => l.patientId)).size,
      avgPerUnit: units > 0 ? Math.round(revenue / units) : 0,
      hospitalUnits: it.hospitalUnits,
      hospitalRevenue: it.hospitalRevenue,
      sharePct: it.hospitalRevenue > 0 ? Math.round((revenue / it.hospitalRevenue) * 100) : 0,
      doctors,
      rank,
      doctorCount: doctors.filter((d) => d.revenue > 0).length,
      bills: [...it.mine].sort((a, b) => b.date.localeCompare(a.date) || b.encId.localeCompare(a.encId))
    };
  });
}

// Words typed by the user must all appear in the item name, its group, or its service type.
export function searchServices(index, query, serviceId) {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return index.filter((it) => {
    if (serviceId !== "all" && it.service !== serviceId) return false;
    const label = SERVICE_TYPES.find((t) => t.id === it.service)?.label || "";
    const hay = `${it.name} ${it.sub || ""} ${label}`.toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}
