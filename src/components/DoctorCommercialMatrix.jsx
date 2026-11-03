"use client";

import React, { useState, useMemo } from "react";
import { 
  Trophy, 
  DollarSign, 
  TrendingUp, 
  Download, 
  ArrowUpDown, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  BarChart3
} from "lucide-react";
import { formatMoney } from "../data/mockData.js";
import { calculateCommercialAnalytics } from "../data/commercialAnalytics.js";

export default function DoctorCommercialMatrix({ encounters = [], onSelectDoctor }) {
  const [sortKey, setSortKey] = useState("invoicedRevenue");
  const [sortOrder, setSortOrder] = useState("desc");

  const commercial = useMemo(() => calculateCommercialAnalytics(encounters), [encounters]);

  const sortedDoctors = useMemo(() => {
    return [...commercial.topDoctors].sort((a, b) => {
      let valA = a[sortKey];
      let valB = b[sortKey];
      if (typeof valA === "string") {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [commercial.topDoctors, sortKey, sortOrder]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Rank",
      "DoctorName",
      "Speciality",
      "Facility",
      "InvoicedRevenue",
      "RealizedCollections",
      "RealizationRatePct",
      "ConsultationBillings",
      "ProcedureBillings",
      "LabOrderYield",
      "PharmacyYield",
      "TotalEcosystemValue",
      "AvgTicketSize",
      "CommercialTier"
    ];

    const rows = sortedDoctors.map(d => [
      d.rank,
      `"${d.name}"`,
      `"${d.department}"`,
      `"${d.facility}"`,
      d.invoicedRevenue,
      d.realizedCollections,
      d.realizationRate,
      d.consultBillings,
      d.procedureBillings,
      d.labOrderYield,
      d.pharmacyYield,
      d.ecosystemValue,
      d.avgTicket,
      `"${d.tier}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `doctor_commercial_revenue_matrix_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Matrix Summary Totals
  const totals = useMemo(() => {
    const invoiced = sortedDoctors.reduce((s, d) => s + d.invoicedRevenue, 0);
    const collected = sortedDoctors.reduce((s, d) => s + d.realizedCollections, 0);
    const consults = sortedDoctors.reduce((s, d) => s + d.consultBillings, 0);
    const procedures = sortedDoctors.reduce((s, d) => s + d.procedureBillings, 0);
    const lab = sortedDoctors.reduce((s, d) => s + d.labOrderYield, 0);
    const pharm = sortedDoctors.reduce((s, d) => s + d.pharmacyYield, 0);
    const ecosystem = sortedDoctors.reduce((s, d) => s + d.ecosystemValue, 0);
    const rate = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;

    return { invoiced, collected, consults, procedures, lab, pharm, ecosystem, rate };
  }, [sortedDoctors]);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Trophy className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">Top Doctor Commercial Ranking Matrix</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              12 Commercial Parameters
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Comprehensive financial comparison ranking medical specialists by billings, collection rate, procedure yield, and cross-hospital impact
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all shadow-2xs cursor-pointer self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" />
          <span>Export Matrix CSV</span>
        </button>
      </div>

      {/* 2. Full Commercial Matrix Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-gray-50/90 text-gray-600 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">Rank</th>
                <th 
                  onClick={() => handleSort("name")}
                  className="py-3 px-4 cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Doctor</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th className="py-3 px-3">Speciality</th>
                <th 
                  onClick={() => handleSort("invoicedRevenue")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1 text-gray-900 font-black">
                    <span>Invoiced (₹)</span>
                    <ArrowUpDown className="w-3 h-3 text-blue-600" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("realizedCollections")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1 text-emerald-700">
                    <span>Realized (₹)</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("realizationRate")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Realization %</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("consultBillings")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Consultations</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("procedureBillings")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Procedures</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("labOrderYield")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Lab Yield</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("pharmacyYield")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Pharmacy Yield</span>
                    <ArrowUpDown className="w-3 h-3 text-gray-400" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort("ecosystemValue")}
                  className="py-3 px-4 text-right cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1 text-purple-700 font-black">
                    <span>Total Ecosystem (₹)</span>
                    <ArrowUpDown className="w-3 h-3 text-purple-600" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Commercial Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedDoctors.map((doc, idx) => (
                <tr 
                  key={doc.id}
                  onClick={() => onSelectDoctor && onSelectDoctor(doc.name)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3 text-center">
                    <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-black ${
                      doc.rank === 1 ? "bg-amber-100 text-amber-800 ring-2 ring-amber-300" :
                      doc.rank === 2 ? "bg-slate-200 text-slate-800 ring-1 ring-slate-300" :
                      doc.rank === 3 ? "bg-amber-50 text-amber-900 border border-amber-200" : "text-gray-400"
                    }`}>
                      #{doc.rank}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-gray-900 group-hover:text-blue-600">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold">{doc.name}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({doc.facility.replace(" Hospital", "")})</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-gray-600 font-semibold">{doc.department}</td>
                  <td className="py-3.5 px-4 text-right font-black text-gray-900">{formatMoney(doc.invoicedRevenue)}</td>
                  <td className="py-3.5 px-4 text-right font-black text-emerald-600">{formatMoney(doc.realizedCollections)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${doc.realizationRate}%` }} />
                      </div>
                      <span className="font-bold text-gray-700 w-7 text-right">{doc.realizationRate}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-semibold text-blue-700">{formatMoney(doc.consultBillings)}</td>
                  <td className="py-3.5 px-4 text-right font-semibold text-indigo-700">{formatMoney(doc.procedureBillings)}</td>
                  <td className="py-3.5 px-4 text-right text-gray-600 font-medium">{formatMoney(doc.labOrderYield)}</td>
                  <td className="py-3.5 px-4 text-right text-gray-600 font-medium">{formatMoney(doc.pharmacyYield)}</td>
                  <td className="py-3.5 px-4 text-right font-black text-purple-700">{formatMoney(doc.ecosystemValue)}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      doc.tier === "Elite Revenue Leader" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      doc.tier === "High Performer" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {doc.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Summary Totals Row */}
            <tfoot className="bg-gray-50/90 font-black text-xs border-t-2 border-gray-200">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-gray-700">Total Hospital Doctors (6)</td>
                <td className="py-3 px-4 text-right text-gray-900">{formatMoney(totals.invoiced)}</td>
                <td className="py-3 px-4 text-right text-emerald-700">{formatMoney(totals.collected)}</td>
                <td className="py-3 px-4 text-right text-emerald-700">{totals.rate}% Avg</td>
                <td className="py-3 px-4 text-right text-blue-700">{formatMoney(totals.consults)}</td>
                <td className="py-3 px-4 text-right text-indigo-700">{formatMoney(totals.procedures)}</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatMoney(totals.lab)}</td>
                <td className="py-3 px-4 text-right text-gray-700">{formatMoney(totals.pharm)}</td>
                <td className="py-3 px-4 text-right text-purple-700">{formatMoney(totals.ecosystem)}</td>
                <td className="py-3 px-4 text-center text-gray-500 font-semibold">100% Reconciled</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
