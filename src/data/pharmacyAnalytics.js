// Pharmacy analytics derived from the encounter dataset.
// The mock generator stores one drug category per prescription and no medicine-level lines, so
// medicine names and quantities are derived from a stable hash of the encounter id. This keeps the
// values deterministic and leaves the seeded generator (and every other page) untouched.

const hash01 = (str) => {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
};

export const MEDICINES = {
  CV: ["Amlodipine 5mg", "Atorvastatin 10mg", "Telmisartan 40mg", "Metoprolol 50mg", "Clopidogrel 75mg"],
  AB: ["Amoxicillin 500mg", "Azithromycin 500mg", "Cefixime 200mg", "Ciprofloxacin 500mg", "Doxycycline 100mg"],
  PA: ["Paracetamol 650mg", "Diclofenac 50mg", "Ibuprofen 400mg", "Aceclofenac 100mg", "Naproxen 250mg"],
  DM: ["Clobetasol Cream", "Mupirocin Ointment", "Ketoconazole Shampoo", "Adapalene Gel", "Calamine Lotion"],
  VM: ["Vitamin D3 60K", "Vitamin B12 1500mcg", "Calcium + D3", "Iron + Folic Acid", "Multivitamin"],
};

export const CHANNELS = [
  { key: "OPD", label: "OPD" },
  { key: "WALK_IN", label: "Walk-in" },
  { key: "IPD_OT", label: "IPD / OT" },
];
export const STATUSES = ["Dispensed", "Partial", "Returned"];
export const PAY_MODES = ["Cash", "Card", "UPI", "Insurance", "Bank transfer"];

const channelOf = (e) => (e.pharmChannel === "WALK_IN" ? "WALK_IN" : e.pharmChannel === "IPD_OT" ? "IPD_OT" : "OPD");
const weekLabel = (date) => `Wk ${Math.ceil(Number(date.slice(8, 10)) / 7)} · ${date.slice(5, 7)}/${date.slice(2, 4)}`;
const shortName = (n) => n.split(" ")[0];

const bump = (map, key, by = 1) => {
  map[key] = (map[key] || 0) + by;
};
const trendRows = (m, labelFn = (k) => k) => Object.keys(m).sort().map((k) => ({ label: labelFn(k), value: m[k] }));

export function computePharmacyAnalytics(encounters = []) {
  const rx = encounters.filter((e) => e.hasRx);

  const t = { gross: 0, returns: 0, discounts: 0, net: 0, collected: 0, outstanding: 0, gst: 0, cogs: 0, profit: 0, netExTax: 0 };
  const payMode = {};
  const trend = { daily: {}, weekly: {}, monthly: {} };
  const status = { Dispensed: 0, Partial: 0, Returned: 0 };
  const channel = {
    OPD: { orders: 0, sales: 0 },
    WALK_IN: { orders: 0, sales: 0 },
    IPD_OT: { orders: 0, sales: 0 },
  };
  const category = {};
  const medicine = {};
  let unitsSold = 0;

  rx.forEach((e) => {
    const net = e.pharmNet || 0;
    const returns = e.pharmReturn || 0;
    const ch = channelOf(e);

    t.gross += e.pharmGross || 0;
    t.returns += returns;
    t.discounts += Math.max(0, (e.pharmGross || 0) - returns - net);
    t.net += net;
    t.gst += e.pharmTaxAmount || 0;
    t.cogs += e.pharmCOGS || 0;
    t.profit += e.pharmGrossProfit || 0;
    t.netExTax += e.pharmNetExclTax || 0;

    // IPD / OT issues are settled fully in Accounts at creation.
    const paidShare = ch === "IPD_OT" ? 1 : e.totalNet > 0 ? e.collected / e.totalNet : 1;
    const collected = Math.round(net * paidShare);
    t.collected += collected;
    t.outstanding += net - collected;

    bump(payMode, e.payMode || "Cash", net);
    bump(trend.daily, e.date, net);
    bump(trend.weekly, weekLabel(e.date), net);
    bump(trend.monthly, e.date.slice(0, 7), net);

    status[e.pharmStatus] = (status[e.pharmStatus] || 0) + 1;
    channel[ch].orders += 1;
    channel[ch].sales += net;

    const catName = e.drugCategory || "General Formulary";
    const cat = category[catName] || (category[catName] = { name: catName, short: catName.split(/[\s,&]+/)[0], sales: 0, units: 0, profit: 0, cogs: 0 });
    cat.sales += net;
    cat.profit += e.pharmGrossProfit || 0;
    cat.cogs += e.pharmCOGS || 0;

    // Split the prescription across 1-3 medicines of its category.
    const list = MEDICINES[e.drugCode] || [];
    if (list.length === 0) return;
    const lines = 1 + Math.floor(hash01(e.id + "n") * 3);
    const picks = [];
    for (let i = 0; i < lines; i++) {
      const name = list[Math.floor(hash01(`${e.id}m${i}`) * list.length)];
      if (!picks.some((p) => p.name === name)) picks.push({ name, w: 0.5 + hash01(`${e.id}w${i}`) });
    }
    const totalW = picks.reduce((s, p) => s + p.w, 0);
    picks.forEach((p, i) => {
      const share = p.w / totalW;
      const qty = 4 + Math.floor(hash01(`${e.id}q${i}`) * 27);
      const row = medicine[p.name] || (medicine[p.name] = {
        name: p.name, short: shortName(p.name), category: cat.short,
        bought: 0, returnedUnits: 0, units: 0, gross: 0, discount: 0, returnedAmount: 0, revenue: 0,
      });
      // Units taken back are in proportion to the value returned on the prescription.
      const grossAmt = e.pharmGross || 0;
      const returnedUnits = grossAmt > 0 ? Math.round(qty * (returns / grossAmt)) : 0;
      row.bought += qty;
      row.returnedUnits += returnedUnits;
      row.units += qty - returnedUnits;
      row.gross += Math.round(grossAmt * share);
      row.discount += Math.round(Math.max(0, grossAmt - returns - net) * share);
      row.returnedAmount += Math.round(returns * share);
      row.revenue += Math.round(net * share);
      cat.units += qty - returnedUnits;
      unitsSold += qty - returnedUnits;
    });
  });

  const cats = Object.values(category);
  const meds = Object.values(medicine);
  const orders = rx.length;

  return {
    totals: { ...t, orders, unitsSold, margin: t.netExTax > 0 ? (t.profit / t.netExTax) * 100 : 0, aov: orders > 0 ? t.net / orders : 0 },
    payMode: PAY_MODES.map((name) => ({ name, value: payMode[name] || 0 })).filter((r) => r.value > 0),
    trend: {
      daily: trendRows(trend.daily, (k) => k.slice(8, 10) + "/" + k.slice(5, 7)),
      weekly: Object.keys(trend.weekly).sort().map((k) => ({ label: k, value: trend.weekly[k] })),
      monthly: trendRows(trend.monthly),
    },
    status: STATUSES.map((name) => ({ name, value: status[name] || 0 })),
    channels: CHANNELS.map((c) => ({ name: c.label, key: c.key, orders: channel[c.key].orders, sales: channel[c.key].sales })),
    categories: cats.sort((a, b) => b.sales - a.sales),
    medicinesByUnits: [...meds].sort((a, b) => b.units - a.units),
    medicinesByRevenue: [...meds].sort((a, b) => b.revenue - a.revenue),
  };
}
