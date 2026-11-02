"use client";

import React, { useState, useMemo } from "react";
import { 
  Stethoscope, 
  Search, 
  ArrowUpDown, 
  LayoutGrid, 
  Table as TableIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Users, 
  Calendar, 
  Award,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";
import { formatNum } from "../data/mockData";

export default function DoctorPerformanceMasterTable({ encounters = [], onSelectDoctor }) {
  const [layoutMode, setLayoutMode] = useState("table"); // "table" | "cards"
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("totalPatientVisits");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Aggregate 16-parameter doctor performance metrics
  const doctorMetrics = useMemo(() => {
    return calculateDoctorNonRevenueMetrics(encounters);
  }, [encounters]);

  // Filter & Sort
  const filteredDoctors = useMemo(() => {
    let result = [...doctorMetrics];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.doctorName.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.facility.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let va = a[sortKey] ?? "";
      let vb = b[sortKey] ?? "";
      if (typeof va === "number" && typeof vb === "number") {
        return sortAsc ? va - vb : vb - va;
      }
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

    return result;
  }, [doctorMetrics, searchTerm, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-200 bg-gray-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search physician name, department, branch..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Layout Switcher: Master Table vs Doccure Cards */}
            <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setLayoutMode("table")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === "table" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Doccure Master Table (16 Columns)</span>
              </button>
              <button
                onClick={() => setLayoutMode("cards")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === "cards" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Doctor Profile Cards</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredDoctors.length}</strong> active specialists
          </div>
        </div>

        {/* 2. View 1: Master Table with all 16 Columns (Prompt Section 10) */}
        {layoutMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50/90 text-gray-500 uppercase tracking-wider font-extrabold text-[10px] border-b border-gray-200 select-none">
                <tr>
                  <th onClick={() => handleSort("doctorName")} className="py-3 px-3.5 cursor-pointer hover:text-blue-600 sticky left-0 bg-gray-50 z-10 shadow-r">
                    <div className="flex items-center gap-1">Doctor Name <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("department")} className="py-3 px-3.5 cursor-pointer hover:text-blue-600">
                    <div className="flex items-center gap-1">Department <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("totalPatientVisits")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Total Visits <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("uniquePatients")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Unique Patients <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("newPatients")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">New Patients <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("returningPatients")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Returning <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("followUpsCompleted")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Follow-ups <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("prescriptionsWritten")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Prescriptions <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("labInvestigationOrders")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Lab Orders <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("proceduresPerformed")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Procedures <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("referralsMade")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Referrals <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("patientRetentionRate")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Retention % <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("repeatVisitRate")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Repeat % <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("sameDoctorContinuityRate")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Continuity % <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("opdToIpdConversionRate")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">OPD→IPD % <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th onClick={() => handleSort("admissionsInitiated")} className="py-3 px-3.5 text-right cursor-pointer hover:text-blue-600">
                    <div className="flex items-center justify-end gap-1">Admissions <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedDoctors.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="py-12 text-center text-gray-400">
                      No doctor records match the criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedDoctors.map((doc) => (
                    <tr 
                      key={doc.doctorId}
                      onClick={() => onSelectDoctor && onSelectDoctor(doc.doctorName)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* 1. Doctor Name (sticky left) */}
                      <td className="py-3 px-3.5 font-bold text-gray-900 group-hover:text-blue-600 sticky left-0 bg-white group-hover:bg-blue-50/40 z-10 shadow-r">
                        <div className="flex items-center gap-1.5">
                          <span>{doc.doctorName}</span>
                          <span className="text-[10px] text-blue-500 font-bold" title="Verified">✓</span>
                        </div>
                      </td>
                      {/* 2. Department */}
                      <td className="py-3 px-3.5 text-gray-600">{doc.department}</td>
                      {/* 3. Total Visits */}
                      <td className="py-3 px-3.5 text-right font-extrabold text-blue-600">{doc.totalPatientVisits}</td>
                      {/* 4. Unique Patients */}
                      <td className="py-3 px-3.5 text-right font-semibold text-gray-800">{doc.uniquePatients}</td>
                      {/* 5. New Patients */}
                      <td className="py-3 px-3.5 text-right font-semibold text-emerald-700">{doc.newPatients}</td>
                      {/* 6. Returning Patients */}
                      <td className="py-3 px-3.5 text-right font-semibold text-purple-700">{doc.returningPatients}</td>
                      {/* 7. Follow-ups Completed */}
                      <td className="py-3 px-3.5 text-right font-bold text-teal-700">{doc.followUpsCompleted}</td>
                      {/* 8. Prescriptions Written */}
                      <td className="py-3 px-3.5 text-right text-gray-800">{doc.prescriptionsWritten}</td>
                      {/* 9. Lab Investigation Orders */}
                      <td className="py-3 px-3.5 text-right text-gray-800">{doc.labInvestigationOrders}</td>
                      {/* 10. Procedures Performed */}
                      <td className="py-3 px-3.5 text-right font-semibold text-purple-700">{doc.proceduresPerformed}</td>
                      {/* 11. Referrals Made */}
                      <td className="py-3 px-3.5 text-right text-amber-700">{doc.referralsMade}</td>
                      {/* 12. Patient Retention Rate */}
                      <td className="py-3 px-3.5 text-right font-bold text-gray-900">{doc.patientRetentionRate}%</td>
                      {/* 13. Repeat-Visit Rate */}
                      <td className="py-3 px-3.5 text-right font-bold text-gray-900">{doc.repeatVisitRate}%</td>
                      {/* 14. Same-Doctor Continuity Rate */}
                      <td className="py-3 px-3.5 text-right font-bold text-teal-700">{doc.sameDoctorContinuityRate}%</td>
                      {/* 15. OPD-to-IPD Conversion Rate */}
                      <td className="py-3 px-3.5 text-right font-bold text-indigo-700">{doc.opdToIpdConversionRate}%</td>
                      {/* 16. Admissions Initiated */}
                      <td className="py-3 px-3.5 text-right font-black text-gray-900">{doc.admissionsInitiated}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* View 2: Doccure Profile Cards */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-gray-50/50">
            {paginatedDoctors.map((doc, idx) => {
              const avatars = ["👩‍⚕️", "👨‍⚕️", "👩‍⚕️", "👨‍⚕️", "👩‍⚕️", "👨‍⚕️"];
              return (
                <div
                  key={doc.doctorId}
                  onClick={() => onSelectDoctor && onSelectDoctor(doc.doctorName)}
                  className="p-5 rounded-2xl bg-white border border-gray-200/90 hover:border-blue-400 hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Header profile */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-3xl shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0">
                        {avatars[idx % avatars.length]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                            {doc.doctorName}
                          </h4>
                          <span className="text-blue-500 text-xs font-bold" title="Verified Specialist">✓</span>
                        </div>
                        <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                          {doc.department}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-1">
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                            4.9 (48)
                          </span>
                          <span>•</span>
                          <span>{doc.experience}</span>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-gray-50 p-2 rounded-xl text-xs text-gray-600 flex items-center justify-between mb-4 border border-gray-200/70">
                      <span className="flex items-center gap-1 text-[11px] text-gray-500">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span>{doc.facility}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white text-gray-700 font-bold text-[10px] border border-gray-200">
                        {doc.opdRoom}
                      </span>
                    </div>

                    {/* 4 Key Metric Tiles */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                      <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Visits</span>
                        <div className="text-base font-black text-blue-900">{doc.totalPatientVisits}</div>
                        <span className="text-[9px] text-blue-600">{doc.uniquePatients} unique</span>
                      </div>
                      <div className="p-2 rounded-xl bg-teal-50/60 border border-teal-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Follow-ups</span>
                        <div className="text-base font-black text-teal-900">{doc.followUpsCompleted}</div>
                        <span className="text-[9px] font-bold text-teal-700">Completed</span>
                      </div>
                      <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Procedures</span>
                        <div className="text-base font-black text-purple-900">{doc.proceduresPerformed}</div>
                        <span className="text-[9px] text-purple-600">{doc.prescriptionsWritten} Rx</span>
                      </div>
                      <div className="p-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
                        <span className="text-[10px] font-bold text-gray-500 uppercase">Retention</span>
                        <div className="text-base font-black text-indigo-900">{doc.patientRetentionRate}%</div>
                        <span className="text-[9px] text-indigo-600">{doc.admissionsInitiated} IPD</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-2 bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <span>View Doctor Scorecard →</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
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
