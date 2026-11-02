"use client";

import React, { useState, useMemo } from "react";
import { 
  CheckCircle2, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Stethoscope, 
  Info,
  Calendar,
  ShieldCheck
} from "lucide-react";
import { calculateNonRevenueMetrics, calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";
import { formatNum } from "../data/mockData";

export default function FollowUpCarePage({ encounters = [], onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Follow-ups completed strictly (completed consultations only)
  const completedFollowUps = useMemo(() => {
    return encounters.filter(e => e.followUpCompleted);
  }, [encounters]);

  const metrics = useMemo(() => calculateNonRevenueMetrics(encounters), [encounters]);
  const doctorMetrics = useMemo(() => calculateDoctorNonRevenueMetrics(encounters), [encounters]);

  const maxFollowUps = Math.max(1, ...doctorMetrics.map(d => d.followUpsCompleted));

  // Filter table
  const filteredRows = useMemo(() => {
    let result = [...completedFollowUps];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.patientId.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.patientName.toLowerCase().includes(q) ||
        e.doctorName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [completedFollowUps, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Prompt Section 6: Summary Card for Follow-ups Completed ONLY */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200/90 shadow-2xs max-w-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Scope Verified</span>
          </span>
        </div>
        <div className="text-4xl font-black text-teal-700 tracking-tight">
          {formatNum(metrics.followUpsCompleted)}
        </div>
        <div className="text-sm font-bold text-gray-800 mt-1">Follow-ups Completed</div>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          Count of genuinely completed post-consultation follow-up appointments. Scheduled, pending, cancelled, or missed follow-ups are strictly excluded per HMS clinical governance requirements.
        </p>
      </div>

      {/* 2. Doctor-Wise Comparison Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Doctor-Wise Completed Follow-ups Comparison</span>
            </h3>
            <p className="text-xs text-gray-500">Number of verified follow-ups completed by each doctor</p>
          </div>
        </div>

        <div className="space-y-3.5 pt-1 max-w-3xl">
          {doctorMetrics.map((doc) => {
            const pct = (doc.followUpsCompleted / maxFollowUps) * 100;
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
                  <span className="text-teal-700 font-extrabold text-sm">
                    {doc.followUpsCompleted} completed
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="bg-teal-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Follow-up Encounter Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient ID, name, doctor..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
            />
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredRows.length}</strong> completed follow-up consultations
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Encounter ID</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Follow-up Date</th>
                <th className="py-3 px-4 text-center">Completion Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-400">
                    No completed follow-up records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((e) => (
                  <tr key={e.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {e.patientId}
                      <span className="block text-[10px] font-sans font-normal text-gray-400">{e.patientName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-gray-600">{e.id}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{e.doctorName}</td>
                    <td className="py-3 px-4 font-medium text-gray-700">{e.date}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
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
