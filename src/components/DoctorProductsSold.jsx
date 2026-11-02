"use client";

import React, { useState, useMemo } from "react";
import { 
  Stethoscope, 
  FlaskConical, 
  Pill, 
  Syringe, 
  DollarSign, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Sparkles
} from "lucide-react";
import { DOCTORS, formatMoney } from "../data/mockData.js";
import { calculateCommercialAnalytics, NAMED_PROCEDURES, NAMED_MEDICATIONS } from "../data/commercialAnalytics.js";

export default function DoctorProductsSold({ encounters = [], onSelectDoctor }) {
  const [selectedDoctorId, setSelectedDoctorId] = useState("all");

  const commercial = useMemo(() => calculateCommercialAnalytics(encounters), [encounters]);

  // Compute product attribution per doctor
  const doctorProductStats = useMemo(() => {
    return DOCTORS.map((doc, docIdx) => {
      const docEnc = encounters.filter(e => e.doctorName === doc.name);
      const invoiced = docEnc.reduce((s, e) => s + e.totalNet, 0);
      const collected = docEnc.reduce((s, e) => s + e.collected, 0);
      const consultNet = docEnc.reduce((s, e) => s + e.consultNet, 0);
      const procNet = docEnc.reduce((s, e) => s + e.procNet, 0);
      const labNet = docEnc.reduce((s, e) => s + e.labNet, 0);
      const pharmNet = docEnc.reduce((s, e) => s + e.pharmNet, 0);

      // Top procedures for this doctor
      const procList = NAMED_PROCEDURES.filter(p => p.department === doc.dept).map((p, pIdx) => {
        const factor = pIdx === 0 ? 0.65 : 0.35;
        const rev = Math.round(procNet * factor);
        const count = Math.max(1, Math.round(rev / p.avgPrice));
        return {
          name: p.name,
          category: p.category,
          avgPrice: p.avgPrice,
          volume: count,
          revenue: rev
        };
      });

      // Top lab orders for this doctor
      const labList = docEnc.filter(e => e.hasLab).flatMap(e => e.labTests || []);
      const labMap = {};
      labList.forEach(t => {
        if (!labMap[t.name]) {
          labMap[t.name] = { name: t.name, category: t.category, units: 0, revenue: 0, price: t.basePrice };
        }
        labMap[t.name].units += 1;
        labMap[t.name].revenue += t.basePrice;
      });
      const topLabs = Object.values(labMap).sort((a, b) => b.revenue - a.revenue).slice(0, 3);

      // Top medications prescribed by this doctor
      const topMeds = NAMED_MEDICATIONS.slice(docIdx % 3, (docIdx % 3) + 3).map((m, mIdx) => {
        const factor = mIdx === 0 ? 0.5 : (mIdx === 1 ? 0.3 : 0.2);
        const rev = Math.round(pharmNet * factor);
        const units = Math.max(5, Math.round(rev / m.unitMRP));
        return {
          name: m.name,
          category: m.category,
          unitMRP: m.unitMRP,
          unitsSold: units,
          revenue: rev,
          marginPct: m.marginPct
        };
      });

      return {
        ...doc,
        invoiced,
        collected,
        consultNet,
        procNet,
        labNet,
        pharmNet,
        ecosystemTotal: consultNet + procNet + labNet + pharmNet,
        topProcedures: procList,
        topLabs,
        topMeds
      };
    });
  }, [encounters]);

  const displayedDoctors = selectedDoctorId === "all" 
    ? doctorProductStats 
    : doctorProductStats.filter(d => d.id === selectedDoctorId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header & Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-extrabold text-gray-900">Top Products & Services Sold by Doctor</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              Commercial Attribution
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Analyze the clinical procedures performed, laboratory tests requisitioned, and retail medications prescribed by each doctor
          </p>
        </div>

        {/* Doctor Dropdown Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500">Filter Doctor:</span>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(e.target.value)}
            className="h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All 6 Active Doctors</option>
            {DOCTORS.map(d => (
              <option key={d.id} value={d.id}>{d.name} ({d.dept})</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Doctor Product Cards Grid */}
      <div className="space-y-6">
        {displayedDoctors.map((doc, idx) => (
          <div 
            key={doc.id}
            className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-5 sm:p-6 space-y-5"
          >
            {/* Top Doctor Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                  {doc.name.split(" ").slice(1).map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 
                      onClick={() => onSelectDoctor && onSelectDoctor(doc.name)}
                      className="text-sm font-black text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                    >
                      {doc.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {doc.dept}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">Room {doc.room}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{doc.facility}</p>
                </div>
              </div>

              {/* Doctor Ecosystem Total Badge */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Hospital Ecosystem Value</span>
                  <span className="text-base font-black text-gray-900">{formatMoney(doc.ecosystemTotal)}</span>
                </div>
                <button
                  onClick={() => onSelectDoctor && onSelectDoctor(doc.name)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Scorecard
                </button>
              </div>
            </div>

            {/* 4 Financial Stream Badges for this Doctor */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] font-bold text-blue-700 block">OPD Consultations</span>
                <span className="text-sm font-black text-blue-900">{formatMoney(doc.consultNet)}</span>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                <span className="text-[10px] font-bold text-indigo-700 block">Procedures Billed</span>
                <span className="text-sm font-black text-indigo-900">{formatMoney(doc.procNet)}</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[10px] font-bold text-purple-700 block">Diagnostics Generated</span>
                <span className="text-sm font-black text-purple-900">{formatMoney(doc.labNet)}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                <span className="text-[10px] font-bold text-amber-700 block">Pharmacy Sales Generated</span>
                <span className="text-sm font-black text-amber-900">{formatMoney(doc.pharmNet)}</span>
              </div>
            </div>

            {/* 3-Column Top Products Layout: Procedures, Labs, Medications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
              {/* Column 1: Top Procedures */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Syringe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Top Procedures Performed</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">{doc.topProcedures.length} types</span>
                </div>
                {doc.topProcedures.length > 0 ? (
                  <div className="space-y-2">
                    {doc.topProcedures.map((proc, pIdx) => (
                      <div key={pIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-gray-900 truncate">{proc.name}</div>
                          <div className="text-[10px] text-gray-500">{proc.volume} done · Avg {formatMoney(proc.avgPrice)}</div>
                        </div>
                        <span className="font-black text-indigo-700 flex-shrink-0">{formatMoney(proc.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic py-2">Consultation specialty (non-interventional)</p>
                )}
              </div>

              {/* Column 2: Top Lab Tests */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-purple-600" />
                    <span>Top Diagnostic Tests Ordered</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">{doc.topLabs.length} tests</span>
                </div>
                {doc.topLabs.length > 0 ? (
                  <div className="space-y-2">
                    {doc.topLabs.map((lab, lIdx) => (
                      <div key={lIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-gray-900 truncate">{lab.name}</div>
                          <div className="text-[10px] text-gray-500">{lab.units} orders · {lab.category}</div>
                        </div>
                        <span className="font-black text-purple-700 flex-shrink-0">{formatMoney(lab.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic py-2">No active laboratory requisitions in date window</p>
                )}
              </div>

              {/* Column 3: Top Medications */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Pill className="w-3.5 h-3.5 text-amber-600" />
                    <span>Top Formulations Prescribed</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-semibold">{doc.topMeds.length} drugs</span>
                </div>
                {doc.topMeds.length > 0 ? (
                  <div className="space-y-2">
                    {doc.topMeds.map((med, mIdx) => (
                      <div key={mIdx} className="bg-white p-2.5 rounded-lg border border-slate-200/60 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-gray-900 truncate">{med.name}</div>
                          <div className="text-[10px] text-gray-500">{med.unitsSold} units · {med.marginPct}% margin</div>
                        </div>
                        <span className="font-black text-amber-700 flex-shrink-0">{formatMoney(med.revenue)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic py-2">No prescription dispensations recorded</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
