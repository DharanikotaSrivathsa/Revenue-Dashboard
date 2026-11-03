"use client";

import React, { useState, useMemo } from "react";
import { 
  Stethoscope, 
  Search, 
  ArrowUpDown, 
  Eye, 
  Award, 
  Percent, 
  DollarSign, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronRight,
  UserCheck,
  Activity,
  CheckCircle2,
  Star,
  MapPin,
  ArrowRight,
  Sparkles,
  Layers,
  MoreVertical,
  Phone,
  Edit,
  Clock,
  ShieldCheck,
  ChevronLeft
} from "lucide-react";
import { DOCTORS, formatMoney, formatNum } from "../data/mockData";
import NonRevenuePerformance from "./NonRevenuePerformance";
import DoctorPerformanceMasterTable from "./DoctorPerformanceMasterTable";
import DoctorProductsSold from "./DoctorProductsSold";
import DoctorCommercialMatrix from "./DoctorCommercialMatrix";
import DoctorFinancialPies from "./DoctorFinancialPies";

export default function DoctorPerformance({ encounters, onSelectDoctor }) {
  // 3 sub-tabs agreed with user: "financial" | "clinical" | "matrix"
  const [viewMode, setViewMode] = useState("financial"); 
  const [layoutMode, setLayoutMode] = useState("grid"); // "grid" | "table"
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("net");
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredDoc, setHoveredDoc] = useState(null);
  const pageSize = 6;

  // React to URL query params
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const v = searchParams.get("view");
      const l = searchParams.get("layout");
      if (["financial", "clinical", "matrix"].includes(v)) setViewMode(v);
      if (["grid", "table"].includes(l)) setLayoutMode(l);
    }
  }, []);

  // Aggregate stats per doctor
  const doctorStats = useMemo(() => {
    return DOCTORS.map((doc, idx) => {
      const docEncounters = encounters.filter((e) => e.doctorName === doc.name);
      const consultNet = docEncounters.reduce((s, e) => s + e.consultNet, 0);
      const labNet = docEncounters.reduce((s, e) => s + e.labNet, 0);
      const pharmNet = docEncounters.reduce((s, e) => s + e.pharmNet, 0);
      const procNet = docEncounters.reduce((s, e) => s + e.procNet, 0);
      const directYield = consultNet + procNet; // Direct revenue from BluadConsultation
      const labOrders = docEncounters.filter(e => e.hasLab).length;
      const prescriptionsWritten = docEncounters.filter(e => e.hasRx).length;
      const admissionsInitiated = docEncounters.filter(e => e.admissionInitiated).length;
      const net = docEncounters.reduce((s, e) => s + e.totalNet, 0);
      const collected = docEncounters.reduce((s, e) => s + e.collected, 0);
      const outstanding = docEncounters.reduce((s, e) => s + e.outstanding, 0);
      const consultsCompleted = docEncounters.filter((e) => e.consultStatus === "Completed").length;
      const uniquePatients = new Set(docEncounters.map((e) => e.patientId)).size;
      const packageEncs = docEncounters.filter(e => e.invoiceType === "PACKAGE");
      const packageNet = packageEncs.reduce((s, e) => s + e.totalNet, 0);
      const packageCount = packageEncs.length;
      const collectionRate = net > 0 ? Math.round((collected / net) * 100) : 0;

      // Payment mode breakdown for this doctor
      const payModes = {};
      docEncounters.forEach(e => {
        payModes[e.payMode] = (payModes[e.payMode] || 0) + e.collected;
      });
      const topPayMode = Object.entries(payModes).sort((a, b) => b[1] - a[1])[0] || ["Cash", 0];
      const topPayModePct = collected > 0 ? Math.round((topPayMode[1] / collected) * 100) : 0;

      return {
        id: doc.id,
        code: `DOC-${String(idx + 1).padStart(4, "0")}`,
        name: doc.name,
        dept: doc.dept,
        facility: doc.facility,
        experience: doc.experience,
        room: doc.opdRoom,
        encountersCount: docEncounters.length,
        consultsCompleted,
        uniquePatients,
        consultNet,
        labNet,
        pharmNet,
        procNet,
        directYield,
        labOrders,
        prescriptionsWritten,
        admissionsInitiated,
        net,
        collected,
        outstanding,
        collectionRate,
        packageNet,
        packageCount,
        topPayMode,
        topPayModePct,
        payModes,
        encounters: docEncounters
      };
    }).filter(d => d.encountersCount > 0);
  }, [encounters]);

  // Filter & Sort Table
  const filteredDoctors = useMemo(() => {
    let result = [...doctorStats];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.dept.toLowerCase().includes(q) || 
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
  }, [doctorStats, searchTerm, sortKey, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / pageSize));
  const paginatedDoctors = filteredDoctors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const maxNetVal = Math.max(1, ...doctorStats.map(d => Math.max(d.net, d.collected, d.outstanding)));

  // SVG Chart Geometry
  const chartW = 740, chartH = 220, pL = 50, pR = 20, pT = 16, pB = 36;
  const colWidth = (chartW - pL - pR) / Math.max(1, doctorStats.length);
  const barW = Math.min(22, (colWidth - 14) / 3);

  // Doccure Card Accent Borders (From user screenshot: purple, rose, blue, teal, amber, emerald)
  const cardBorderAccents = [
    "border-t-purple-500",
    "border-t-rose-500",
    "border-t-blue-500",
    "border-t-teal-500",
    "border-t-amber-500",
    "border-t-emerald-500"
  ];

  return (
    <div className="space-y-6 w-full min-w-0 max-w-full">
      {/* 1. Sub-Tabs Switcher (Financial & Revenue, Clinical Workflow & Patient Volume, 16-Metric Master Matrix) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 w-full min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tab 1: Revenue & Realization Scorecards */}
          <button
            onClick={() => setViewMode("financial")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === "financial"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Revenue & Realization</span>
          </button>

          {/* Tab 2: Top Products & Services Sold by Doctor */}
          <button
            onClick={() => setViewMode("clinical")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === "clinical"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Top Products & Services Sold</span>
          </button>

          {/* Tab 3: Top Doctor Commercial Ranking Matrix */}
          <button
            onClick={() => setViewMode("matrix")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewMode === "matrix"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>Commercial Matrix</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-medium">
          {viewMode === "financial" && "Doctor net revenues, fee splits, and cash recovery efficiency"}
          {viewMode === "clinical" && "Attribution of procedures performed, lab investigations ordered, and pharmacy sales by doctor"}
          {viewMode === "matrix" && "12-parameter commercial ranking matrix comparing doctors by financial yield and collection rate"}
        </div>
      </div>

      {/* Sub-tab 2 View: Top Products & Services Sold by Doctor */}
      {viewMode === "clinical" && (
        <DoctorProductsSold encounters={encounters} onSelectDoctor={onSelectDoctor} />
      )}

      {/* Sub-tab 3 View: Top Doctor Commercial Ranking Matrix */}
      {viewMode === "matrix" && (
        <DoctorCommercialMatrix encounters={encounters} onSelectDoctor={onSelectDoctor} />
      )}

      {/* Sub-tab 1 View: Financial & Revenue Scorecards */}
      {viewMode === "financial" && (
        <>
          {/* KPI Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full min-w-0">
            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Active Doctors</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">
                {doctorStats.length} Specialists
              </div>
              <p className="text-xs text-gray-500 mt-1">Providing inpatient & OPD care</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Top Physician Yield</span>
                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-lg font-bold text-gray-900 truncate">
                {doctorStats[0]?.name || "—"}
              </div>
              <p className="text-xs text-emerald-600 font-bold mt-1">
                {formatMoney(doctorStats[0]?.net || 0)} Net Realized
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Yield Per Doctor</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">
                {formatMoney(doctorStats.length ? Math.round(doctorStats.reduce((s, d) => s + d.net, 0) / doctorStats.length) : 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all clinical service lines</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Collection Rate</span>
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-purple-600 tracking-tight">
                {doctorStats.length ? Math.round(doctorStats.reduce((s, d) => s + d.collectionRate, 0) / doctorStats.length) : 0}%
              </div>
              <p className="text-xs text-gray-500 mt-1">Cash recovery efficiency</p>
            </div>
          </div>

          <DoctorFinancialPies doctors={doctorStats} onSelectDoctor={onSelectDoctor} />

          {/* Doctor Profile Cards / Matrix View matching Doccure HMS reference */}
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden w-full min-w-0">
            {/* Header controls bar */}
            <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative min-w-[220px]">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search doctor, speciality, room..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none font-medium"
                  />
                </div>

                <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setLayoutMode("grid")}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      layoutMode === "grid" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Doccure Cards</span>
                  </button>
                  <button
                    onClick={() => setLayoutMode("table")}
                    className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      layoutMode === "table" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                    <span>Table View</span>
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-500 font-medium">
                Showing <strong>{filteredDoctors.length}</strong> active doctors
              </div>
            </div>

            {/* Doccure HMS Card Grid (Exact styling from user screenshot) */}
            {layoutMode === "grid" ? (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-gray-50/40">
                {paginatedDoctors.map((doc, idx) => {
                  const borderAccent = cardBorderAccents[idx % cardBorderAccents.length];
                  const avatars = ["👨‍⚕️", "👩‍⚕️", "👨‍⚕️", "👩‍⚕️", "👨‍⚕️", "👩‍⚕️"];

                  return (
                    <div
                      key={doc.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectDoctor(doc.name)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelectDoctor(doc.name); } }}
                      className={`rounded-2xl bg-white border border-gray-200/90 border-t-4 ${borderAccent} shadow-2xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500/40`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-indigo-100 border border-blue-200/80 flex items-center justify-center text-2xl flex-shrink-0">
                          {avatars[idx % avatars.length]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm text-gray-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">
                            {doc.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 font-medium truncate">
                            {doc.dept} · {doc.facility.replace(" Hospital", "")}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Revenue</span>
                          <span className="text-sm font-black text-gray-900">{formatMoney(doc.net)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Packages</span>
                          <span className="text-sm font-black text-emerald-700">{formatMoney(doc.packageNet)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Collected</span>
                          <span className="text-sm font-black text-blue-700">{doc.collectionRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Doctor</th>
                      <th className="py-3 px-4">Speciality</th>
                      <th className="py-3 px-4">Facility</th>
                      <th className="py-3 px-4 text-right">Consult Billed</th>
                      <th className="py-3 px-4 text-center">Consults</th>
                      <th className="py-3 px-4 text-right">Direct Billed (Bluad)</th>
                      <th className="py-3 px-4 text-right">Hospital Invoiced</th>
                      <th className="py-3 px-4 text-right">Package Revenue</th>
                      <th className="py-3 px-4 text-right">Collected</th>
                      <th className="py-3 px-4 text-right">Due</th>
                      <th className="py-3 px-4 text-center">Rate</th>
                      <th className="py-3 px-4">Influenced Pipeline</th>
                      <th className="py-3 px-4">Primary Channel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedDoctors.map(doc => (
                      <tr 
                        key={doc.id} 
                        onClick={() => onSelectDoctor(doc.name)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-bold text-gray-900">{doc.name}</td>
                        <td className="py-3 px-4 text-gray-600">{doc.dept}</td>
                        <td className="py-3 px-4 text-gray-500">{doc.facility}</td>
                        <td className="py-3 px-4 text-right font-bold text-blue-700">{formatMoney(doc.consultNet)}</td>
                        <td className="py-3 px-4 text-center text-gray-700">{doc.consultsCompleted}</td>
                        <td className="py-3 px-4 text-right font-black text-indigo-700">{formatMoney(doc.directYield)}</td>
                        <td className="py-3 px-4 text-right font-black text-gray-900">{formatMoney(doc.net)}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">{formatMoney(doc.packageNet)}</td>
                        <td className="py-3 px-4 text-right font-bold text-teal-700">{formatMoney(doc.collected)}</td>
                        <td className="py-3 px-4 text-right font-bold text-amber-700">{formatMoney(doc.outstanding)}</td>
                        <td className="py-3 px-4 text-center font-bold text-gray-900">{doc.collectionRate}%</td>
                        <td className="py-3 px-4 text-xs font-medium text-gray-600">
                          <span className="text-teal-700 font-semibold">{doc.labOrders}L</span> · 
                          <span className="text-amber-700 font-semibold mx-1">{doc.prescriptionsWritten}Rx</span> · 
                          <span className="text-blue-700 font-semibold">{doc.admissionsInitiated}IPD</span>
                        </td>
                        <td className="py-3 px-4 text-xs font-semibold text-blue-700">
                          {doc.topPayMode[0]} ({doc.topPayModePct}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doccure Pagination Footer (Matching user screenshot) */}
            <div className="p-4 bg-white border-t border-gray-200/90 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <span>Rows per page</span>
                <span className="px-2 py-1 rounded-md bg-gray-100 border border-gray-200 font-bold text-gray-800">
                  {pageSize}
                </span>
                <span>Showing 1–{paginatedDoctors.length} of {filteredDoctors.length}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-gray-400 mr-1">Jump</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  defaultValue="1"
                  className="w-10 h-7 text-center rounded-lg border border-gray-200 text-xs font-bold"
                />
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === i + 1 
                        ? "bg-blue-600 text-white shadow-xs" 
                        : "border border-gray-200 hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
