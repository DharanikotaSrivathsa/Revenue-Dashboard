// Laboratory analytics derived from the encounter dataset.
// Incorporates the real-world clinical LIS lifecycle:
// - Customer Streams: OPD (Outpatient), IPD (Inpatient), Walk-in (Counter)
// - Order Catalog Types: Individual Tests, Profiles, and Doctor Portal Packages
// - Clinical Funnel: Sample Collection -> Sample Accepted -> Result Entry -> Validation -> Completed
// Fields are derived from a stable hash of the encounter id, ensuring deterministic consistency across renders.

const hash01 = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

const pickBy = (r, items) => items[Math.min(items.length - 1, Math.floor(r * items.length))];

export const FUNNEL_STAGES = [
  "Sample Collection",
  "Sample Accepted",
  "Result Entry",
  "Validation",
  "Completed"
];

export const REJECTION_REASONS = [
  "Hemolyzed",
  "Insufficient volume",
  "Clotted",
  "Wrong container",
  "Mislabelled",
  "Delayed transport"
];

export const PAY_MODES = ["Cash", "Card", "UPI", "Insurance", "Bank transfer"];
export const CUSTOMER_TYPES = ["OPD", "IPD", "Walk-in"];
export const ORDER_TYPES = ["Individual Test", "Profile", "Doctor Portal Package"];

const bump = (map, key, by = 1) => {
  map[key] = (map[key] || 0) + by;
};

const toRows = (map, keyName = "name") =>
  Object.entries(map).map(([k, v]) => ({ [keyName]: k, value: v }));

const weekLabel = (date) => `Wk ${Math.ceil(Number(date.slice(8, 10)) / 7)} · ${date.slice(5, 7)}/${date.slice(2, 4)}`;

// Lab service line. Only counter ("MANUAL") lab orders are Walk-in, and every one of them is.
// The encounter-level serviceType is also Walk-in when just the pharmacy sale was a counter sale,
// so for labs such encounters fall back to OPD.
export const labServiceOf = (e) => {
  if (e.labSource === "MANUAL") return "Walk-in";
  if (e.serviceType === "Walk-in") return "OPD";
  return e.serviceType;
};

