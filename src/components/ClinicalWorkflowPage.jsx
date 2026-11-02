"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  FlaskConical, 
  Syringe, 
  ArrowUpRight, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  GitBranch 
} from "lucide-react";
import { calculateNonRevenueMetrics, calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";
import { formatNum } from "../data/mockData";

export default function ClinicalWorkflowPage({ encounters = [], onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activityTypeFilter, setActivityTypeFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const metrics = useMemo(() => calculateNonRevenueMetrics(encounters), [encounters]);
  const doctorMetrics = useMemo(() => calculateDoctorNonRevenueMetrics(encounters), [encounters]);

  // Flatten clinical activities from encounters without duplication
  const clinicalActivities = useMemo(() => {
    const list = [];
    encounters.forEach(e => {
      // 1. Prescription written
      if (e.hasRx && e.rxOrderId) {
        list.push({
          key: `rx-${e.id}`,
          encounterId: e.id,
          patientId: e.patientId,
          patientName: e.patientName,
          doctor: e.doctorName,
          activityType: "Prescription Written",
          activityDate: e.date,
          status: e.pharmStatus === "Dispensed" ? "Dispensed" : "Prescribed",
          typeClass: "bg-blue-50 text-blue-700 border-blue-200"
        });
      }
      // 2. Lab Investigation Order
      if (e.hasLab && e.labOrderId) {
        list.push({
          key: `lab-${e.id}`,
          encounterId: e.id,
          patientId: e.patientId,
          patientName: e.patientName,
          doctor: e.doctorName,
          activityType: "Lab Investigation Order",
          activityDate: e.date,
          status: e.labStatus === "Completed" ? "Completed" : "Ordered",
          typeClass: "bg-teal-50 text-teal-700 border-teal-200"
        });
      }
      // 3. Procedure Performed (status === Completed only)
      if (e.procedureCompleted === 1) {
        list.push({
          key: `proc-${e.id}`,
          encounterId: e.id,
          patientId: e.patientId,
          patientName: e.patientName,
          doctor: e.doctorName,
          activityType: "Procedure Performed",
          activityDate: e.date,
          status: "Completed",
          typeClass: "bg-purple-50 text-purple-700 border-purple-200"
        });
      }
      // 4. Referral Made
      if (e.hasReferral && e.referralId) {
        list.push({
          key: `ref-${e.id}`,
          encounterId: e.id,
          patientId: e.patientId,
          patientName: e.patientName,
          doctor: e.doctorName,
          activityType: "Referral Made",
          activityDate: e.date,
          status: "Referred",
          typeClass: "bg-amber-50 text-amber-700 border-amber-200"
        });
      }
    });
    return list;
  }, [encounters]);

  // Filter activities
  const filteredRows = useMemo(() => {
    let result = [...clinicalActivities];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.patientId.toLowerCase().includes(q) ||
        a.encounterId.toLowerCase().includes(q) ||
        a.patientName.toLowerCase().includes(q) ||
        a.doctor.toLowerCase().includes(q)
      );
    }
    if (activityTypeFilter !== "All") {
      result = result.filter(a => a.activityType === activityTypeFilter);
    }
    return result;
  }, [clinicalActivities, searchTerm, activityTypeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Prompt Section 7: Four Summary Cards (NO imaging, NO monetary values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Prescriptions Written */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Formulary Rx
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatNum(metrics.prescriptionsWritten)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Prescriptions Written</div>
          <p className="text-[11px] text-gray-400 mt-2">Deduplicated per clinical encounter</p>
        </div>

        {/* Card 2: Lab Investigation Orders */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
              Diagnostics
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatNum(metrics.labInvestigationOrders)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Lab Investigation Orders</div>
          <p className="text-[11px] text-gray-400 mt-2">Attributed to originating physician</p>
        </div>

        {/* Card 3: Procedures Performed */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Syringe className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              Completed
            </span>
          </div>
          <div className="text-3xl font-black text-purple-700 tracking-tight">
            {formatNum(metrics.proceduresPerformed)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Procedures Performed</div>
          <p className="text-[11px] text-gray-400 mt-2">Procedures actually completed</p>
        </div>

        {/* Card 4: Referrals Made */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
              Outbound
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">
            {formatNum(metrics.referralsMade)}
          </div>
          <div className="text-xs font-semibold text-gray-700 mt-0.5">Referrals Made</div>
          <p className="text-[11px] text-gray-400 mt-2">Specialist referrals initiated</p>
        </div>
      </div>

      {/* 2. Doctor-Wise Comparison Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-purple-600" />
              <span>Doctor-Wise Clinical Workflow Breakdown</span>
            </h3>
            <p className="text-xs text-gray-500">Distribution of prescriptions, lab orders, procedures and referrals</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-blue-600"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600" /> Rx</span>
            <span className="flex items-center gap-1 text-teal-600"><span className="w-2.5 h-2.5 rounded-sm bg-teal-600" /> Labs</span>
            <span className="flex items-center gap-1 text-purple-600"><span className="w-2.5 h-2.5 rounded-sm bg-purple-600" /> Procedures</span>
            <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Referrals</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {doctorMetrics.map((doc) => {
            const totalActs = doc.prescriptionsWritten + doc.labInvestigationOrders + doc.proceduresPerformed + doc.referralsMade || 1;
            const rxW = (doc.prescriptionsWritten / totalActs) * 100;
            const labW = (doc.labInvestigationOrders / totalActs) * 100;
            const procW = (doc.proceduresPerformed / totalActs) * 100;
            const refW = (doc.referralsMade / totalActs) * 100;

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
                  <span className="text-gray-500 font-normal">
                    <strong className="text-blue-600">{doc.prescriptionsWritten}</strong> Rx · <strong className="text-teal-600">{doc.labInvestigationOrders}</strong> Labs · <strong className="text-purple-600">{doc.proceduresPerformed}</strong> Procs · <strong className="text-amber-600">{doc.referralsMade}</strong> Refs
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className="bg-blue-600 h-full" style={{ width: `${rxW}%` }} title={`Prescriptions: ${doc.prescriptionsWritten}`} />
                  <div className="bg-teal-500 h-full" style={{ width: `${labW}%` }} title={`Lab Orders: ${doc.labInvestigationOrders}`} />
                  <div className="bg-purple-600 h-full" style={{ width: `${procW}%` }} title={`Procedures: ${doc.proceduresPerformed}`} />
                  <div className="bg-amber-500 h-full" style={{ width: `${refW}%` }} title={`Referrals: ${doc.referralsMade}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Clinical Activity Table */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
        <div className="p-4 bg-gray-50/70 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search ID, doctor, patient..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full h-8 pl-9 pr-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Activity Type Filters */}
            <div className="flex items-center gap-1 bg-gray-200/60 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => { setActivityTypeFilter("All"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activityTypeFilter === "All" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({clinicalActivities.length})
              </button>
              <button
                onClick={() => { setActivityTypeFilter("Prescription Written"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activityTypeFilter === "Prescription Written" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Rx ({metrics.prescriptionsWritten})
              </button>
              <button
                onClick={() => { setActivityTypeFilter("Lab Investigation Order"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activityTypeFilter === "Lab Investigation Order" ? "bg-white text-teal-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Labs ({metrics.labInvestigationOrders})
              </button>
              <button
                onClick={() => { setActivityTypeFilter("Procedure Performed"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activityTypeFilter === "Procedure Performed" ? "bg-white text-purple-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Procedures ({metrics.proceduresPerformed})
              </button>
              <button
                onClick={() => { setActivityTypeFilter("Referral Made"); setCurrentPage(1); }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activityTypeFilter === "Referral Made" ? "bg-white text-amber-700 shadow-2xs" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Referrals ({metrics.referralsMade})
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing <strong>{filteredRows.length}</strong> activity orders & completions
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 uppercase tracking-wider font-bold text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Encounter ID</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Activity Type</th>
                <th className="py-3 px-4">Activity Date</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-400">
                    No clinical workflow activities match the query.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((a) => (
                  <tr key={a.key} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-gray-600">{a.encounterId}</td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {a.patientId}
                      <span className="block text-[10px] font-sans font-normal text-gray-400">{a.patientName}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900">{a.doctor}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${a.typeClass}`}>
                        {a.activityType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-700">{a.activityDate}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {a.status}
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
