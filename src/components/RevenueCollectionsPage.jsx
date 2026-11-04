"use client";

import React, { useState, useMemo } from "react";
import { 
  DollarSign, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  Percent, 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Syringe, 
  Download, 
  CheckCircle2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { formatMoney, formatNum } from "../data/mockData";

export default function RevenueCollectionsPage({ encounters = [], onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [payFilter, setPayFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  // Timeline
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

  const maxTimelineNet = Math.max(1, ...timelineDates.map(d => Math.max(d.net, d.collected)));

  // Doctor Leaderboard
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
          consults: 0
        };
      }
      const isWhole = (x.invoiceType === "PACKAGE" || x.invoiceType === "IPD") && x.serviceType !== "Walk-in";
      const docNet = (x.consultNet || 0) + (x.procNet || 0) + (isWhole ? (x.labNet || 0) + (x.pharmNet || 0) : 0);
      const docCol = x.totalNet > 0 ? Math.min(docNet, Math.round(x.collected * (docNet / x.totalNet))) : 0;
      map[x.doctorName].net += docNet;
      map[x.doctorName].collected += docCol;
      map[x.doctorName].outstanding += Math.max(0, docNet - docCol);
      if (x.consultStatus === "Completed") map[x.doctorName].consults += 1;
    });
    return Object.values(map).sort((a, b) => b.net - a.net);
  }, [encounters]);

  // Filtered rows for detailed ledger
  const filteredRows = useMemo(() => {
    let result = [...encounters];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.patientId.toLowerCase().includes(q) ||
        e.patientName.toLowerCase().includes(q) ||
        e.doctorName.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
      );
    }
    if (payFilter !== "All") {
      result = result.filter(e => e.paymentStatus === payFilter);
    }
    return result;
  }, [encounters, searchTerm, payFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Realized Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Net Realized
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatMoney(summary.netRevenue)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Net Realized Revenue</div>
          <p className="text-[11px] text-gray-400 mt-2">After discounts, refunds and returns</p>
        </div>

        {/* Cash Collected */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              {summary.collectionRate}% Rate
            </span>
          </div>
          <div className="text-3xl font-black text-teal-700 tracking-tight">
            {formatMoney(summary.collected)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Cash Realized</div>
          <p className="text-[11px] text-gray-400 mt-2">{summary.collectionRate}% cash collection efficiency</p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Pending
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600 tracking-tight">
            {formatMoney(summary.outstanding)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Outstanding Balances</div>
          <p className="text-[11px] text-gray-400 mt-2">{100 - summary.collectionRate}% uncollected balance</p>
        </div>

        {/* Average Yield Per Patient */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              ARPU
            </span>
          </div>
          <div className="text-3xl font-black text-purple-700 tracking-tight">
            {formatMoney(summary.avgPerPatient)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Avg Yield / Patient</div>
          <p className="text-[11px] text-gray-400 mt-2">Across all clinical service lines</p>
        </div>
      </div>

      {/* 2. Trajectory Chart & Service Line Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Trajectory Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Revenue & Cash Collection Trajectory</span>
              </h3>
              <p className="text-xs text-gray-500">Daily net realized revenue vs cash realization</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Net Revenue</span>
              <span className="flex items-center gap-1.5 text-teal-600"><span className="w-2.5 h-2.5 rounded-sm bg-teal-600" /> Cash Collected</span>
            </div>
          </div>

          <div className="relative w-full h-56 pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {[0, 0.5, 1].map((pct, idx) => {
                const y = 160 - pct * 130;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <text x="22" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                      ₹{Math.round((maxTimelineNet * pct) / 1000)}k
                    </text>
                  </g>
                );
              })}

              {/* Net Line */}
              {timelineDates.length > 1 && (
                <path
                  d={timelineDates.map((d, i) => {
                    const x = 35 + (i / (timelineDates.length - 1)) * 440;
                    const y = 160 - (d.net / maxTimelineNet) * 130;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Collected Line */}
              {timelineDates.length > 1 && (
                <path
                  d={timelineDates.map((d, i) => {
                    const x = 35 + (i / (timelineDates.length - 1)) * 440;
                    const y = 160 - (d.collected / maxTimelineNet) * 130;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-6">
            <span>{timelineDates[0]?.date}</span>
            <span>{timelineDates[timelineDates.length - 1]?.date}</span>
          </div>
        </div>

        {/* Multi-Entity Mix */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
          <h3 className="text-sm font-extrabold text-gray-900 mb-1">Service Line Breakdown</h3>
          <p className="text-xs text-gray-500 mb-4">Net revenue distribution</p>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-800">Consultation OPD</span>
              </div>
              <span className="text-xs font-black text-blue-700">{formatMoney(summary.consultNet)}</span>
            </div>

            <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-gray-800">Diagnostics Labs</span>
              </div>
              <span className="text-xs font-black text-teal-700">{formatMoney(summary.labNet)}</span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Pill className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-gray-800">Pharmacy Dispensary</span>
              </div>
              <span className="text-xs font-black text-amber-700">{formatMoney(summary.pharmNet)}</span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Syringe className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold text-gray-800">Procedures & IPD</span>
              </div>
              <span className="text-xs font-black text-purple-700">{formatMoney(summary.procNet)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed Financial Reconciliation Ledger */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, doctor, encounter ID..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => { setPayFilter("All"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  payFilter === "All" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({encounters.length})
              </button>
              <button
                onClick={() => { setPayFilter("Paid in Full"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  payFilter === "Paid in Full" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => { setPayFilter("Unpaid"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  payFilter === "Unpaid" ? "bg-white text-amber-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Unpaid / Due
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredRows.length}</strong> financial transactions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Encounter ID</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4 text-right">Net Revenue</th>
                <th className="py-3 px-4 text-right">Collected</th>
                <th className="py-3 px-4 text-right">Outstanding</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    No financial transaction records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((e) => (
                  <tr key={e.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 text-gray-600 font-medium">{e.date}</td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-600">{e.id}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{e.doctorName}</td>
                    <td className="py-3 px-4 font-bold text-gray-800">
                      {e.patientName}
                      <span className="block text-[10px] font-mono font-normal text-gray-400">{e.patientId}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-black text-gray-900">{formatMoney(e.totalNet)}</td>
                    <td className="py-3 px-4 text-right font-bold text-teal-700">{formatMoney(e.collected)}</td>
                    <td className="py-3 px-4 text-right font-bold text-amber-700">{formatMoney(e.outstanding)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        e.paymentStatus === "Paid in Full" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : e.paymentStatus === "Unpaid"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {e.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs">
            <span className="text-gray-500">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
