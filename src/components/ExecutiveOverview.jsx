"use client";

import React, { useMemo } from "react";
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
  ArrowDownRight,
  Activity,
  Layers
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { formatMoney, formatNum } from "../data/mockData";

export default function ExecutiveOverview({ 
  encounters, 
  onSelectDoctor, 
  onNavigateSection 
}) {
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

  // Daily Trend Data for AreaChart
  const timelineData = useMemo(() => {
    const map = {};
    encounters.forEach((x) => {
      if (!map[x.date]) {
        map[x.date] = { date: x.date, label: x.date.slice(5), net: 0, collected: 0, count: 0 };
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
    { name: "Procedures & Surgery", value: summary.procNet, color: "#7c3aed", icon: Syringe, section: "departments" }
  ], [summary]);

  // Doctor Ranking
  const doctorLeaderboard = useMemo(() => {
    const map = {};
    encounters.forEach((x) => {
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

  // Custom Tooltip for Timeline Chart
  const CustomTimelineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const rate = data.net > 0 ? Math.round((data.collected / data.net) * 100) : 0;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-2xl text-white text-xs">
          <p className="text-slate-400 font-bold mb-2 flex items-center gap-1.5">
            <span>📅 {data.date}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{data.count} Visits</span>
          </p>
          <div className="space-y-1.5">
            <div className="flex justify-between gap-6">
              <span className="text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Net Revenue:
              </span>
              <span className="font-bold">{formatMoney(data.net)}</span>
            </div>
            <div className="flex justify-between gap-6">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Cash Collected:
              </span>
              <span className="font-bold">{formatMoney(data.collected)} ({rate}%)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-7">
      {/* Smart Automated Executive Insight Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300">Executive Performance Intelligence</h4>
            <p className="text-xs text-slate-200 mt-0.5">
              {doctorLeaderboard[0] ? (
                <>
                  Top Revenue Physician: <strong className="text-white underline decoration-blue-400">{doctorLeaderboard[0].name}</strong> ({doctorLeaderboard[0].dept}) with <strong className="text-emerald-300">{formatMoney(doctorLeaderboard[0].net)}</strong>. 
                  Overall cash recovery efficiency is running at <strong className="text-blue-300">{summary.collectionRate}%</strong> across 3 facilities.
                </>
              ) : "No clinical activity recorded under selected filters."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 font-medium">
            Avg Patient Ticket: <strong className="text-white ml-1">{formatMoney(summary.avgPerPatient)}</strong>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 font-medium">
            Pending Receivables: <strong className="text-amber-400 ml-1">{formatMoney(summary.outstanding)}</strong>
          </div>
        </div>
      </div>

      {/* KPI Cards Row with Modern Elevation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Net Revenue */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Net Realized Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatMoney(summary.netRevenue)}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-600 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
            </span>
            <span>vs previous period</span>
          </p>
        </div>

        {/* Cash Collected */}
        <div 
          onClick={() => onNavigateSection("overview")}
          className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Cash Realized</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {formatMoney(summary.collected)}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              {summary.collectionRate}%
            </span>
            <span>posted collections rate</span>
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Outstanding Balances</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {formatMoney(summary.outstanding)}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
              {100 - summary.collectionRate}%
            </span>
            <span>uncollected patient balances</span>
          </p>
        </div>

        {/* Unique Patients */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Unique Patients</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {formatNum(summary.uniquePatients)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Across 3 hospital branches</p>
        </div>

        {/* Completed Encounters */}
        <div className="group relative bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center justify-between text-slate-500 mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Completed Visits</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 tracking-tight">
            {formatNum(summary.completedEncounters)}
          </div>
          <p className="text-xs text-slate-500 mt-2">Out of {encounters.length} scheduled</p>
        </div>
      </div>

      {/* Visual Analytics Row 1: Timeline Area & Entity Mix Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Revenue & Cash Collection Daily Trajectory
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Interactive timeline · Hover dates for itemized realization</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded-md bg-blue-600"></span> Net Revenue
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-md bg-emerald-600"></span> Cash Collected
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} 
                />
                <Tooltip content={<CustomTimelineTooltip />} />
                <Area type="monotone" dataKey="net" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
                <Area type="monotone" dataKey="collected" stroke="#0d9488" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCol)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Multi-Entity Contribution Donut */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Multi-Entity Revenue Mix</h3>
                <p className="text-xs text-slate-500 mt-0.5">Share across Hospital, Labs & Pharmacy</p>
              </div>
            </div>

            <div className="h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={entityMixData}
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {entityMixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatMoney(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  ₹{Math.round(summary.netRevenue / 1000)}k
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-bold mt-1">Total Net</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend Items */}
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
            {entityMixData.map((item) => {
              const Icon = item.icon;
              const pct = summary.netRevenue > 0 ? Math.round((item.value / summary.netRevenue) * 100) : 0;
              return (
                <div 
                  key={item.name}
                  onClick={() => onNavigateSection(item.section)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-xs border border-transparent hover:border-slate-200"
                  title={`Click to explore ${item.name} analytics`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900">{formatMoney(item.value)}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5 font-semibold">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Analytics Row 2: Doctor Leaderboard & Financial Reconciliation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Doctors Ranking */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                Physician Net Revenue Ranking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Click any physician row to open detailed clinical scorecard</p>
            </div>
            <button
              onClick={() => onNavigateSection("doctors")}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Full Doctor Matrix</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            {doctorLeaderboard.slice(0, 5).map((doc, idx) => {
              const maxNet = doctorLeaderboard[0]?.net || 1;
              const widthPct = Math.max(5, (doc.net / maxNet) * 100);
              return (
                <div
                  key={doc.name}
                  onClick={() => onSelectDoctor(doc.name)}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer transition-all duration-150"
                >
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <strong className="text-slate-900 font-bold">{doc.name}</strong>
                      <span className="text-slate-400 font-medium">· {doc.dept}</span>
                    </div>
                    <div className="text-right">
                      <strong className="text-slate-900 font-bold">{formatMoney(doc.net)}</strong>
                      <span className="text-emerald-700 font-semibold text-[11px] ml-2">({doc.rate}% collected)</span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial Reconciliation Waterfall */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="mb-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              Financial Accounting Reconciliation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Gross Billings → Net Yield → Cash Realization</p>
          </div>

          <div className="space-y-2.5 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-2">
              <span className="text-slate-600 font-medium">Gross Service Charges (Billed)</span>
              <span className="font-bold text-slate-900">{formatMoney(summary.totalGross)}</span>
            </div>
            <div className="flex justify-between py-2 text-amber-700 font-medium">
              <span>Less: Concessions & Discounts</span>
              <span className="font-bold">- {formatMoney(summary.totalDiscounts)}</span>
            </div>
            <div className="flex justify-between py-2 text-rose-600 font-medium">
              <span>Less: Service Refunds Issued</span>
              <span className="font-bold">- {formatMoney(summary.totalRefunds)}</span>
            </div>
            <div className="flex justify-between py-2 text-rose-600 font-medium">
              <span>Less: Pharmacy Medication Returns</span>
              <span className="font-bold">- {formatMoney(summary.totalReturns)}</span>
            </div>
            <div className="flex justify-between py-3 bg-blue-50/80 px-3.5 rounded-xl font-bold text-blue-900 border border-blue-200/60">
              <span>= Net Practice Revenue</span>
              <span className="text-sm font-black">{formatMoney(summary.netRevenue)}</span>
            </div>
            <div className="flex justify-between py-2 text-emerald-700 font-medium">
              <span>● Actual Posted Cash / Bank Payments</span>
              <span className="font-bold">{formatMoney(summary.collected)}</span>
            </div>
            <div className="flex justify-between py-2 text-amber-700 font-medium">
              <span>● Outstanding Unpaid Patient Balances</span>
              <span className="font-bold">{formatMoney(summary.outstanding)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
