"use client";

import React from "react";
import { 
  Building2, 
  Stethoscope, 
  Layers, 
  FlaskConical, 
  Pill, 
  Download, 
  Printer, 
  Activity,
  Sparkles,
  ChevronDown
} from "lucide-react";

export default function Navbar({ activeSection, onSelectSection, hasApplied, encountersCount, onExportCSV }) {
  const sections = [
    { id: "overview", label: "Hospital Overview", icon: Building2, tag: "Executive" },
    { id: "doctors", label: "Doctor Performance", icon: Stethoscope, tag: "Scorecards" },
    { id: "departments", label: "Specialities", icon: Layers, tag: "5 Specialities" },
    { id: "labs", label: "Labs Performance", icon: FlaskConical, tag: "Diagnostics" },
    { id: "pharmacy", label: "Pharmacy Performance", icon: Pill, tag: "Dispensary" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 text-white shadow-xl shadow-slate-950/20">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17">
          {/* Logo & Entity Switcher */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10 group-hover:ring-blue-400/40 transition-all">
                <Activity className="w-5 h-5" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  HealthCore IQ
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Enterprise 2.5
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span>Apollo Health System</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">Hospital · Labs · Retail Rx</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs with Active Glow Pill */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{sec.label}</span>
                  {isActive && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-bold ml-1">
                      {sec.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Toolbar */}
          <div className="flex items-center gap-3">
            {/* Live Status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
              {hasApplied ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-400"></span>
                  <span className="text-emerald-400 font-bold">Live Data</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-slate-300">{encountersCount} Encounters</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-amber-300 font-medium">Query Pending</span>
                </>
              )}
            </div>

            {hasApplied && (
              <button
                onClick={onExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-sm"
                title="Export active view dataset to CSV"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all shadow-sm"
              title="Print executive report or save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Scroller */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 gap-1.5 border-t border-slate-800/80 scrollbar-none">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => onSelectSection(sec.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-400 bg-slate-900 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
