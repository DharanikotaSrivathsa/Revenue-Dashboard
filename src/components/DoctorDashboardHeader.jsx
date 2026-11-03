"use client";

import React from "react";
import { 
  Clock, 
  Download, 
  Printer, 
  Sparkles,
  Building2,
  Stethoscope,
  Layers,
  FlaskConical,
  Pill
} from "lucide-react";

export default function DoctorDashboardHeader({
  activeSection = "overview",
  encountersCount = 0,
  onExportCSV
}) {
  const meta = {
    overview: {
      title: "Hospital Overview",
      subtitle: "A simple view of revenue, payments received, refunds and what each service earns.",
      badge: "Hospital Group Executive",
      icon: Building2
    },
    doctors: {
      title: "Doctor Performance & Clinical Governance",
      subtitle: "Monitor doctor financial yields, patient volume, completed follow-ups, clinical workflow, and 16-metric continuity matrix.",
      badge: "6 Attending Specialists",
      icon: Stethoscope
    },
    departments: {
      title: "Speciality Clinical Analytics",
      subtitle: "Cross-speciality performance, inpatient bed capacity, consult completions, and service line revenue distributions.",
      badge: "5 Specialities",
      icon: Layers
    },
    labs: {
      title: "Laboratory Diagnostics Performance",
      subtitle: "Pathology, biochemistry, microbiology orders, test completion status, turnaround metrics, and diagnostic revenues.",
      badge: "Clinical Diagnostics Unit",
      icon: FlaskConical
    },
    pharmacy: {
      title: "Retail Pharmacy Dispensary Intelligence",
      subtitle: "Prescription fulfillment tracking, therapeutic category revenues, dispensation status, and returns reconciliation.",
      badge: "Formulary & Dispensary",
      icon: Pill
    }
  };

  const current = meta[activeSection] || meta.doctors;
  const Icon = current.icon;

  return (
    <div className="w-full mb-5">
      {/* Doccure HMS Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden border border-slate-800">
        {/* Soft background glow accents */}
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            {/* Top Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span>{encountersCount} Visits Recorded</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-[11px] font-semibold">
                {current.badge}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Live Synced</span>
              </span>
            </div>

            {/* Page Title & Subtitle */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{current.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-3xl leading-relaxed">
              {current.subtitle}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 self-start lg:self-center flex-shrink-0">
            {onExportCSV && (
              <button
                onClick={onExportCSV}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-98"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print View</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
