"use client";

import React, { useState, useMemo } from "react";
import { ClipboardList, Search, CheckCircle2, XCircle, AlertCircle, DollarSign } from "lucide-react";
import { formatMoney, formatNum } from "../data/mockData";

export default function ConsultationsView({ encounters, onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const stats = useMemo(() => {
    const total = encounters.length;
    const completed = encounters.filter(e => e.consultStatus === "Completed").length;
    const cancelled = encounters.filter(e => e.consultStatus === "Cancelled").length;
    const noshow = encounters.filter(e => e.consultStatus === "No-show").length;
    const grossFees = encounters.reduce((s, e) => s + e.consultFee, 0);
    const discounts = encounters.reduce((s, e) => s + e.consultDiscount, 0);
    const refunds = encounters.reduce((s, e) => s + e.consultRefund, 0);
    const netFees = encounters.reduce((s, e) => s + e.consultNet, 0);

    return {
      total,
      completed,
      cancelled,
      noshow,
      grossFees,
      discounts,
      refunds,
      netFees,
      attendanceRate: total ? Math.round((completed / total) * 100) : 0,
      avgFee: completed ? Math.round(netFees / completed) : 0
    };
  }, [encounters]);

  const filtered = useMemo(() => {
    let result = [...encounters];
    if (statusFilter !== "all") {
      result = result.filter(e => e.consultStatus === statusFilter);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.patientName.toLowerCase().includes(q) || 
        e.patientId.toLowerCase().includes(q) || 
        e.doctorName.toLowerCase().includes(q) || 
        e.department.toLowerCase().includes(q)
      );
    }
    return result;
  }, [encounters, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Completed Visits</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{stats.completed}</div>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">{stats.attendanceRate}% Attendance Rate</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cancelled Visits</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{stats.cancelled}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Patient cancellations</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No-Shows</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{stats.noshow}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Unattended encounters</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Net Consultation Fees</span>
          <div className="text-2xl font-black text-blue-700 mt-1">{formatMoney(stats.netFees)}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Realized OPD yield</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Fee per Visit</span>
          <div className="text-2xl font-black text-slate-800 mt-1">{formatMoney(stats.avgFee)}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Net fee realization</span>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 mr-1">Status:</span>
            {["all", "Completed", "Cancelled", "No-show"].map(st => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                  statusFilter === st ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st === "all" ? "All Visits" : st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, doctor, department..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Physician</th>
                <th className="p-3">Department</th>
                <th className="p-3">Patient</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Gross Fee</th>
                <th className="p-3 text-right">Discount</th>
                <th className="p-3 text-right">Refund</th>
                <th className="p-3 text-right font-black text-blue-900">Net Fee</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((enc) => (
                <tr key={enc.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{enc.date}</td>
                  <td className="p-3 font-semibold text-blue-600 cursor-pointer" onClick={() => onSelectDoctor(enc.doctorName)}>
                    {enc.doctorName}
                  </td>
                  <td className="p-3 text-slate-700">{enc.department}</td>
                  <td className="p-3 font-medium text-slate-900">{enc.patientName}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      enc.consultStatus === "Completed" ? "bg-emerald-100 text-emerald-800" :
                      enc.consultStatus === "Cancelled" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                    }`}>
                      {enc.consultStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">{formatMoney(enc.consultFee)}</td>
                  <td className="p-3 text-right text-amber-700">- {formatMoney(enc.consultDiscount)}</td>
                  <td className="p-3 text-right text-rose-600">- {formatMoney(enc.consultRefund)}</td>
                  <td className="p-3 text-right font-bold text-blue-700">{formatMoney(enc.consultNet)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filtered.length} visits)</div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 border rounded hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 border rounded hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