export function computeLabAnalytics(encounters = []) {
  const labs = encounters.filter((e) => e.hasLab);

  const revenue = { gross: 0, discounts: 0, refunds: 0, net: 0, collected: 0, outstanding: 0 };
  const payMode = {};
  const dept = {};
  const test = {};
  const trend = { daily: {}, weekly: {}, monthly: {} };

  // Customer streams: OPD, IPD, Walk-in
  const customers = {
    OPD: { name: "OPD", count: 0, completed: 0, gross: 0, discount: 0, refund: 0, net: 0 },
    IPD: { name: "IPD", count: 0, completed: 0, gross: 0, discount: 0, refund: 0, net: 0 },
    "Walk-in": { name: "Walk-in", count: 0, completed: 0, gross: 0, discount: 0, refund: 0, net: 0 }
  };

  // Order types: Individual Tests, Profiles, Doctor Portal Packages
  const orderTypes = {
    "Individual Test": { name: "Individual Test", count: 0, completed: 0, gross: 0, discount: 0, refund: 0, net: 0 },
    "Profile": { name: "Profile", count: 0, completed: 0, gross: 0, discount: 0, refund: 0, net: 0 },
    "Doctor Portal Package": { name: "Doctor Portal Package", count: 0, completed: 0, gross: 0, discount: 0, refund: 0, net: 0 }
  };

  const orders = {
    total: labs.length,
    opd: 0,
    ipd: 0,
    walkIn: 0,
    doctorPortalPackages: 0,
    stage: {
      "Sample Collection": 0,
      "Sample Accepted": 0,
      "Result Entry": 0,
      "Validation": 0,
      "Completed": 0
    },
    cancelled: 0,
    samplesCollected: 0,
    samplesRejected: 0,
    testsPerformed: 0,
    daily: {},
    byDept: {},
  };

  const quality = { abnormal: 0, retests: 0, cancelled: 0, reasons: {} };
  const hms = { received: 0, confirmed: 0, byLocation: {}, byVisitType: { OPD: 0, IPD: 0, "Walk-in": 0 } };

  labs.forEach((e) => {
    const completed = e.labStatus === "Completed";
    const cancelled = e.labStatus === "Cancelled";

    // 1. Customer classification
    const customerType = e.labSource === "MANUAL"
      ? "Walk-in"
      : (e.admissionInitiated || e.serviceType === "IPD")
        ? "IPD"
        : "OPD";

    // 2. Order catalog classification
    const orderItemType = (e.isPackagePaid || e.labSource === "PACKAGE_PAID" || e.invoiceType === "PACKAGE")
      ? "Doctor Portal Package"
      : (e.labType === "PROFILE_BUNDLE" || (e.labTests && e.labTests.length > 1))
        ? "Profile"
        : "Individual Test";

    customers[customerType].count += 1;
    orderTypes[orderItemType].count += 1;

    if (customerType === "OPD") orders.opd += 1;
    else if (customerType === "IPD") orders.ipd += 1;
    else orders.walkIn += 1;

    if (orderItemType === "Doctor Portal Package") orders.doctorPortalPackages += 1;

    // ---- Revenue (completed receipts) ----
    if (completed) {
      const grossVal = e.labGross || 0;
      const discVal = e.labDiscount || 0;
      const refVal = e.labRefund || 0;
      const netVal = e.labNet || 0;

      revenue.gross += grossVal;
      revenue.discounts += discVal;
      revenue.refunds += refVal;
      revenue.net += netVal;

      customers[customerType].completed += 1;
      customers[customerType].gross += grossVal;
      customers[customerType].discount += discVal;
      customers[customerType].refund += refVal;
      customers[customerType].net += netVal;

      orderTypes[orderItemType].completed += 1;
      orderTypes[orderItemType].gross += grossVal;
      orderTypes[orderItemType].discount += discVal;
      orderTypes[orderItemType].refund += refVal;
      orderTypes[orderItemType].net += netVal;

      const paidShare = e.totalNet > 0 ? e.collected / e.totalNet : 1;
      const collected = Math.round(netVal * paidShare);
      revenue.collected += collected;
      revenue.outstanding += netVal - collected;

      bump(payMode, e.payMode || "Cash", netVal);

      const gross = e.labGross || 1;
      (e.labTests || []).forEach((t) => {
        const share = Math.round(netVal * (t.basePrice / gross));
        bump(dept, t.category, share);
        const share_ = t.basePrice / gross;
        const row = test[t.name] || (test[t.name] = { name: t.name, category: t.category, value: 0, gross: 0, discount: 0, bought: 0, refundedUnits: 0, refundedAmount: 0 });
        row.value += share;
        row.gross += t.basePrice;
        row.discount += Math.round(discVal * share_);
        row.bought += 1;
        if (refVal > 0) {
          row.refundedUnits += 1;
          row.refundedAmount += Math.round(refVal * share_);
        }
      });

      const d = e.date;
      bump(trend.daily, d, netVal);
      bump(trend.weekly, weekLabel(d), netVal);
      bump(trend.monthly, d.slice(0, 7), netVal);
    }

    // ---- 5-Stage Clinical LIS Lifecycle ----
    let stage;
    if (completed) {
      stage = "Completed";
    } else if (cancelled) {
      stage = "Cancelled";
    } else {
      stage = pickBy(hash01(e.id + "stage"), [
        "Sample Collection",
        "Sample Accepted",
        "Result Entry",
        "Validation"
      ]);
    }

    if (stage === "Cancelled") {
      orders.cancelled += 1;
      quality.cancelled += 1;
    } else {
      orders.stage[stage] += 1;
    }

    // Specimen collected at Sample Collection and forwarded for accessioning
    const sampleTaken = stage === "Sample Accepted" || stage === "Result Entry" || stage === "Validation" || stage === "Completed";
    if (sampleTaken) {
      orders.samplesCollected += 1;
      // Rejections occur during accessioning at Sample Accepted
      if (hash01(e.id + "rej") < 0.065) {
        orders.samplesRejected += 1;
        bump(quality.reasons, pickBy(hash01(e.id + "why"), REJECTION_REASONS));
      }
    }

    bump(orders.daily, e.date);
    (e.labTests || []).forEach((t) => bump(orders.byDept, t.category));

    if (completed) {
      (e.labTests || []).forEach((t, i) => {
        orders.testsPerformed += 1;
        // Abnormal findings and retests checked and validated at Validation stage
        if (hash01(`${e.id}ab${i}`) < 0.27) quality.abnormal += 1;
        if (hash01(`${e.id}rt${i}`) < 0.06) quality.retests += 1;
      });
    }

    // ---- HMS & Hospital Bridge ----
    if (customerType !== "Walk-in") {
      hms.received += 1;
      if (stage !== "Sample Collection" && stage !== "Cancelled") hms.confirmed += 1;
      bump(hms.byLocation, e.facility);
      hms.byVisitType[customerType] = (hms.byVisitType[customerType] || 0) + 1;
    } else {
      hms.byVisitType["Walk-in"] = (hms.byVisitType["Walk-in"] || 0) + 1;
    }
  });

  // Funnel is cumulative: an order that reached a later stage also passed the earlier ones.
  let running = 0;
  const funnel = [...FUNNEL_STAGES].reverse().map((name) => {
    running += orders.stage[name];
    return { name, value: running };
  }).reverse();

  // Hospital encounters that never produced a lab order
  hms.unconverted = encounters.filter((e) => !e.hasLab && e.consultStatus === "Completed").length;
  hms.encounters = encounters.length;

  const sortTrend = (m, labelFn = (k) => k) =>
    Object.keys(m).sort().map((k) => ({ label: labelFn(k), value: m[k] }));

  return {
    revenue,
    customers: {
      ...customers,
      rows: Object.values(customers)
    },
    orderTypes: {
      ...orderTypes,
      rows: Object.values(orderTypes)
    },
    payMode: PAY_MODES.map((name) => ({ name, value: payMode[name] || 0 })).filter((r) => r.value > 0),
    byDept: toRows(dept).sort((a, b) => b.value - a.value),
    byTest: Object.values(test).sort((a, b) => b.value - a.value),
    trend: {
      daily: sortTrend(trend.daily, (k) => k.slice(8, 10) + "/" + k.slice(5, 7)),
      weekly: Object.keys(trend.weekly).sort().map((k) => ({ label: k, value: trend.weekly[k] })),
      monthly: sortTrend(trend.monthly, (k) => k),
    },
    orders: {
      ...orders,
      funnel,
      daily: sortTrend(orders.daily, (k) => k.slice(8, 10) + "/" + k.slice(5, 7)),
      byDept: toRows(orders.byDept).sort((a, b) => b.value - a.value),
    },
    quality: {
      ...quality,
      rejectionRate: orders.samplesCollected > 0 ? (orders.samplesRejected / orders.samplesCollected) * 100 : 0,
      reasons: toRows(quality.reasons).sort((a, b) => b.value - a.value),
    },
    hms: {
      ...hms,
      byLocation: toRows(hms.byLocation).sort((a, b) => b.value - a.value),
      byVisitType: CUSTOMER_TYPES.map((name) => ({ name, value: hms.byVisitType[name] || 0 })),
    },
  };
}
