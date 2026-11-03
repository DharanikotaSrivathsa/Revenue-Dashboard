"use client";

import React, { useState } from "react";
import { 
  Filter, 
  RotateCcw, 
  Calendar, 
  Building2, 
  Layers, 
  Stethoscope, 
  Wallet, 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { FACILITIES, DEPARTMENTS, DOCTORS } from "../data/mockData";

export default function FilterBar({
  filters,
  onChangeFilter,
  onApply,
  onReset,
  onApplyPreset,
  hasApplied
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Compute active filters
  const activeTags = [];
  if (filters.from !== "2026-10-01" || filters.to !== "2026-10-29") {
    activeTags.push({ 
      key: "date", 
      type: "date",
      label: `Dates: ${filters.from || "Start"} → ${filters.to || "End"}` 
    });
  }
  if (filters.facility !== "All") {
    activeTags.push({ 
      key: "facility", 
      type: "facility",
      label: `Facility: ${filters.facility}` 
    });
  }
  if (filters.dept !== "All") {
    activeTags.push({ 
      key: "dept", 
      type: "dept",
      label: `Dept: ${filters.dept}` 
    });
  }
  if (filters.doctor !== "All") {
    activeTags.push({ 
      key: "doctor", 
      type: "doctor",
      label: `Doctor: ${filters.doctor}` 
    });
  }
  if (filters.payStatus !== "All") {
    activeTags.push({ 
      key: "payStatus", 
      type: "payStatus",
      label: `Payment: ${filters.payStatus}` 
    });
  }

  // Remove individual filter tag
  const handleRemoveTag = (key) => {
    if (key === "date") {
      onChangeFilter("from", "2026-10-01");
      onChangeFilter("to", "2026-10-29");
    } else {
      onChangeFilter(key, "All");
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm mb-6 overflow-hidden transition-all filter-controls">
      {/* 1. Header Toolbar & Quick Presets */}
      <div className="p-4 sm:px-6 bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Console Title & Active Count */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs tracking-tight text-white uppercase">
                Analytics Query Console
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                hasApplied ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}>
                {hasApplied ? "Live Query" : "Pending Filter Selection"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Set hospital branch, clinical speciality, date range, or doctor parameters
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title={isExpanded ? "Collapse filter controls" : "Expand filter controls"}
          >
            <span>{isExpanded ? "Collapse" : "Edit Filters"}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Reset filters to enterprise default"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={onApply}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/30 hover:shadow-lg transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Apply Filters & Compute</span>
          </button>
        </div>
      </div>

      {/* 2. Expanded Filter Form */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
          {/* Filter Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
            {/* From Date */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-colors">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>From Date</span>
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => onChangeFilter("from", e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition-colors">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>To Date</span>
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => onChangeFilter("to", e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* Facility Branch */}
            <div className={`bg-white p-3 rounded-2xl border transition-colors shadow-2xs ${
              filters.facility !== "All" ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-blue-400"
            }`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Facility Branch</span>
              </label>
              <select
                value={filters.facility}
                onChange={(e) => onChangeFilter("facility", e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Facilities (3)</option>
                {FACILITIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Speciality */}
            <div className={`bg-white p-3 rounded-2xl border transition-colors shadow-2xs ${
              filters.dept !== "All" ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-blue-400"
            }`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>Speciality</span>
              </label>
              <select
                value={filters.dept}
                onChange={(e) => onChangeFilter("dept", e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Specialities (5)</option>
                {DEPARTMENTS.map(d => (
                  <option key={d.name} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Physician / Doctor */}
            <div className={`bg-white p-3 rounded-2xl border transition-colors shadow-2xs ${
              filters.doctor !== "All" ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-blue-400"
            }`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                <span>Physician</span>
              </label>
              <select
                value={filters.doctor}
                onChange={(e) => onChangeFilter("doctor", e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Physicians (6)</option>
                {DOCTORS.map(doc => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} ({doc.dept.slice(0, 4)})
                  </option>
                ))}
              </select>
            </div>

            {/* Settlement Status */}
            <div className={`bg-white p-3 rounded-2xl border transition-colors shadow-2xs ${
              filters.payStatus !== "All" ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-200 hover:border-blue-400"
            }`}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-1.5">
                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                <span>Settlement Status</span>
              </label>
              <select
                value={filters.payStatus}
                onChange={(e) => onChangeFilter("payStatus", e.target.value)}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Settlement Types</option>
                <option value="Paid">Fully Paid (100%)</option>
                <option value="Partial">Partial Settlement</option>
                <option value="Unpaid">Unpaid / Outstanding</option>
              </select>
            </div>
          </div>

          {/* Quick Query Shortcuts Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                ⚡ Quick Shortcuts:
              </span>
              <button
                onClick={() => onApplyPreset("oct2026")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>📅</span>
                <span>Current Month (Oct 1–29)</span>
              </button>
              <button
                onClick={() => onApplyPreset("central")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>🏥</span>
                <span>Central Hospital Only</span>
              </button>
              <button
                onClick={() => onApplyPreset("cardiology")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>❤️</span>
                <span>Cardiology Speciality</span>
              </button>
              <button
                onClick={() => onApplyPreset("unpaid")}
                className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⚠️</span>
                <span>High Receivables Balances</span>
              </button>
              <button
                onClick={() => onApplyPreset("last7")}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-semibold text-xs border border-slate-200/90 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⚡</span>
                <span>Recent 7 Days</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Active Filter Scope Strip */}
      {hasApplied && activeTags.length > 0 && (
        <div className="px-5 sm:px-6 py-2.5 bg-blue-50/60 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-blue-900 text-[11px] uppercase tracking-wider">
              Active Scope:
            </span>
            {activeTags.map((t) => (
              <span
                key={t.key}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-blue-900 text-xs font-semibold shadow-2xs"
              >
                <span>{t.label}</span>
                <button
                  onClick={() => handleRemoveTag(t.type)}
                  className="hover:text-red-500 rounded-full cursor-pointer ml-0.5"
                  title="Remove this filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <button
            onClick={onReset}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
          >
            Clear Scope
          </button>
        </div>
      )}
    </div>
  );
}
