"use client";

import React, { useState, useMemo } from "react";
import { Users, Search, UserCheck, Clock, DollarSign } from "lucide-react";
import { formatMoney, formatNum } from "../data/mockData";

export default function PatientsView({ encounters, onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const patientAgg = useMemo(() => {
    const map = {};
    encounters.forEach(e => {
      if (!map[e.patientId]) {
        map[e.patientId] = {
          id: e.patientId,
          name: e.patientName,
          phone: e.patientPhone,
          age: e.patientAge,
          gender: e.patientGender,
          fresh: e.patientFresh,
          visits: 0,
          latestDoctor: e.doctorName,
          latestDate: e.date,
          net: 0,
          collected: 0,
          outstanding: 0
        };
      }
      map[e.patientId].visits += 1;
      map[e.patientId].net += e.totalNet;
      map[e.patientId].collected += e.collected;
      map[e.patientId].outstanding += e.outstanding;
      if (e.date > map[e.patientId].latestDate) {
        map[e.patientId].latestDate = e.date;
        map[e.patientId].latestDoctor = e.doctorName;
      }
    });

    return Object.values(map).sort((a, b) => b.outstanding - a.outstanding);
  }, [encounters]);

  const uniqueCount = patientAgg.length;
  const totalNet = encounters.reduce((s, e) => s + e.totalNet, 0);
  const totalOut = encounters.reduce((s, e) => s + e.outstanding, 0);
  const newPatients = encounters.filter(e => e.patientFresh).length;
  const returnPatients = encounters.filter(e => !e.patientFresh).length;

  const filtered = useMemo(() => {
    let result = [...patientAgg];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.id.toLowerCase().includes(q) || 
        p.name.toLowerCase().includes(q) || 
        p.latestDoctor.toLowerCase().includes(q)
      );
    }
    return result;
  }, [patientAgg, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unique Patient Cohort</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{uniqueCount} Individuals</div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Registered in this period</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Revenue per Patient</span>
          <div className="text-2xl font-black text-blue-700 mt-1">
            {formatMoney(uniqueCount ? Math.round(totalNet / uniqueCount) : 0)}
          </div>
          <span className="text-xs text-slate-500 mt-1 inline-block">Lifetime net encounter value</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Balance Owed</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {formatMoney(uniqueCount ? Math.round(totalOut / uniqueCount) : 0)}
          </div>
          <span className="text-xs text-amber-700 font-bold mt-1 inline-block">Per patient receivable</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">New vs Returning Mix</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {newPatients} / {returnPatients}
          </div>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">First-visit vs repeat records</span>
        </div>
      </div>

      {/* Patient Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-bold text-slate-700">
            Patient Demographics & Balance Ledger
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient name, ID, latest doctor..."
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
                <th className="p-3">Patient ID</th>
                <th className="p-3">Patient Name</th>
                <th className="p-3 text-center">Visits</th>
                <th className="p-3">Latest Doctor</th>
                <th className="p-3">Last Visit Date</th>
                <th className="p-3 text-right">Net Billed</th>
                <th className="p-3 text-right text-emerald-700">Collected</th>
                <th className="p-3 text-right text-amber-700">Balance Owed</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((pat) => (
                <tr key={pat.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-600 font-semibold">{pat.id}</td>
                  <td className="p-3 font-bold text-slate-900">{pat.name}</td>
                  <td className="p-3 text-center font-bold text-slate-700">{pat.visits}</td>
                  <td className="p-3 font-semibold text-blue-600 cursor-pointer" onClick={() => onSelectDoctor(pat.latestDoctor)}>
                    {pat.latestDoctor}
                  </td>
                  <td className="p-3 text-slate-500">{pat.latestDate}</td>
                  <td className="p-3 text-right font-bold text-slate-900">{formatMoney(pat.net)}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">{formatMoney(pat.collected)}</td>
                  <td className="p-3 text-right font-bold text-amber-600">{formatMoney(pat.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filtered.length} patients)</div>
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
