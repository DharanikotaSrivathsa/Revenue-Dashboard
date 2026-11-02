"use client";

import React, { useState, useMemo } from "react";
import { Wallet, Search, CreditCard, DollarSign, ArrowUpRight } from "lucide-react";
import { formatMoney, formatNum } from "../data/mockData";

export default function CollectionsView({ encounters, onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const specs = [
    { key: "consultNet", source: "Consultation", prefix: "CONS", color: "#2563eb" },
    { key: "labNet", source: "Lab Invoice", prefix: "LAB", color: "#0d9488" },
    { key: "pharmNet", source: "Pharmacy Rx", prefix: "PHARM", color: "#d97706" },
    { key: "procNet", source: "Procedure", prefix: "PROC", color: "#7c3aed" }
  ];

  // Itemized transactions
  const txList = useMemo(() => {
    return encounters.flatMap(e => {
      return specs.filter(s => (e[s.key] || 0) > 0).map(s => {
        const invNet = e[s.key];
        const colRatio = e.totalNet > 0 ? e.collected / e.totalNet : 0;
        const c = Math.round(invNet * colRatio);
        const bal = Math.max(0, invNet - c);

        return {
          id: `${s.prefix}-${e.id.replace("ENC-", "")}`,
          encounter: e.id,
          date: e.date,
          doctor: e.doctorName,
          dept: e.department,
          patient: e.patientName,
          patientId: e.patientId,
          source: s.source,
          color: s.color,
          invoiceNet: invNet,
          collected: c,
          outstanding: bal,
          mode: e.payMode,
          status: c >= invNet ? "Paid" : c > 0 ? "Partial" : "Unpaid"
        };
      });
    });
  }, [encounters]);

  const totalCollected = encounters.reduce((s, e) => s + e.collected, 0);
  const totalOutstanding = encounters.reduce((s, e) => s + e.outstanding, 0);

  // Filtered List
  const filtered = useMemo(() => {
    let result = [...txList];
    if (statusFilter !== "all") {
      result = result.filter(t => t.status === statusFilter);
    }
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(t => 
        t.id.toLowerCase().includes(q) || 
        t.patient.toLowerCase().includes(q) || 
        t.doctor.toLowerCase().includes(q) || 
        t.source.toLowerCase().includes(q) ||
        t.mode.toLowerCase().includes(q)
      );
    }
    return result;
  }, [txList, statusFilter, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Modes distribution
  const modesData = useMemo(() => {
    const modes = ["UPI", "Card", "Cash", "Insurance", "Bank transfer"];
    return modes.map(m => {
      const val = txList.filter(t => t.mode === m).reduce((s, t) => s + t.collected, 0);
      return { mode: m, val, pct: totalCollected > 0 ? Math.round((val / totalCollected) * 100) : 0 };
    });
  }, [txList, totalCollected]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Posted Cash</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{formatMoney(totalCollected)}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Direct cash & bank inflow</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outstanding Receivables</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{formatMoney(totalOutstanding)}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Awaiting patient settlement</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Invoices</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{txList.length}</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Itemized service bills</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Collection Velocity</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {totalCollected + totalOutstanding > 0 ? Math.round((totalCollected / (totalCollected + totalOutstanding)) * 100) : 0}%
          </div>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">Cash conversion index</span>
        </div>
      </div>

      {/* Payment Modes Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-blue-600" />
          Collections by Settlement Method
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {modesData.map(m => (
            <div key={m.mode} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
              <span className="text-[11px] font-bold text-slate-700">{m.mode}</span>
              <div className="text-base font-black text-slate-900 mt-1">{formatMoney(m.val)}</div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">{m.pct}% of collections</div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 mr-1">Settlement:</span>
            {["all", "Paid", "Partial", "Unpaid"].map(st => (
              <button
                key={st}
                onClick={() => { setStatusFilter(st); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${
                  statusFilter === st ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-100"
                }`}
              >
                {st === "all" ? "All Invoices" : st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference, doctor, patient..."
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
                <th className="p-3">Invoice Ref</th>
                <th className="p-3">Service Line</th>
                <th className="p-3">Doctor</th>
                <th className="p-3">Patient</th>
                <th className="p-3">Method</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Invoice Net</th>
                <th className="p-3 text-right text-emerald-700">Collected</th>
                <th className="p-3 text-right text-amber-700">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50">
                  <td className="p-3 text-slate-500">{tx.date}</td>
                  <td className="p-3 font-mono font-medium text-slate-700">{tx.id}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800">{tx.source}</span>
                  </td>
                  <td className="p-3 font-semibold text-blue-600 cursor-pointer" onClick={() => onSelectDoctor(tx.doctor)}>
                    {tx.doctor}
                  </td>
                  <td className="p-3 font-medium text-slate-900">{tx.patient}</td>
                  <td className="p-3 text-slate-600">{tx.mode}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === "Paid" ? "bg-emerald-100 text-emerald-800" :
                      tx.status === "Partial" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatMoney(tx.invoiceNet)}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">{formatMoney(tx.collected)}</td>
                  <td className="p-3 text-right font-bold text-amber-600">{formatMoney(tx.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filtered.length} transactions)</div>
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
