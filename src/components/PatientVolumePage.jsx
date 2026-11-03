"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  RotateCcw, 
  Calendar, 
  Search, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  Stethoscope 
} from "lucide-react";
import { calculateNonRevenueMetrics, calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";
import { formatNum } from "../data/mockData";

export default function PatientVolumePage({ encounters = [], onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter completed visits
  const completedVisits = useMemo(() => {
    return encounters.filter(e => e.consultStatus === "Completed");
  }, [encounters]);

  const metrics = useMemo(() => calculateNonRevenueMetrics(encounters), [encounters]);
  const doctorMetrics = useMemo(() => calculateDoctorNonRevenueMetrics(encounters), [encounters]);

  // Daily timeline
  const dailyVisits = useMemo(() => {
    const map = {};
    completedVisits.forEach(e => {
      map[e.date] = (map[e.date] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [completedVisits]);

  const maxDaily = Math.max(1, ...dailyVisits.map(d => d.count));
  const maxDocVisits = Math.max(1, ...doctorMetrics.map(d => d.totalPatientVisits));

  // Table rows filtering
  const filteredRows = useMemo(() => {
    let result = [...completedVisits];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(e => 
        e.patientId.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        e.patientName.toLowerCase().includes(q) ||
        e.doctorName.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    }
    if (classFilter === "New") {
      result = result.filter(e => e.isNewPatient);
    } else if (classFilter === "Returning") {
      result = result.filter(e => e.isReturningPatient);
    }
    return result;
  }, [completedVisits, searchTerm, classFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Prompt Section 5: Top 5 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Patient Visits */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
              Visits
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatNum(metrics.totalPatientVisits)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Total Patient Visits</div>
          <p className="text-[11px] text-gray-400 mt-2">Completed clinical encounters</p>
        </div>

        {/* Card 2: Unique Patients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-200">
              By ID
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatNum(metrics.uniquePatients)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Unique Patients</div>
          <p className="text-[11px] text-gray-400 mt-2">Counted using patient ID strictly</p>
        </div>

        {/* Card 3: New Patients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              First Visit
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">
            {formatNum(metrics.newPatients)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">New Patients</div>
          <p className="text-[11px] text-gray-400 mt-2">First encounter across lifetime history</p>
        </div>

        {/* Card 4: Returning Patients */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <RotateCcw className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Returning
            </span>
          </div>
          <div className="text-3xl font-black text-purple-600 tracking-tight">
            {formatNum(metrics.returningPatients)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Returning Patients</div>
          <p className="text-[11px] text-gray-400 mt-2">≥1 prior visits in historical registry</p>
        </div>

        {/* Card 5: Average Patients per Day */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Daily Yield
            </span>
          </div>
          <div className="text-3xl font-black text-amber-600 tracking-tight">
            {metrics.avgPatientsPerDay}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Average Patients / Day</div>
          <p className="text-[11px] text-gray-400 mt-2">
            {metrics.totalPatientVisits} visits ÷ {metrics.operationalDays} active days
          </p>
        </div>
      </div>

      {/* 2. Charts: Line Chart (Visits Over Time) & Bar Chart (Doctor Volume Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Line Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Patient Visits Over Time</span>
              </h3>
              <p className="text-xs text-gray-500">Daily qualifying visits throughout the measurement period</p>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
              {metrics.operationalDays} Active Days
            </span>
          </div>

          <div className="relative w-full h-56 pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              {[0, 0.5, 1].map((pct, idx) => {
                const y = 160 - pct * 130;
                return (
                  <g key={idx}>
                    <line x1="30" y1={y} x2="480" y2={y} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <text x="22" y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8">
                      {Math.round(maxDaily * pct)}
                    </text>
                  </g>
                );
              })}

              {dailyVisits.length > 1 && (
                <path
                  d={`M 35 160 ` + dailyVisits.map((d, i) => {
                    const x = 35 + (i / (dailyVisits.length - 1)) * 440;
                    const y = 160 - (d.count / maxDaily) * 130;
                    return `L ${x} ${y} `;
                  }).join("") + `L 475 160 Z`}
                  fill="#3b82f6"
                  opacity="0.15"
                />
              )}

              {dailyVisits.length > 1 && (
                <path
                  d={dailyVisits.map((d, i) => {
                    const x = 35 + (i / (dailyVisits.length - 1)) * 440;
                    const y = 160 - (d.count / maxDaily) * 130;
                    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                  }).join(" ")}
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {dailyVisits.map((d, i) => {
                const x = 35 + (i / (dailyVisits.length - 1)) * 440;
                const y = 160 - (d.count / maxDaily) * 130;
                return (
                  <circle
                    key={d.date}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#ffffff"
                    stroke="#2563eb"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 px-6">
            <span>{dailyVisits[0]?.date}</span>
            <span>{dailyVisits[dailyVisits.length - 1]?.date}</span>
          </div>
        </div>

        {/* Bar Chart: Doctor Volume Distribution */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Doctor Patient Volume Comparison</span>
              </h3>
              <p className="text-xs text-gray-500">Total patient visits vs unique patients across physicians</p>
            </div>
          </div>

          <div className="space-y-3.5 pt-1">
            {doctorMetrics.map((doc) => {
              const visitPct = (doc.totalPatientVisits / maxDocVisits) * 100;
              const uniquePct = (doc.uniquePatients / maxDocVisits) * 100;
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
                    <span className="text-blue-600 font-extrabold">
                      {doc.totalPatientVisits} visits <span className="text-gray-400 font-normal">({doc.uniquePatients} unique · {doc.avgPatientsPerDay} avg/day)</span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                    <div 
                      className="bg-blue-600 h-full rounded-full" 
                      style={{ width: `${visitPct}%` }}
                      title={`Visits: ${doc.totalPatientVisits}`}
                    />
                    <div 
                      className="bg-indigo-400 h-full rounded-full" 
                      style={{ width: `${uniquePct}%` }}
                      title={`Unique: ${doc.uniquePatients}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Detailed Patient Volume Encounter Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[260px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient ID, name, doctor, MRN..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Classification Filter Buttons */}
            <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => { setClassFilter("All"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  classFilter === "All" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({completedVisits.length})
              </button>
              <button
                onClick={() => { setClassFilter("New"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  classFilter === "New" ? "bg-white text-emerald-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                New Patients ({metrics.newPatients})
              </button>
              <button
                onClick={() => { setClassFilter("Returning"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  classFilter === "Returning" ? "bg-white text-purple-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Returning ({metrics.returningPatients})
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredRows.length}</strong> qualifying encounter records
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Encounter ID</th>
                <th className="py-3 px-4">Visit Date</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Speciality</th>
                <th className="py-3 px-4 text-center">Visit Classification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No patient encounters found matching the query.
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
                    <td className="py-3 px-4 font-medium text-gray-700">{e.date}</td>
                    <td className="py-3 px-4 font-bold text-gray-900">{e.doctorName}</td>
                    <td className="py-3 px-4 text-gray-600">{e.department}</td>
                    <td className="py-3 px-4 text-center">
                      {e.isNewPatient ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          New Patient
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          Returning Patient
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
