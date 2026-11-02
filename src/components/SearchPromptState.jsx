"use client";

import React from "react";
import { 
  Search, 
  Sparkles, 
  Activity, 
  Stethoscope, 
  Building2, 
  FlaskConical, 
  Pill, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function SearchPromptState({ onQuickLaunch }) {
  return (
    <div className="w-full space-y-6 animate-fadeIn py-6">
      {/* 1. Main Callout Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 p-8 sm:p-12 text-center shadow-xs relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-sm ring-8 ring-blue-50/50">
            <Search className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Doccure HMS Operational Intelligence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Search Parameters Required to Load Analytics
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Data is protected and calculated dynamically on-demand. Configure your date range, hospital facility, clinical department, or doctor in the search console above, then click <strong className="text-blue-600">Search Analytics & Show Data</strong> to reveal metrics.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onQuickLaunch && onQuickLaunch("all")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all inline-flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Search className="w-4 h-4" />
              <span>Search All Hospital Encounters Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
