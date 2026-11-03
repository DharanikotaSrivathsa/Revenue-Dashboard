"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  FileText, 
  FlaskConical, 
  Activity, 
  GitFork, 
  RefreshCw, 
  Bed, 
  Search, 
  ArrowUpDown, 
  Eye, 
  HelpCircle, 
  Info, 
  CheckCircle2, 
  Sparkles,
  Building2,
  Stethoscope,
  TrendingUp,
  Percent
} from "lucide-react";
import { 
  calculateNonRevenueMetrics, 
  calculateDoctorNonRevenueMetrics 
} from "../data/nonRevenueCalculations.js";
import { formatNum } from "../data/mockData.js";

export default function NonRevenuePerformance({ encounters, onSelectDoctor }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("totalPatientVisits");
  const [sortAsc, setSortAsc] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'volume' | 'followup' | 'workflow' | 'continuity' | 'operations'

  // Overall enterprise / filtered scope metrics
  const summary = useMemo(() => {
    return calculateNonRevenueMetrics(encounters);
  }, [encounters]);

  // Doctor-wise breakdown
  const doctorMetrics = useMemo(() => {
    return calculateDoctorNonRevenueMetrics(encounters);
  }, [encounters]);

  // Filter & sort doctors
  const filteredDoctors = useMemo(() => {
    let list = [...doctorMetrics];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(d => 
        d.doctorName.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.facility.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      let va = a[sortKey] ?? 0;
      let vb = b[sortKey] ?? 0;
      if (typeof va === "number" && typeof vb === "number") {
        return sortAsc ? va - vb : vb - va;
      }
      return sortAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });

    return list;
  }, [doctorMetrics, searchTerm, sortKey, sortAsc]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  // Max visits for relative SVG bar charts
  const maxVisits = Math.max(1, ...doctorMetrics.map(d => d.totalPatientVisits));

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                Clinical Governance & Operational Scorecard
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                5 Non-Revenue Categories
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Doctor Non-Revenue Performance & Clinical Analytics
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Standardized healthcare operational indicators across <strong>Patient Volume</strong>, <strong>Follow-up Care</strong>, <strong>Clinical Workflow</strong>, <strong>Continuity of Care</strong>, and <strong>Hospital Operations</strong>. Evaluated independently from financial yields.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 px-4 backdrop-blur-md">
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Attended Visits</div>
              <div className="text-xl font-black text-white">{formatNum(summary.totalPatientVisits)}</div>
            </div>
            <div className="h-8 w-px bg-slate-700 mx-1" />
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unique Patients</div>
              <div className="text-xl font-black text-blue-400">{formatNum(summary.uniquePatients)}</div>
            </div>
          </div>
        </div>

        {/* Section Jump Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-5 mt-5 border-t border-slate-800 text-xs no-scrollbar">
          {[
            { id: "all", label: "All 5 Categories" },
            { id: "volume", label: "1. Patient Volume" },
            { id: "followup", label: "2. Follow-up Care" },
            { id: "workflow", label: "3. Clinical Workflow" },
            { id: "continuity", label: "4. Continuity of Care" },
            { id: "operations", label: "5. Hospital Operations" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PATIENT VOLUME SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "volume") && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Patient Volume
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Patient visits and unique patient counts based on lifetime historical encounter sequence.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              Calculation: Unique by Patient ID · Historical First vs Subsequent Visits
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* 1. Total Patient Visits */}
            <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Patient Visits</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">{formatNum(summary.totalPatientVisits)}</div>
              <p className="text-[10px] text-slate-500 mt-1">Qualifying completed visits</p>
            </div>

            {/* 2. Unique Patients */}
            <div className="p-4 bg-blue-50/50 border border-blue-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Unique Patients</span>
                <UserCheck className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-blue-900">{formatNum(summary.uniquePatients)}</div>
              <p className="text-[10px] text-blue-700/80 mt-1 font-medium">Counted by Patient ID (not name)</p>
            </div>

            {/* 3. New Patients */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-emerald-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">New Patients</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-900">{formatNum(summary.newPatients)}</div>
              <p className="text-[10px] text-emerald-700/80 mt-1 font-medium">First encounter across lifetime history</p>
            </div>

            {/* 4. Returning Patients */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-indigo-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Returning Patients</span>
                <RefreshCw className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-900">{formatNum(summary.returningPatients)}</div>
              <p className="text-[10px] text-indigo-700/80 mt-1 font-medium">≥1 prior visits in system history</p>
            </div>

            {/* 5. Average Patients Per Day */}
            <div className="p-4 bg-amber-50/50 border border-amber-200/70 rounded-2xl col-span-2 sm:col-span-1 hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Avg Patients / Day</span>
                <CalendarCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-900">{summary.avgPatientsPerDay}</div>
              <p className="text-[10px] text-amber-700/80 mt-1 font-medium">
                {summary.totalPatientVisits} visits ÷ {summary.operationalDays} active days
              </p>
            </div>
          </div>

          {/* Doctor-wise comparative chart */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
              Physician Patient Volume Distribution
            </h4>
            <div className="space-y-3">
              {doctorMetrics.map(doc => {
                const pct = Math.round((doc.totalPatientVisits / maxVisits) * 100);
                return (
                  <div key={doc.doctorId} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{doc.doctorName}</span>
                        <span className="text-[10px] font-semibold text-slate-500 bg-white border border-slate-200 px-1.5 py-0.2 rounded">
                          {doc.department}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-600">
                          <strong>{doc.totalPatientVisits}</strong> visits
                        </span>
                        <span className="text-blue-700 font-semibold">
                          {doc.uniquePatients} unique
                        </span>
                        <span className="text-slate-400 font-medium">
                          ({doc.avgPatientsPerDay} avg/day)
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar showing New vs Returning */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-300" 
                        style={{ width: `${doc.totalPatientVisits > 0 ? (doc.newPatients / maxVisits) * 100 : 0}%` }}
                        title={`New: ${doc.newPatients}`}
                      />
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300" 
                        style={{ width: `${doc.totalPatientVisits > 0 ? (doc.returningPatients / maxVisits) * 100 : 0}%` }}
                        title={`Returning: ${doc.returningPatients}`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1">
                      <span>🟢 New: {doc.newPatients}</span>
                      <span>🟣 Returning: {doc.returningPatients}</span>
                      <span>Active Days: {doc.operationalDays} days</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. FOLLOW-UP CARE SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "followup") && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Follow-up Care
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Completed follow-up consultations only. Excludes advised, scheduled, pending, cancelled, or missed follow-ups.
              </p>
            </div>
            <div className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Strict Parameter: Follow-ups completed ONLY
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Key Count Card */}
            <div className="p-6 bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-200/90 rounded-2xl flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between text-emerald-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Follow-ups Completed</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-4xl font-black text-emerald-950">{formatNum(summary.followUpsCompleted)}</div>
                <p className="text-xs text-emerald-700/90 mt-2 font-medium leading-relaxed">
                  Total completed follow-up consultations in the active filter selection.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-200/80 text-[11px] text-emerald-800/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Deduplicated per clinical encounter</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Excludes unfulfilled scheduled or cancelled bookings</span>
                </div>
              </div>
            </div>

            {/* Doctor Breakdown Table */}
            <div className="md:col-span-2 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Completed Follow-ups by Physician</span>
                <span className="text-[10px] font-semibold text-slate-500">{doctorMetrics.length} Active Specialists</span>
              </div>
              <div className="divide-y divide-slate-100">
                {doctorMetrics.map(doc => (
                  <div key={doc.doctorId} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                      <div className="font-bold text-slate-900 text-xs">{doc.doctorName}</div>
                      <div className="text-[11px] text-slate-500">{doc.department} · {doc.facility}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-black text-emerald-700">{doc.followUpsCompleted}</div>
                      <div className="text-[10px] text-slate-400">completed follow-ups</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. CLINICAL WORKFLOW SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "workflow") && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Clinical Workflow
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Clinical orders, procedures performed, and cross-speciality referrals. Non-monetary counts only.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              Strict Rules: Zero Financial Values · Deduplicated Orders · Imaging Separate Excluded
            </div>
          </div>

          {/* 4 Core Workflow Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Prescriptions Written */}
            <div className="p-5 bg-blue-50/40 border border-blue-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-blue-700 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Prescriptions Written</span>
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-3xl font-black text-blue-950">{formatNum(summary.prescriptionsWritten)}</div>
              <p className="text-[11px] text-blue-700/80 mt-1 font-medium">Prescription orders created by doctor</p>
            </div>

            {/* Lab Investigation Orders */}
            <div className="p-5 bg-teal-50/40 border border-teal-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-teal-700 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Lab Investigation Orders</span>
                <FlaskConical className="w-5 h-5 text-teal-600" />
              </div>
              <div className="text-3xl font-black text-teal-950">{formatNum(summary.labInvestigationOrders)}</div>
              <p className="text-[11px] text-teal-700/80 mt-1 font-medium">Attributed to originating doctor (deduplicated)</p>
            </div>

            {/* Procedures Performed */}
            <div className="p-5 bg-purple-50/40 border border-purple-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-purple-700 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Procedures Performed</span>
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-3xl font-black text-purple-950">{formatNum(summary.proceduresPerformed)}</div>
              <p className="text-[11px] text-purple-700/80 mt-1 font-medium">Completed procedures only (excludes scheduled)</p>
            </div>

            {/* Referrals Made */}
            <div className="p-5 bg-amber-50/40 border border-amber-200/70 rounded-2xl hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between text-amber-700 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider">Referrals Made</span>
                <GitFork className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-950">{formatNum(summary.referralsMade)}</div>
              <p className="text-[11px] text-amber-700/80 mt-1 font-medium">Consultation referrals initiated by doctor</p>
            </div>
          </div>

          {/* Workflow Orders by Doctor Breakdown */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Physician Clinical Workflow & Interventions Breakdown</span>
              <span className="text-[10px] font-normal text-slate-500">All metrics deduplicated per encounter record</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Physician</th>
                    <th className="p-3">Department</th>
                    <th className="p-3 text-right">Prescriptions Written</th>
                    <th className="p-3 text-right">Lab Investigation Orders</th>
                    <th className="p-3 text-right">Procedures Performed</th>
                    <th className="p-3 text-right">Referrals Made</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {doctorMetrics.map(doc => (
                    <tr key={doc.doctorId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{doc.doctorName}</td>
                      <td className="p-3 text-slate-500">{doc.department}</td>
                      <td className="p-3 text-right font-semibold text-blue-700">{doc.prescriptionsWritten}</td>
                      <td className="p-3 text-right font-semibold text-teal-700">{doc.labInvestigationOrders}</td>
                      <td className="p-3 text-right font-semibold text-purple-700">{doc.proceduresPerformed}</td>
                      <td className="p-3 text-right font-semibold text-amber-700">{doc.referralsMade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. CONTINUITY OF CARE SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "continuity") && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Continuity of Care
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Care coordination, patient retention, and repeat-consultation adherence across specialties.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 bg-amber-50 border border-amber-200/80 text-amber-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span>Operational Care Coordination Indicators · Not Clinical Outcome Measures</span>
            </div>
          </div>

          {/* 3 Core Continuity Rate Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Patient Retention Rate */}
            <div className="p-5 bg-teal-50/30 border border-teal-200/70 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-teal-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Patient Retention Rate</span>
                  <Percent className="w-4 h-4 text-teal-600" />
                </div>
                <div className="text-3xl font-black text-teal-950 mt-1">
                  {summary.uniquePatients > 0 ? `${summary.patientRetentionRate}%` : "N/A"}
                </div>
                <p className="text-xs text-teal-800/80 mt-2 font-medium leading-relaxed">
                  Percentage of eligible patients returning for a subsequent visit within the 30-day window.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-teal-200/60 text-[10px] text-teal-700 space-y-0.5">
                <div><strong>Denominator:</strong> {summary.uniquePatients} unique eligible patients</div>
                <div><strong>Numerator:</strong> {summary.retainedPatients || summary.multiVisitPatientsCount} retained patients</div>
              </div>
            </div>

            {/* 2. Repeat-Visit Rate */}
            <div className="p-5 bg-blue-50/30 border border-blue-200/70 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-blue-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Repeat-Visit Rate</span>
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-blue-950 mt-1">
                  {summary.uniquePatients > 0 ? `${summary.repeatVisitRate}%` : "N/A"}
                </div>
                <p className="text-xs text-blue-800/80 mt-2 font-medium leading-relaxed">
                  Percentage of patients with more than one qualifying visit during the defined measurement period.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-blue-200/60 text-[10px] text-blue-700 space-y-0.5">
                <div><strong>Denominator:</strong> {summary.uniquePatients} unique patients in period</div>
                <div><strong>Numerator:</strong> {summary.multiVisitPatientsCount} patients with ≥2 visits</div>
              </div>
            </div>

            {/* 3. Same-Doctor Continuity Rate */}
            <div className="p-5 bg-indigo-50/30 border border-indigo-200/70 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-indigo-800 mb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Same-Doctor Continuity Rate</span>
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-black text-indigo-950 mt-1">
                  {summary.returningEncountersCount > 0 ? `${summary.sameDoctorContinuityRate}%` : "N/A"}
                </div>
                <p className="text-xs text-indigo-800/80 mt-2 font-medium leading-relaxed">
                  Percentage of eligible returning patients who revisit the same doctor.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-indigo-200/60 text-[10px] text-indigo-700 space-y-0.5">
                <div><strong>Denominator:</strong> {summary.returningEncountersCount} returning visits</div>
                <div><strong>Numerator:</strong> {summary.sameDoctorVisitsCount} revisits to same doctor</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. HOSPITAL OPERATIONS SECTION */}
      {/* ========================================================================= */}
      {(activeTab === "all" || activeTab === "operations") && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Hospital Operations
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Outpatient to inpatient conversions and physician-initiated hospital admissions.
              </p>
            </div>
            <div className="text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              Strict Rules: Originating Admitting Doctor Attributed · Discharge Delays Strictly Excluded
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metric 1: OPD-to-IPD Conversion Rate */}
            <div className="p-6 bg-gradient-to-br from-amber-50/40 via-orange-50/30 to-white border border-amber-200/80 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-amber-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">OPD-to-IPD Conversion Rate</span>
                  <Percent className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-4xl font-black text-amber-950">
                  {summary.totalPatientVisits > 0 ? `${summary.opdToIpdConversionRate}%` : "0%"}
                </div>
                <p className="text-xs text-amber-800/80 mt-2 font-medium leading-relaxed">
                  Percentage of eligible OPD patients who are subsequently admitted as inpatients within the encounter timeframe.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-amber-200/60 text-[11px] text-amber-800/80 space-y-1">
                <div><strong>Denominator:</strong> {summary.totalPatientVisits} total completed OPD visits</div>
                <div><strong>Numerator:</strong> {summary.admissionsInitiated} inpatient admissions initiated</div>
              </div>
            </div>

            {/* Metric 2: Admissions Initiated by Doctor */}
            <div className="p-6 bg-gradient-to-br from-blue-50/40 via-indigo-50/30 to-white border border-blue-200/80 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-blue-800 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Admissions Initiated by Doctor</span>
                  <Bed className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-4xl font-black text-blue-950">{formatNum(summary.admissionsInitiated)}</div>
                <p className="text-xs text-blue-800/80 mt-2 font-medium leading-relaxed">
                  Inpatient admissions initiated or referred for hospital admission by doctors, attributed to the originating doctor based on actual admission orders.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-200/60 text-[11px] text-blue-800/80 space-y-1">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Deduplicated by unique admission order ID (ADM-xxxx)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Distinguished from mere association with admitted patients</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. COMPREHENSIVE DOCTOR NON-REVENUE MATRIX TABLE */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Physician Non-Revenue Comparison Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative analysis of all 5 non-revenue categories across active medical specialists.
            </p>
          </div>

          {/* Search physician */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search doctor, specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Matrix Table */}
        <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-slate-200">
                <tr>
                  <th 
                    onClick={() => handleSort("doctorName")}
                    className="p-3.5 cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>Doctor / Specialty</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("totalPatientVisits")}
                    className="p-3.5 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Visits (Unique)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("avgPatientsPerDay")}
                    className="p-3.5 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Avg / Day</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("followUpsCompleted")}
                    className="p-3.5 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Follow-ups Done</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center whitespace-nowrap">
                    <span>Clinical Workflow (Rx / Lab / Proc / Ref)</span>
                  </th>
                  <th 
                    onClick={() => handleSort("sameDoctorContinuityRate")}
                    className="p-3.5 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Same-Doc %</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort("admissionsInitiated")}
                    className="p-3.5 text-right cursor-pointer hover:text-slate-900 select-none whitespace-nowrap"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Admissions (Conv %)</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-3.5 text-center whitespace-nowrap">Scorecard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No doctor records matching current query.
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map(doc => (
                    <tr key={doc.doctorId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{doc.doctorName}</div>
                        <div className="text-[11px] text-slate-500">{doc.department} · {doc.facility}</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="font-bold text-slate-900">{doc.totalPatientVisits}</span>
                        <span className="text-[11px] text-blue-700 ml-1.5 font-semibold">({doc.uniquePatients})</span>
                        <div className="text-[10px] text-slate-400">
                          {doc.newPatients} New · {doc.returningPatients} Ret
                        </div>
                      </td>
                      <td className="p-3.5 text-right font-semibold text-slate-800">
                        {doc.avgPatientsPerDay}
                        <div className="text-[10px] text-slate-400">{doc.operationalDays} days active</div>
                      </td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                          {doc.followUpsCompleted}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-slate-100/80 px-2.5 py-1 rounded-xl">
                          <span className="text-blue-700" title="Prescriptions Written">💊 {doc.prescriptionsWritten}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-teal-700" title="Lab Orders">🔬 {doc.labInvestigationOrders}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-purple-700" title="Procedures Done">💉 {doc.proceduresPerformed}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-amber-700" title="Referrals Made">🔄 {doc.referralsMade}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-slate-900">
                          {doc.sameDoctorContinuityRate > 0 ? `${doc.sameDoctorContinuityRate}%` : "—"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Repeat: {doc.repeatVisitRate}%
                        </div>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="font-bold text-indigo-700">{doc.admissionsInitiated}</div>
                        <div className="text-[10px] text-slate-500 font-medium">
                          {doc.opdToIpdConversionRate}% conv
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => onSelectDoctor(doc.doctorName)}
                          className="px-2.5 py-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
