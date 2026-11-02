"use client";

import React from "react";
import { 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Star, 
  MapPin, 
  Calendar, 
  Building2, 
  Activity,
  Search,
  Bed,
  ShieldCheck
} from "lucide-react";
import { DOCTORS } from "../data/mockData";

export default function EmptyState({ onApply, onApplyPreset, onSelectDoctor }) {
  const servicePillars = [
    {
      title: "Physician Consultations",
      icon: "🩺",
      desc: "Track OPD patient encounters, clinical diagnoses, and consultation margins.",
      color: "bg-blue-500",
      preset: "oct2026"
    },
    {
      title: "Diagnostic Pathology & Labs",
      icon: "🔬",
      desc: "Analyze hematology, biochemistry, and radiology panel turnaround.",
      color: "bg-teal-500",
      preset: "central"
    },
    {
      title: "Retail Pharmacy & Formulary",
      icon: "💊",
      desc: "Monitor prescription fulfillment, medicine sales, and drug margins.",
      color: "bg-amber-500",
      preset: "cardiology"
    },
    {
      title: "Inpatient Hospital Admissions",
      icon: "🏥",
      desc: "Measure OPD-to-IPD conversions, bed occupancy, and initiated admissions.",
      color: "bg-purple-500",
      preset: "unpaid"
    }
  ];

  return (
    <div className="space-y-8 my-4">
      {/* 1. Doccure Service Categories Strip */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
              Explore Enterprise Healthcare Departments
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a clinical service line to immediately query and compute practice intelligence.
            </p>
          </div>
          <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200/60 px-3 py-1 rounded-full">
            Ready to Query
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {servicePillars.map((s, idx) => (
            <div
              key={idx}
              onClick={() => onApplyPreset(s.preset)}
              className="p-4 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-xl mb-3 group-hover:scale-110 transition-transform">
                  {s.icon}
                </div>
                <h4 className="font-bold text-xs text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                  {s.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>Query Analytics</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Featured Specialists Cards (Doccure Style) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                Doccure Verified Network
              </span>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Featured Medical Specialists
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select any doctor to load their practice scorecard, patient volume, and revenue analytics.
            </p>
          </div>

          <button
            onClick={() => onApply()}
            className="self-start sm:self-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load All Enterprise Data ({DOCTORS.length} Specialists)</span>
          </button>
        </div>

        {/* 6 Specialist Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DOCTORS.map((doc, idx) => {
            const avatarEmojis = ["👩‍⚕️", "👨‍⚕️", "👩‍⚕️", "👨‍⚕️", "👩‍⚕️", "👨‍⚕️"];
            const ratings = ["4.9 (48)", "4.8 (64)", "4.9 (39)", "4.7 (52)", "4.9 (41)", "4.8 (45)"];
            return (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-400 shadow-2xs hover:shadow-xl transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Doctor Row */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-100 via-indigo-50 to-cyan-100 border border-blue-200 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform flex-shrink-0">
                      {avatarEmojis[idx % avatarEmojis.length]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-900 tracking-tight truncate group-hover:text-blue-600 transition-colors">
                          {doc.name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" title="Verified Doctor" />
                      </div>
                      <p className="text-xs font-semibold text-blue-600 truncate mt-0.5">
                        {doc.dept}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                          {ratings[idx]}
                        </span>
                        <span>•</span>
                        <span>{doc.experience}</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Room */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 text-xs text-slate-600 space-y-1 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{doc.facility}</span>
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 font-bold text-[10px] border border-slate-200">
                        {doc.opdRoom}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (onSelectDoctor) onSelectDoctor(doc.name);
                    }}
                    className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Quick Scorecard
                  </button>
                  <button
                    onClick={() => onApplyPreset("oct2026")}
                    className="py-2 px-3.5 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                    title="Launch full analytics for this doctor"
                  >
                    <span>Analyze</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
