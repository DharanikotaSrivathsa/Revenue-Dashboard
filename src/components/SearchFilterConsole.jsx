"use client";

import React, { useState } from "react";
import { 
  Search, 
  Calendar, 
  Building2, 
  Layers, 
  Stethoscope, 
  CreditCard,
  HeartPulse,
  Filter, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  SlidersHorizontal
} from "lucide-react";
import { FACILITIES, DEPARTMENTS, DOCTORS } from "../data/mockData";
import DoccureDropdown from "./common/DoccureDropdown";
import DoccureDatePicker from "./common/DoccureDatePicker";

export default function SearchFilterConsole({
  filters,
  onChangeFilter,
  onApply,
  onReset,
  hasApplied,
  encountersCount = 0,
  onExportCSV,
  activeSectionTitle = "Overview"
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hasModifiedSinceApply, setHasModifiedSinceApply] = useState(false);

  const handleFieldChange = (key, val) => {
    onChangeFilter(key, val);
    setHasModifiedSinceApply(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setHasModifiedSinceApply(false);
    onApply();
  };

  const handleResetClick = () => {
    setHasModifiedSinceApply(false);
    onReset();
  };

  // Dropdown Options
  const facilityOptions = [
    { value: "All", label: `All Facilities (${FACILITIES.length})` },
    ...FACILITIES.map(f => ({ value: f, label: f }))
  ];

  const departmentOptions = [
    { value: "All", label: `All Departments (${DEPARTMENTS.length})` },
    ...DEPARTMENTS.map(d => ({ value: d.name, label: d.name }))
  ];

  const doctorOptions = [
    { value: "All", label: `All Doctors (${DOCTORS.length})` },
    ...DOCTORS.map(d => ({ value: d.name, label: `${d.name} (${d.dept.slice(0, 10)})` }))
  ];

  const serviceOptions = [
    { value: "All", label: "All Services (4)" },
    { value: "OPD", label: "OPD · Outpatient" },
    { value: "IPD", label: "IPD · Inpatient" },
    { value: "OT", label: "OT · Operation Theatre" },
    { value: "Walk-in", label: "Walk-in · Counter" }
  ];

  const payModeOptions = [
    { value: "All", label: "All Settlement Channels (5)" },
    { value: "Card", label: "💳 Credit / Debit Card" },
    { value: "Insurance", label: "🛡️ Health Insurance / TPA" },
    { value: "Cash", label: "💵 Direct Cash" },
    { value: "UPI", label: "📱 UPI & Digital Wallet" },
    { value: "Bank transfer", label: "🏛️ Bank Transfer / NEFT" }
  ];

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200/90 shadow-2xs mb-6 transition-all relative z-20">
      {/* 1. Header Bar of the Search Component */}
      <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-200/80 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Healthcare Search & Analytics Query Console
              </h2>
              {hasApplied ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Data Active · {encountersCount} Encounters</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Awaiting Search Query</span>
                </span>
              )}
              {hasApplied && hasModifiedSinceApply && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
                  Query modified · Click Search
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 font-medium">
              Filter records across hospital branches, departments, doctors, and dates. Click Search to view data.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              type="button"
              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-xl border border-gray-200 shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            type="button"
            className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200 cursor-pointer"
            title={isCollapsed ? "Expand search console" : "Collapse search console"}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Main Search & Filter Form Body with Custom DatePicker & Dropdowns */}
      {!isCollapsed && (
        <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {/* Field 1: Reusable From Date Calendar */}
            <DoccureDatePicker
              label="From Date"
              value={filters.from}
              onChange={(val) => handleFieldChange("from", val)}
            />

            {/* Field 2: Reusable To Date Calendar */}
            <DoccureDatePicker
              label="To Date"
              value={filters.to}
              onChange={(val) => handleFieldChange("to", val)}
            />

            {/* Field 3: Reusable Facility Branch Dropdown */}
            <DoccureDropdown
              label="Hospital Branch"
              icon={Building2}
              value={filters.facility}
              onChange={(val) => handleFieldChange("facility", val)}
              options={facilityOptions}
            />

            {/* Field 4: Reusable Specialty Department Dropdown */}
            <DoccureDropdown
              label="Specialty Department"
              icon={Layers}
              value={filters.dept}
              onChange={(val) => handleFieldChange("dept", val)}
              options={departmentOptions}
            />

            {/* Field 5: Reusable Attending Doctor Dropdown */}
            <DoccureDropdown
              label="Attending Doctor"
              icon={Stethoscope}
              value={filters.doctor}
              onChange={(val) => handleFieldChange("doctor", val)}
              options={doctorOptions}
            />

            {/* Field 6: Reusable Payment Mode Settlement Dropdown */}
            <DoccureDropdown
              label="Payment Channel"
              icon={CreditCard}
              value={filters.payMode || "All"}
              onChange={(val) => handleFieldChange("payMode", val)}
              options={payModeOptions}
            />

            {/* Field 7: Service line (OPD / IPD / OT / Walk-in) */}
            <DoccureDropdown
              label="Service"
              icon={HeartPulse}
              value={filters.service || "All"}
              onChange={(val) => handleFieldChange("service", val)}
              options={serviceOptions}
            />
          </div>

          {/* Quick Shortcuts & Action Buttons Row */}
          <div className="pt-2 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-end gap-3">
            {/* Submit & Reset CTAs */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={handleResetClick}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search Analytics & Show Data</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Mini Bar when Collapsed */}
      {isCollapsed && (
        <div className="px-5 py-2.5 bg-white flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900">Current Scope:</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
              {filters.from} to {filters.to}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
              Facility: {filters.facility}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
              Dept: {filters.dept}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
              Doctor: {filters.doctor}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
              Payment: {filters.payMode || "All"}
            </span>
            <span className="px-2 py-0.5 rounded bg-gray-100 font-medium">
              Service: {filters.service || "All"}
            </span>
          </div>
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
          >
            Modify Search Filters
          </button>
        </div>
      )}
    </div>
  );
}
