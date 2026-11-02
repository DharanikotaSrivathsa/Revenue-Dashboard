"use client";

import React, { useState, useMemo } from "react";
import { 
  Building2, 
  ArrowUpRight, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Info,
  Bed,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { calculateNonRevenueMetrics, calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";
import { formatNum } from "../data/mockData";

export default function HospitalOperationsPage({ encounters = [], onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const metrics = useMemo(() => calculateNonRevenueMetrics(encounters), [encounters]);
  const doctorMetrics = useMemo(() => calculateDoctorNonRevenueMetrics(encounters), [encounters]);

  // Actual inpatient admissions initiated by doctor (deduplicated per encounter)
  const admissionRecords = useMemo(() => {
    return encounters
      .filter(e => e.admissionsInitiated === 1)
      .map(e => ({
        opdEncounterId: e.id,
        patientId: e.patientId,
        patientName: e.patientName,
        initiatingDoctor: e.doctorName,
        department: e.department,
        opdVisitDate: e.date,
        admissionDate: e.admissionDate || e.date,
        admissionStatus: e.admissionStatus || "Inpatient Admitted",
        facility: e.facility
      }));
  }, [encounters]);

  const maxAdmissions = Math.max(1, ...doctorMetrics.map(d => d.admissionsInitiated));

  const filteredRows = useMemo(() => {
    let result = [...admissionRecords];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(r => 
        r.patientId.toLowerCase().includes(q) ||
        r.opdEncounterId.toLowerCase().includes(q) ||
        r.patientName.toLowerCase().includes(q) ||
        r.initiatingDoctor.toLowerCase().includes(q)
      );
    }
    return result;
  }, [admissionRecords, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Prompt Section 9: Two Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: OPD-to-IPD Conversion Rate */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Conversion Ratio
            </span>
          </div>
          <div className="text-4xl font-black text-indigo-700 tracking-tight">
            {metrics.opdToIpdConversionRate}%
          </div>
          <div className="text-sm font-bold text-gray-800 mt-1">OPD-to-IPD Conversion Rate</div>
          <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-500 mt-3 border border-gray-100 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Formula:</strong> (Admissions Initiated by Doctor ÷ Total Eligible OPD Patient Visits) × 100.
              Calculated as <strong>{metrics.admissionsInitiated}</strong> admissions ÷ <strong>{metrics.totalPatientVisits}</strong> OPD visits.
            </span>
          </div>
        </div>

        {/* Card 2: Admissions Initiated by Doctor */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Bed className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Attributed Directly</span>
            </span>
          </div>
          <div className="text-4xl font-black text-blue-600 tracking-tight">
            {formatNum(metrics.admissionsInitiated)}
          </div>
          <div className="text-sm font-bold text-gray-800 mt-1">Admissions Initiated by Doctor</div>
          <div className="p-3 rounded-xl bg-gray-50 text-xs text-gray-500 mt-3 border border-gray-100 flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>
              Count of inpatient admissions directly initiated or referred for IPD bed allocation by the attending doctor. Excludes discharge delays per specification.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Doctor-Wise Comparison Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Doctor-Wise Inpatient Admissions & Conversion Rates</span>
            </h3>
            <p className="text-xs text-gray-500">Admissions initiated and OPD conversion efficiency per physician</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-indigo-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" /> Admissions
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" /> Conversion %
            </span>
          </div>
        </div>

        <div className="space-y-3.5 pt-1 max-w-3xl">
          {doctorMetrics.map((doc) => {
            const barW = (doc.admissionsInitiated / maxAdmissions) * 100;
            return (
              <div 
                key={doc.doctorId}
                onClick={() => onSelectDoctor && onSelectDoctor(doc.doctorName)}
                className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
              >
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 mb-1">
                  <span>
                    {doc.doctorName} <span className="text-[10px] font-medium text-gray-400">({doc.department})</span>
                  </span>
                  <span className="font-extrabold text-sm">
                    <span className="text-indigo-700">{doc.admissionsInitiated} admissions</span>
                    <span className="text-gray-300 mx-2">·</span>
                    <span className="text-blue-600">{doc.opdToIpdConversionRate}% conversion</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  <div 
                    className="bg-indigo-600 h-full rounded-full" 
                    style={{ width: `${barW}%` }}
                  />
                  <div 
                    className="bg-blue-400 h-full rounded-full" 
                    style={{ width: `${Math.min(100, doc.opdToIpdConversionRate * 3)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Inpatient Admission Linkage Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient ID, OPD encounter, doctor..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredRows.length}</strong> verified inpatient admission linkages
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">OPD Encounter ID</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Initiating Doctor</th>
                <th className="py-3 px-4">OPD Visit Date</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4 text-center">Admission Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No hospital admission records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((r) => (
                  <tr key={r.opdEncounterId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-600">{r.opdEncounterId}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {r.patientId}
                      <span className="block text-[10px] font-sans font-normal text-gray-400">{r.patientName}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{r.initiatingDoctor}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{r.opdVisitDate}</td>
                    <td className="py-3 px-4 font-bold text-indigo-700">{r.admissionDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        <Bed className="w-3 h-3" />
                        {r.admissionStatus}
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
