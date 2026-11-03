"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  Wallet, 
  AlertCircle, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Syringe, 
  ChevronRight,
  Sparkles,
  CreditCard
} from "lucide-react";
import { formatMoney, formatNum } from "../data/mockData";

export default function HospitalOverview({ 
  encounters, 
  onSelectDoctor, 
  onNavigateSection 
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Aggregate Metrics
  const summary = useMemo(() => {
    const totalGross = encounters.reduce((s, x) => s + x.consultFee + x.labGross + x.pharmGross + x.procGross, 0);
    const totalDiscounts = encounters.reduce((s, x) => s + x.consultDiscount + x.labDiscount + x.pharmDiscount + x.procDiscount, 0);
    const totalRefunds = encounters.reduce((s, x) => s + x.consultRefund + x.labRefund + x.procRefund, 0);
    const totalReturns = encounters.reduce((s, x) => s + x.pharmReturn, 0);
    const netRevenue = encounters.reduce((s, x) => s + x.totalNet, 0);
    const collected = encounters.reduce((s, x) => s + x.collected, 0);
    const outstanding = encounters.reduce((s, x) => s + x.outstanding, 0);

    const consultNet = encounters.reduce((s, x) => s + x.consultNet, 0);
    const labNet = encounters.reduce((s, x) => s + x.labNet, 0);
    const pharmNet = encounters.reduce((s, x) => s + x.pharmNet, 0);
    const procNet = encounters.reduce((s, x) => s + x.procNet, 0);

    const uniquePatients = new Set(encounters.map(x => x.patientId)).size;
    const completedEncounters = encounters.filter(x => x.consultStatus === "Completed").length;
    const collectionRate = netRevenue > 0 ? Math.round((collected / netRevenue) * 100) : 0;

    return {
      totalGross,
      totalDiscounts,
      totalRefunds,
      totalReturns,
      netRevenue,
      collected,
      outstanding,
      consultNet,
      labNet,
      pharmNet,
      procNet,
      uniquePatients,
      completedEncounters,
      collectionRate,
      avgPerPatient: uniquePatients ? Math.round(netRevenue / uniquePatients) : 0
    };
  }, [encounters]);

  // Timeline Data
  const timelineDates = useMemo(() => {
    const map = {};
    encounters.forEach((x) => {
      if (!map[x.date]) {
        map[x.date] = { date: x.date, net: 0, collected: 0, count: 0 };
      }
      map[x.date].net += x.totalNet;
      map[x.date].collected += x.collected;
      map[x.date].count += 1;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [encounters]);

  // Entity Mix Donut Data
  const entityMixData = useMemo(() => [
    { name: "Consultation OPD", value: summary.consultNet, color: "#2563eb", icon: Stethoscope, section: "doctors" },
    { name: "Diagnostics Labs", value: summary.labNet, color: "#0d9488", icon: FlaskConical, section: "labs" },
    { name: "Pharmacy Dispensary", value: summary.pharmNet, color: "#d97706", icon: Pill, section: "pharmacy" },
    { name: "Procedures & Surgeries", value: summary.procNet, color: "#7c3aed", icon: Syringe, section: "departments" }
  ], [summary]);

  // Doctor Ranking
  const doctorLeaderboard = useMemo(() => {
    const map = {};
    encounters.forEach((x) => {
      if (x.doctorId === "DOC-WALKIN" || x.doctorName === "Direct Walk-in / Unassigned") return;
      if (!map[x.doctorName]) {
        map[x.doctorName] = {
          name: x.doctorName,
          dept: x.department,
          net: 0,
          collected: 0,
          outstanding: 0,
          patients: new Set(),
          consults: 0
        };
      }
      map[x.doctorName].net += x.totalNet;
      map[x.doctorName].collected += x.collected;
      map[x.doctorName].outstanding += x.outstanding;
      map[x.doctorName].patients.add(x.patientId);
      if (x.consultStatus === "Completed") map[x.doctorName].consults += 1;
    });

    return Object.values(map)
      .map(d => ({
        ...d,
        patientCount: d.patients.size,
        rate: d.net > 0 ? Math.round((d.collected / d.net) * 100) : 0
      }))
      .sort((a, b) => b.net - a.net);
  }, [encounters]);

  // Payment Modes breakdown
  const paymentModes = useMemo(() => {
    const modes = ["Cash", "UPI", "Card", "Insurance", "Bank transfer"];
    const colors = ["#2563eb", "#0d9488", "#7c3aed", "#d97706", "#64748b"];
    const totalCol = summary.collected || 1;

    return modes.map((m, i) => {
      const val = encounters.filter(x => x.payMode === m).reduce((s, x) => s + x.collected, 0);
      return {
        mode: m,
        val,
        color: colors[i],
        pct: Math.round((val / totalCol) * 100)
      };
    });
  }, [encounters, summary.collected]);

  // Custom SVG Timeline Chart calculations
  const maxTimelineVal = Math.max(1, ...timelineDates.flatMap(d => [d.net, d.collected])) * 1.15;
  const W = 700, H = 220, padL = 50, padR = 20, padT = 16, padB = 30;
  const getX = i => timelineDates.length > 1 ? padL + (i * (W - padL - padR)) / (timelineDates.length - 1) : padL;
  const getY = v => H - padB - (v / maxTimelineVal) * (H - padT - padB);

  const netPts = timelineDates.map((d, i) => `${getX(i)},${getY(d.net)}`).join(" ");
  const colPts = timelineDates.map((d, i) => `${getX(i)},${getY(d.collected)}`).join(" ");
  const netAreaPts = timelineDates.length > 0 
    ? `${getX(0)},${H - padB} ${netPts} ${getX(timelineDates.length - 1)},${H - padB}`
    : "";

  return (
    <div className="space-y-6">
      {/* Executive Highlights Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Practice Executive Takeaway</h4>
            <p className="text-xs text-slate-200">
              {doctorLeaderboard[0] ? (
                <>
                  Top Earning Doctor: <strong>{doctorLeaderboard[0].name}</strong> ({doctorLeaderboard[0].dept}) with <strong>{formatMoney(doctorLeaderboard[0].net)}</strong>. 
                  Overall cash realization rate is <strong>{summary.collectionRate}%</strong> across filtered encounters.
                </>
              ) : "No clinical encounters match selected criteria."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">
            Avg Patient Ticket: <strong className="text-white">{formatMoney(summary.avgPerPatient)}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300">
            Pending Receivables: <strong className="text-amber-400">{formatMoney(summary.outstanding)}</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Net Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Net Realized Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatMoney(summary.netRevenue)}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>↑ Realized Yield</span> after deductions
          </p>
        </div>

        {/* Cash Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cash Realized</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {formatMoney(summary.collected)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong className="text-emerald-700">{summary.collectionRate}%</strong> collection efficiency
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding Balances</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {formatMoney(summary.outstanding)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            <strong className="text-amber-700">{100 - summary.collectionRate}%</strong> uncollected balance
          </p>
        </div>

        {/* Unique Patients */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Unique Patients</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {formatNum(summary.uniquePatients)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Across active branches</p>
        </div>

        {/* Completed Encounters */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed Visits</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-600 tracking-tight">
            {formatNum(summary.completedEncounters)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Out of {encounters.length} scheduled</p>
        </div>
      </div>

      {/* Visual Analytics Row 1: Timeline Area & Entity Mix Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SVG Interactive Timeline Chart (100% Reliable!) */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Revenue & Cash Collection Trajectory
              </h3>
              <p className="text-xs text-slate-500">Interactive timeline · Hover any date point for details</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Net Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Cash Collected
              </span>
            </div>
          </div>

          {/* Responsive SVG */}
          <div className="relative w-full h-56">
            {timelineDates.length < 2 ? (
              <div className="flex items-center justify-center h-full text-xs text-slate-400">
                Not enough date records in this filter window to draw timeline.
              </div>
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0, 0.5, 1].map((lvl, idx) => {
                  const yVal = getY(maxTimelineVal * lvl);
                  return (
                    <g key={idx}>
                      <line x1={padL} y1={yVal} x2={W - padR} y2={yVal} stroke="#f1f5f9" strokeDasharray="3 3" />
                      <text x={padL - 8} y={yVal + 3} textAnchor="end" fill="#94a3b8" fontSize="10">
                        ₹{Math.round((maxTimelineVal * lvl) / 1000)}k
                      </text>
                    </g>
                  );
                })}

                {/* Net Area & Line */}
                <polygon points={netAreaPts} fill="url(#netGrad)" />
                <polyline points={netPts} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={colPts} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Date Axis Ticks */}
                {timelineDates.map((d, i) => {
                  const step = Math.max(1, Math.ceil(timelineDates.length / 7));
                  if (i % step === 0 || i === timelineDates.length - 1) {
                    return (
                      <text key={i} x={getX(i)} y={H - 8} textAnchor="middle" fill="#64748b" fontSize="10">
                        {d.date.slice(5)}
                      </text>
                    );
                  }
                  return null;
                })}

                {/* Interactive Hover Hit Points */}
                {timelineDates.map((d, i) => (
                  <g key={d.date} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(d)} onMouseLeave={() => setHoveredPoint(null)}>
                    <circle cx={getX(i)} cy={getY(d.net)} r="4" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                    <circle cx={getX(i)} cy={getY(d.collected)} r="4" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                  </g>
                ))}
              </svg>
            )}

            {/* Hover Tooltip Box */}
            {hoveredPoint && (
              <div className="absolute top-2 right-4 bg-slate-900/95 text-white p-2.5 rounded-xl border border-slate-700 text-xs shadow-lg pointer-events-none">
                <div className="font-bold text-slate-300 mb-1">📅 {hoveredPoint.date} · {hoveredPoint.count} Visits</div>
                <div className="flex justify-between gap-4 py-0.5">
                  <span className="text-blue-400">Net Revenue:</span>
                  <span className="font-bold">{formatMoney(hoveredPoint.net)}</span>
                </div>
                <div className="flex justify-between gap-4 py-0.5">
                  <span className="text-emerald-400">Collected:</span>
                  <span className="font-bold">{formatMoney(hoveredPoint.collected)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Multi-Entity Contribution Donut */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Multi-Entity Revenue Mix</h3>
            <p className="text-xs text-slate-500 mb-3">Share across Hospital, Labs & Pharmacy</p>

            {/* Donut Visual */}
            <div className="py-2 flex items-center justify-center">
              <div className="relative w-36 h-36">
                {(() => {
                  const total = summary.netRevenue || 1;
                  let cur = 0;
                  const stops = entityMixData.map(s => {
                    let start = cur;
                    let pct = (s.value / total) * 100;
                    cur += pct;
                    return `${s.color} ${start.toFixed(1)}% ${cur.toFixed(1)}%`;
                  }).join(", ");

                  return (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                      style={{ background: `conic-gradient(${stops})` }}
                    >
                      <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-xs">
                        <span className="text-base font-black text-slate-900 leading-tight">
                          ₹{Math.round(summary.netRevenue / 1000)}k
                        </span>
                        <span className="text-[9px] font-bold uppercase text-slate-400">Total Net</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {entityMixData.map((item) => {
              const Icon = item.icon;
              const pct = summary.netRevenue > 0 ? Math.round((item.value / summary.netRevenue) * 100) : 0;
              return (
                <div
                  key={item.name}
                  onClick={() => onNavigateSection(item.section)}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatMoney(item.value)}</span>
                    <span className="text-[10px] text-slate-400 font-medium ml-1">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 2: Doctor Leaderboard & Financial Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Doctor Leaderboard */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Physician Net Revenue Ranking
              </h3>
              <p className="text-xs text-slate-500">Click any doctor to inspect clinical scorecard</p>
            </div>
            <button
              onClick={() => onNavigateSection("doctors")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Doctor Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {doctorLeaderboard.slice(0, 5).map((doc, idx) => {
              const maxNet = doctorLeaderboard[0]?.net || 1;
              const widthPct = Math.max(5, (doc.net / maxNet) * 100);
              return (
                <div
                  key={doc.name}
                  onClick={() => onSelectDoctor(doc.name)}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <strong className="text-slate-900">{doc.name}</strong>
                      <span className="text-slate-400">· {doc.dept}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-slate-900">{formatMoney(doc.net)}</strong>
                      <span className="text-emerald-700 text-[11px] font-semibold ml-2">({doc.rate}% collected)</span>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Accounting Reconciliation Waterfall */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              Financial Accounting Reconciliation
            </h3>
            <p className="text-xs text-slate-500">Gross Billings → Net Yield → Cash Realization</p>
          </div>

          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">Gross Service Charges (Billed)</span>
              <span className="font-bold text-slate-900">{formatMoney(summary.totalGross)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-amber-700">
              <span>Less: Concessions & Discounts</span>
              <span className="font-semibold">- {formatMoney(summary.totalDiscounts)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-rose-600">
              <span>Less: Service Refunds Issued</span>
              <span className="font-semibold">- {formatMoney(summary.totalRefunds)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-rose-600">
              <span>Less: Pharmacy Medication Returns</span>
              <span className="font-semibold">- {formatMoney(summary.totalReturns)}</span>
            </div>
            <div className="flex justify-between py-2 bg-blue-50/80 px-3 rounded-lg font-bold text-blue-900">
              <span>= Net Practice Revenue</span>
              <span className="text-sm font-black">{formatMoney(summary.netRevenue)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-emerald-700">
              <span>● Actual Posted Cash / Bank Payments</span>
              <span className="font-bold">{formatMoney(summary.collected)}</span>
            </div>
            <div className="flex justify-between py-1.5 text-amber-700">
              <span>● Outstanding Unpaid Patient Balances</span>
              <span className="font-bold">{formatMoney(summary.outstanding)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
