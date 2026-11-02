"use client";

import React, { useState, useMemo } from "react";
import { 
  Repeat, 
  UserCheck, 
  Stethoscope, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { calculateNonRevenueMetrics, calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";

export default function ContinuityOfCarePage({ encounters = [], onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sameDocOnly, setSameDocOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const metrics = useMemo(() => calculateNonRevenueMetrics(encounters), [encounters]);
  const doctorMetrics = useMemo(() => calculateDoctorNonRevenueMetrics(encounters), [encounters]);

  // Build sequential patient visit chain to show previous visit date, previous doctor vs current visit date, current doctor
  const continuityRecords = useMemo(() => {
    // Group completed visits by patientId sorted by date
    const patientMap = new Map();
    encounters
      .filter(e => e.consultStatus === "Completed")
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(e => {
        if (!patientMap.has(e.patientId)) {
          patientMap.set(e.patientId, []);
        }
        patientMap.get(e.patientId).push(e);
      });

    const records = [];
    patientMap.forEach((visits, pId) => {
      for (let i = 1; i < visits.length; i++) {
        const prev = visits[i - 1];
        const curr = visits[i];
        records.push({
          key: `${curr.id}-${i}`,
          patientId: pId,
          patientName: curr.patientName,
          previousVisitDate: prev.date,
          currentVisitDate: curr.date,
          previousDoctor: prev.doctorName,
          currentDoctor: curr.doctorName,
          sameDoctor: prev.doctorName === curr.doctorName,
          department: curr.department
        });
      }
    });
    return records;
  }, [encounters]);

  const filteredRows = useMemo(() => {
    let result = [...continuityRecords];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.patientId.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        r.previousDoctor.toLowerCase().includes(q) ||
        r.currentDoctor.toLowerCase().includes(q)
      );
    }
    if (sameDocOnly) {
      result = result.filter(r => r.sameDoctor);
    }
    return result;
  }, [continuityRecords, searchTerm, sameDocOnly]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Prompt Section 8: Three Summary Cards with Clear Calculation Definitions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Patient Retention Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              30-Day Window
            </span>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">
            {metrics.patientRetentionRate}%
          </div>
          <div className="text-xs font-bold text-gray-800 mt-1">Patient Retention Rate</div>
          <div className="p-2.5 rounded-xl bg-gray-50 text-[11px] text-gray-500 mt-3 border border-gray-100 flex items-start gap-1.5 leading-snug">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Definition:</strong> % of eligible patients who return for a subsequent visit within the follow-up window. Denominator: Unique patients ({metrics.uniquePatients}).
            </span>
          </div>
        </div>

        {/* Card 2: Repeat-Visit Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              ≥2 Visits
            </span>
          </div>
          <div className="text-3xl font-black text-purple-600 tracking-tight">
            {metrics.repeatVisitRate}%
          </div>
          <div className="text-xs font-bold text-gray-800 mt-1">Repeat-Visit Rate</div>
          <div className="p-2.5 rounded-xl bg-gray-50 text-[11px] text-gray-500 mt-3 border border-gray-100 flex items-start gap-1.5 leading-snug">
            <Info className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Definition:</strong> % of patients with more than one qualifying visit during the defined period ({metrics.multiVisitPatientsCount} repeat / {metrics.uniquePatients} unique).
            </span>
          </div>
        </div>

        {/* Card 3: Same-Doctor Continuity Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Physician Loyalty
            </span>
          </div>
          <div className="text-3xl font-black text-teal-600 tracking-tight">
            {metrics.sameDoctorContinuityRate}%
          </div>
          <div className="text-xs font-bold text-gray-800 mt-1">Same-Doctor Continuity Rate</div>
          <div className="p-2.5 rounded-xl bg-gray-50 text-[11px] text-gray-500 mt-3 border border-gray-100 flex items-start gap-1.5 leading-snug">
            <Info className="w-3.5 h-3.5 text-teal-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Definition:</strong> % of returning patients who revisit the exact same physician ({metrics.sameDoctorVisitsCount} / {metrics.returningEncountersCount} return encounters).
            </span>
          </div>
        </div>
      </div>

      {/* 2. Doctor-Wise Comparison Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-purple-600" />
              <span>Doctor-Wise Retention & Continuity Rates</span>
            </h3>
            <p className="text-xs text-gray-500">Comparison of patient retention and same-doctor continuity</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Retention %
            </span>
            <span className="flex items-center gap-1.5 text-teal-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" /> Same-Doctor Continuity %
            </span>
          </div>
        </div>

        <div className="space-y-3.5 pt-1 max-w-3xl">
          {doctorMetrics.map((doc) => (
            <div 
              key={doc.doctorId}
              onClick={() => onSelectDoctor && onSelectDoctor(doc.doctorName)}
              className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1">
                <span>
                  {doc.doctorName} <span className="text-[10px] font-medium text-gray-400">({doc.department})</span>
                </span>
                <span className="font-extrabold">
                  <span className="text-blue-600">{doc.patientRetentionRate}% Retention</span>
                  <span className="text-gray-300 mx-1.5">|</span>
                  <span className="text-teal-700">{doc.sameDoctorContinuityRate}% Continuity</span>
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                <div 
                  className="bg-blue-600 h-full rounded-full" 
                  style={{ width: `${doc.patientRetentionRate}%` }} 
                />
                <div 
                  className="bg-teal-500 h-full rounded-full" 
                  style={{ width: `${doc.sameDoctorContinuityRate}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Detailed Patient Continuity Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, previous/current doctor..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <button
              onClick={() => { setSameDocOnly(!sameDocOnly); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                sameDocOnly 
                  ? "bg-teal-50 text-teal-700 border-teal-300" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {sameDocOnly ? "✓ Showing Same Doctor Only" : "Filter: Same Doctor Only"}
            </button>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredRows.length}</strong> sequential return encounters
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Previous Visit Date</th>
                <th className="py-3 px-4">Current Visit Date</th>
                <th className="py-3 px-4">Previous Doctor</th>
                <th className="py-3 px-4">Current Doctor</th>
                <th className="py-3 px-4 text-center">Same Doctor?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No continuity visit sequences found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => (
                  <tr key={r.key} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {r.patientId}
                      <span className="block text-[10px] font-sans font-normal text-gray-400">{r.patientName}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-600">{r.previousVisitDate}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{r.currentVisitDate}</td>
                    <td className="py-3 px-4 text-gray-700">{r.previousDoctor}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{r.currentDoctor}</td>
                    <td className="py-3 px-4 text-center">
                      {r.sameDoctor ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Yes (Same Doctor)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Cross-Doctor
                        </span>
                      )}
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
