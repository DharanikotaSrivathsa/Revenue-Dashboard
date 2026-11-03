"use client";

import React, { useState } from "react";
import { 
  Search, 
  Building2, 
  Layers, 
  Calendar, 
  Stethoscope, 
  Sparkles, 
  X, 
  MapPin, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
  Flame,
  Activity,
  Wallet,
  Clock,
  Filter
} from "lucide-react";
import { FACILITIES, DEPARTMENTS, DOCTORS } from "../data/mockData";

export default function DoccureSearchConsole({
  filters,
  onChangeFilter,
  onSearch,
  onReset,
  hasApplied,
  encountersCount,
  activeDoctorsCount = 6
}) {
  const [keyword, setKeyword] = useState(filters.keyword || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isHeroExpanded, setIsHeroExpanded] = useState(false);

  // Popular specialties list (Doccure-inspired)
  const quickSpecialties = [
    { name: "All Specialities", icon: "🏥", dept: "All" },
    { name: "General Medicine", icon: "🩺", dept: "General Medicine" },
    { name: "Cardiology", icon: "❤️", dept: "Cardiology" },
    { name: "Orthopedics", icon: "🦴", dept: "Orthopedics" },
    { name: "Gynecology", icon: "🌸", dept: "Gynecology" },
    { name: "Dermatology", icon: "✨", dept: "Dermatology" }
  ];

  const handleQuickSpecialty = (deptName) => {
    onChangeFilter("dept", deptName);
    onSearch({ ...filters, dept: deptName, keyword });
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    onChangeFilter("keyword", keyword);
    onSearch({ ...filters, keyword });
  };

  const handleClearSearch = () => {
    setKeyword("");
    onChangeFilter("keyword", "");
    onReset();
  };

  // Compute active filter tags
  const activeTags = [];
  if (filters.facility && filters.facility !== "All") {
    activeTags.push({ key: "facility", label: `Branch: ${filters.facility}` });
  }
  if (filters.dept && filters.dept !== "All") {
    activeTags.push({ key: "dept", label: `Speciality: ${filters.dept}` });
  }
  if (filters.doctor && filters.doctor !== "All") {
    activeTags.push({ key: "doctor", label: `Doctor: ${filters.doctor}` });
  }
  if (filters.payStatus && filters.payStatus !== "All") {
    activeTags.push({ key: "payStatus", label: `Payment: ${filters.payStatus}` });
  }
  if (filters.from !== "2026-10-01" || filters.to !== "2026-10-29") {
    activeTags.push({ key: "date", label: `Dates: ${filters.from} → ${filters.to}` });
  }
  if (keyword) {
    activeTags.push({ key: "keyword", label: `Keyword: "${keyword}"` });
  }

  const handleRemoveTag = (key) => {
    if (key === "date") {
      onChangeFilter("from", "2026-10-01");
      onChangeFilter("to", "2026-10-29");
      onSearch({ ...filters, from: "2026-10-01", to: "2026-10-29" });
    } else if (key === "keyword") {
      setKeyword("");
      onChangeFilter("keyword", "");
      onSearch({ ...filters, keyword: "" });
    } else {
      onChangeFilter(key, "All");
      onSearch({ ...filters, [key]: "All" });
    }
  };

  // COMPACT SEARCH & FILTER CONSOLE (Shown when data is active)
  if (hasApplied && !isHeroExpanded) {
    return (
      <div className="w-full space-y-3 mb-6 animate-fadeIn">
        {/* Main Search Pill Bar */}
        <form 
          onSubmit={handleFormSubmit}
          className="bg-white rounded-2xl p-2 sm:p-2.5 shadow-md shadow-slate-200/50 border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center gap-2 text-slate-800 transition-all hover:border-cyan-400/80"
        >
          {/* Facility Location */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-colors md:w-48 min-w-0 border border-slate-200/60">
            <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Location</span>
              <select
                value={filters.facility}
                onChange={(e) => {
                  onChangeFilter("facility", e.target.value);
                  onSearch({ ...filters, facility: e.target.value, keyword });
                }}
                className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer truncate"
              >
                <option value="All">All Facilities ({FACILITIES.length})</option>
                {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Specialty */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/70 rounded-xl transition-colors md:w-52 min-w-0 border border-slate-200/60">
            <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Speciality</span>
              <select
                value={filters.dept}
                onChange={(e) => {
                  onChangeFilter("dept", e.target.value);
                  onSearch({ ...filters, dept: e.target.value, keyword });
                }}
                className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer truncate"
              >
                <option value="All">All Specialities ({DEPARTMENTS.length})</option>
                {DEPARTMENTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Keyword Search Input */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-50 rounded-xl transition-colors flex-1 min-w-0 border border-slate-200/60">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search doctor, patient MRN, diagnosis, procedure..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 bg-transparent placeholder-slate-400 outline-none"
            />
            {keyword && (
              <button 
                type="button" 
                onClick={() => {
                  setKeyword("");
                  onChangeFilter("keyword", "");
                  onSearch({ ...filters, keyword: "" });
                }} 
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* More Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 flex-shrink-0 border ${
              showAdvanced || activeTags.some(t => t.key === "doctor" || t.key === "payStatus" || t.key === "date")
                ? "bg-cyan-50 text-cyan-700 border-cyan-300"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80"
            }`}
            title="Filter options for doctor, settlement, and dates"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600" />
            <span>Filters</span>
            {activeTags.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-cyan-600 text-white text-[9px] flex items-center justify-center font-bold">
                {activeTags.length}
              </span>
            )}
          </button>

          {/* Submit Search CTA */}
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>

          {/* Reset Action */}
          <button
            type="button"
            onClick={handleClearSearch}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 font-semibold text-xs rounded-xl transition-colors cursor-pointer flex-shrink-0"
            title="Reset all filters and search query"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Advanced Filters Expandable Drawer */}
        {showAdvanced && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-md animate-fadeIn grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Physician Selector */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                <Stethoscope className="w-3 h-3 text-blue-600" />
                <span>Physician</span>
              </label>
              <select
                value={filters.doctor}
                onChange={(e) => {
                  onChangeFilter("doctor", e.target.value);
                  onSearch({ ...filters, doctor: e.target.value, keyword });
                }}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Physicians ({DOCTORS.length})</option>
                {DOCTORS.map(d => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.dept.slice(0, 10)})
                  </option>
                ))}
              </select>
            </div>

            {/* Settlement Status */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                <Wallet className="w-3 h-3 text-emerald-600" />
                <span>Settlement Status</span>
              </label>
              <select
                value={filters.payStatus}
                onChange={(e) => {
                  onChangeFilter("payStatus", e.target.value);
                  onSearch({ ...filters, payStatus: e.target.value, keyword });
                }}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="All">All Settlement Types</option>
                <option value="Paid in Full">Paid in Full</option>
                <option value="Unpaid">Unpaid / Outstanding</option>
                <option value="Partial">Partial Settlement</option>
              </select>
            </div>

            {/* From Date */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>From Date</span>
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => {
                  onChangeFilter("from", e.target.value);
                  onSearch({ ...filters, from: e.target.value, keyword });
                }}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-indigo-600" />
                <span>To Date</span>
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => {
                  onChangeFilter("to", e.target.value);
                  onSearch({ ...filters, to: e.target.value, keyword });
                }}
                className="w-full text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Active Filter Chips & Results Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
          {/* Active chips list */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold mr-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Showing <strong>{encountersCount}</strong> Qualifying Records</span>
            </span>

            {activeTags.map(tag => (
              <span
                key={tag.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 text-[11px] font-semibold"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag.key)}
                  className="hover:text-blue-900 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {activeTags.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer ml-1"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Quick toggle to show hero banner if desired */}
          <button
            type="button"
            onClick={() => setIsHeroExpanded(true)}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Show Doccure Hero Banner</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // HERO SEARCH CONSOLE (Shown on Initial Landing before user executes search)
  return (
    <div className="w-full space-y-5 mb-8">
      {/* 1. Main Doccure Gradient Hero Card */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-blue-500/15 border border-blue-400/30 relative overflow-hidden">
        {/* Soft decorative background circles */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Close hero button if data already loaded */}
          {hasApplied && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setIsHeroExpanded(false)}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Collapse Showcase</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Heading */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold text-white shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>Doccure-Powered Healthcare & Clinical Search</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              Discover Doctors & Practice Intelligence
            </h2>
            <p className="text-xs sm:text-base text-blue-100 max-w-2xl mx-auto font-medium leading-relaxed">
              Search by doctor name, medical specialty, hospital branch, or clinical keyword.
              Click <strong className="text-white underline">Search Analytics</strong> to compute live reports.
            </p>
          </div>

          {/* 2. Floating Pill Command Bar (Doccure Signature Style) */}
          <form 
            onSubmit={handleFormSubmit}
            className="bg-white rounded-2xl sm:rounded-full p-2 sm:p-2.5 shadow-2xl border-2 border-cyan-300 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-1 text-slate-800"
          >
            {/* Facility Location Picker */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 rounded-xl sm:rounded-full transition-colors flex-1 sm:max-w-[210px] min-w-0">
              <MapPin className="w-4 h-4 text-cyan-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Facility Location
                </span>
                <select
                  value={filters.facility}
                  onChange={(e) => onChangeFilter("facility", e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer truncate"
                >
                  <option value="All">All Facilities ({FACILITIES.length})</option>
                  {FACILITIES.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            {/* Specialty Picker */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 rounded-xl sm:rounded-full transition-colors flex-1 sm:max-w-[220px] min-w-0">
              <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Speciality
                </span>
                <select
                  value={filters.dept}
                  onChange={(e) => onChangeFilter("dept", e.target.value)}
                  className="w-full text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer truncate"
                >
                  <option value="All">All Specialities ({DEPARTMENTS.length})</option>
                  {DEPARTMENTS.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-8 bg-slate-200" />

            {/* Keyword Search Input */}
            <div className="flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-50 rounded-xl sm:rounded-full transition-colors flex-2 min-w-0">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Search Query
                </span>
                <input
                  type="text"
                  placeholder="Doctor name, patient, procedure..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-900 bg-transparent placeholder-slate-400 outline-none"
                />
              </div>
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Submit CTA Button */}
            <button
              type="submit"
              className="px-6 py-3.5 sm:py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-full shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Search Analytics</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </form>

          {/* 3. Doccure Quick Specialty Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-blue-100 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-cyan-200" />
              Popular Specialities:
            </span>
            {quickSpecialties.map(s => {
              const isActive = filters.dept === s.dept;
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => handleQuickSpecialty(s.dept)}
                  className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                    isActive
                      ? "bg-white text-blue-800 shadow-md ring-2 ring-cyan-300"
                      : "bg-white/15 hover:bg-white/25 text-white border border-white/20"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Date Presets & Filter Toggle */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-blue-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              📅 Date Presets:
            </span>
            <button
              type="button"
              onClick={() => {
                onChangeFilter("from", "2026-10-01");
                onChangeFilter("to", "2026-10-29");
                onSearch({ ...filters, from: "2026-10-01", to: "2026-10-29", keyword });
              }}
              className="px-3 py-1 rounded-full bg-blue-900/40 hover:bg-blue-900/70 text-white font-semibold text-[11px] border border-blue-400/30 cursor-pointer"
            >
              Full Month (Oct 1–29)
            </button>
            <button
              type="button"
              onClick={() => {
                onChangeFilter("from", "2026-10-22");
                onChangeFilter("to", "2026-10-29");
                onSearch({ ...filters, from: "2026-10-22", to: "2026-10-29", keyword });
              }}
              className="px-3 py-1 rounded-full bg-blue-900/40 hover:bg-blue-900/70 text-white font-semibold text-[11px] border border-blue-400/30 cursor-pointer"
            >
              Recent 7 Days
            </button>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-[11px] border border-white/30 cursor-pointer flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3 text-cyan-200" />
              <span>{showAdvanced ? "Hide Extra Filters" : "More Filter Options"}</span>
            </button>
          </div>
        </div>

        {/* 4. Advanced Filters Panel */}
        {showAdvanced && (
          <div className="mt-5 pt-4 border-t border-white/20 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-3 animate-fadeIn">
            {/* Physician Select */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
                Physician
              </label>
              <select
                value={filters.doctor}
                onChange={(e) => onChangeFilter("doctor", e.target.value)}
                className="w-full text-xs font-bold text-white bg-transparent outline-none cursor-pointer"
              >
                <option value="All" className="text-slate-900">All Physicians</option>
                {DOCTORS.map(d => (
                  <option key={d.name} value={d.name} className="text-slate-900">
                    {d.name} ({d.dept.slice(0, 8)})
                  </option>
                ))}
              </select>
            </div>

            {/* Settlement Status */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
                Settlement
              </label>
              <select
                value={filters.payStatus}
                onChange={(e) => onChangeFilter("payStatus", e.target.value)}
                className="w-full text-xs font-bold text-white bg-transparent outline-none cursor-pointer"
              >
                <option value="All" className="text-slate-900">All Settlement Types</option>
                <option value="Paid in Full" className="text-slate-900">Paid in Full</option>
                <option value="Unpaid" className="text-slate-900">Unpaid / Outstanding</option>
                <option value="Partial" className="text-slate-900">Partial Settlement</option>
              </select>
            </div>

            {/* From Date */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => onChangeFilter("from", e.target.value)}
                className="w-full text-xs font-bold text-white bg-transparent outline-none cursor-pointer"
              />
            </div>

            {/* To Date */}
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => onChangeFilter("to", e.target.value)}
                className="w-full text-xs font-bold text-white bg-transparent outline-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
