// Laboratory analytics derived from the encounter dataset.
// Fields the mock generator does not carry (order lifecycle, sample rejection, abnormal flags,
// amendments, retests, visit type) are derived from a stable hash of the encounter id, so values
// are deterministic across renders and do not disturb the seeded generator used by other pages.

const hash01 = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

const pickBy = (r, items) => items[Math.min(items.length - 1, Math.floor(r * items.length))];

export const FUNNEL_STAGES = ["Pending", "Confirmed", "Collected", "In Progress", "Completed"];
export const REJECTION_REASONS = ["Hemolyzed", "Insufficient volume", "Clotted", "Wrong container", "Mislabelled", "Delayed transport"];
export const PAY_MODES = ["Cash", "Card", "UPI", "Insurance", "Bank transfer"];
export const VISIT_TYPES = ["OPD", "IPD", "ER"];

const bump = (map, key, by = 1) => {
  map[key] = (map[key] || 0) + by;
};

const toRows = (map, keyName = "name") =>
  Object.entries(map).map(([k, v]) => ({ [keyName]: k, value: v }));

const weekLabel = (date) => `Wk ${Math.ceil(Number(date.slice(8, 10)) / 7)} · ${date.slice(5, 7)}/${date.slice(2, 4)}`;

export function computeLabAnalytics(encounters = []) {
  const labs = encounters.filter((e) => e.hasLab);

  const revenue = { gross: 0, discounts: 0, refunds: 0, net: 0, collected: 0, outstanding: 0 };
  const payMode = {};
  const dept = {};
  const test = {};
  const trend = { daily: {}, weekly: {}, monthly: {} };

  const orders = {
    total: labs.length,
    hms: 0,
    walkIn: 0,
    stage: { Pending: 0, Confirmed: 0, Collected: 0, "In Progress": 0, Completed: 0 },
    cancelled: 0,
    samplesCollected: 0,
    samplesRejected: 0,
    testsPerformed: 0,
    daily: {},
    byDept: {},
  };
  const quality = { abnormal: 0, retests: 0, cancelled: 0, reasons: {} };
  const hms = { received: 0, confirmed: 0, byLocation: {}, byVisitType: { OPD: 0, IPD: 0, ER: 0 } };

  labs.forEach((e) => {
    const completed = e.labStatus === "Completed";
    const cancelled = e.labStatus === "Cancelled";

    // ---- Revenue (completed receipts are the revenue event) ----
    if (completed) {
      revenue.gross += e.labGross || 0;
      revenue.discounts += e.labDiscount || 0;
      revenue.refunds += e.labRefund || 0;
      revenue.net += e.labNet || 0;

      const paidShare = e.totalNet > 0 ? e.collected / e.totalNet : 1;
      const collected = Math.round((e.labNet || 0) * paidShare);
      revenue.collected += collected;
      revenue.outstanding += (e.labNet || 0) - collected;

      bump(payMode, e.payMode || "Cash", e.labNet || 0);

      const gross = e.labGross || 1;
      (e.labTests || []).forEach((t) => {
        const share = Math.round((e.labNet || 0) * (t.basePrice / gross));
        bump(dept, t.category, share);
        const share_ = t.basePrice / gross;
        const row = test[t.name] || (test[t.name] = { name: t.name, category: t.category, value: 0, gross: 0, discount: 0, bought: 0, refundedUnits: 0, refundedAmount: 0 });
        row.value += share;
        row.gross += t.basePrice;
        row.discount += Math.round((e.labDiscount || 0) * share_);
        row.bought += 1;
        if ((e.labRefund || 0) > 0) {
          row.refundedUnits += 1;
          row.refundedAmount += Math.round(e.labRefund * share_);
        }
      });

      const d = e.date;
      bump(trend.daily, d, e.labNet || 0);
      bump(trend.weekly, weekLabel(d), e.labNet || 0);
      bump(trend.monthly, d.slice(0, 7), e.labNet || 0);
    }

    // ---- Orders & workflow ----
    const isWalkIn = e.labSource === "MANUAL";
    if (isWalkIn) orders.walkIn += 1;
    else orders.hms += 1;

    let stage;
    if (completed) stage = "Completed";
    else if (cancelled) stage = "Cancelled";
    else stage = pickBy(hash01(e.id + "stage"), ["Pending", "Confirmed", "Collected", "In Progress"]);

    if (stage === "Cancelled") {
      orders.cancelled += 1;
      quality.cancelled += 1;
    } else {
      orders.stage[stage] += 1;
    }

    const sampleTaken = stage === "Collected" || stage === "In Progress" || stage === "Completed";
    if (sampleTaken) {
      orders.samplesCollected += 1;
      if (hash01(e.id + "rej") < 0.08) {
        orders.samplesRejected += 1;
        bump(quality.reasons, pickBy(hash01(e.id + "why"), REJECTION_REASONS));
      }
    }

    bump(orders.daily, e.date);
    (e.labTests || []).forEach((t) => bump(orders.byDept, t.category));

    if (completed) {
      (e.labTests || []).forEach((t, i) => {
        orders.testsPerformed += 1;
        if (hash01(`${e.id}ab${i}`) < 0.27) quality.abnormal += 1;
        if (hash01(`${e.id}rt${i}`) < 0.06) quality.retests += 1;
      });
    }

    // ---- HMS integration ----
    if (!isWalkIn) {
      hms.received += 1;
      if (stage !== "Pending" && stage !== "Cancelled") hms.confirmed += 1;
      bump(hms.byLocation, e.facility);
      const visit = e.admissionInitiated ? "IPD" : hash01(e.id + "visit") < 0.1 ? "ER" : "OPD";
      hms.byVisitType[visit] += 1;
    }
  });

  // Funnel is cumulative: an order that reached a later stage also passed the earlier ones.
  let running = 0;
  const funnel = [...FUNNEL_STAGES].reverse().map((name) => {
    running += orders.stage[name];
    return { name, value: running };
  }).reverse();

  // Hospital encounters that never produced a lab order.
  hms.unconverted = encounters.filter((e) => !e.hasLab && e.consultStatus === "Completed").length;
  hms.encounters = encounters.length;

  const sortTrend = (m, labelFn = (k) => k) =>
    Object.keys(m).sort().map((k) => ({ label: labelFn(k), value: m[k] }));

  return {
    revenue,
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
      byVisitType: VISIT_TYPES.map((name) => ({ name, value: hms.byVisitType[name] })),
    },
  };
}
