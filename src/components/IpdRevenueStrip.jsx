"use client";

import React, { useMemo } from "react";
import { BedDouble } from "lucide-react";
import { formatMoney, formatNum } from "../data/mockData";

// Inpatient (IPD) revenue for whatever the page is currently filtered to.
export default function IpdRevenueStrip({ encounters = [] }) {
  const ipd = useMemo(() => {
    const bills = encounters.filter((e) => e.invoiceType === "IPD");
    const net = bills.reduce((s, e) => s + e.totalNet, 0);
    const collected = bills.reduce((s, e) => s + e.collected, 0);
    const total = encounters.reduce((s, e) => s + e.totalNet, 0);
    return { count: bills.length, net, collected, outstanding: net - collected, share: total > 0 ? Math.round((net / total) * 100) : 0 };
  }, [encounters]);

  const items = [
    { label: "IPD revenue", value: formatMoney(ipd.net), tone: "text-cyan-700" },
    { label: "IPD admissions billed", value: formatNum(ipd.count) },
    { label: "Received", value: formatMoney(ipd.collected), tone: "text-emerald-700" },
    { label: "Yet to receive", value: formatMoney(ipd.outstanding), tone: "text-amber-600" },
    { label: "Share of revenue", value: `${ipd.share}%` }
  ];

  return (
    <div className="mb-6 bg-white rounded-2xl border border-gray-200/90 shadow-2xs px-5 py-3.5 flex flex-wrap items-center gap-x-8 gap-y-3">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
          <BedDouble className="w-4.5 h-4.5" />
        </span>
        <span className="text-sm font-extrabold text-gray-900">Inpatient (IPD)</span>
      </div>
      {items.map((i) => (
        <div key={i.label}>
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{i.label}</div>
          <div className={`text-sm font-black ${i.tone || "text-gray-900"}`}>{i.value}</div>
        </div>
      ))}
    </div>
  );
}
