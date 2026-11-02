"use client";

import React, { useState, useMemo } from "react";
import { 
  Layers, 
  Bed, 
  Users, 
  TrendingUp, 
  DollarSign, 
  ChevronRight
} from "lucide-react";
import { DEPARTMENTS, formatMoney, formatNum } from "../data/mockData";

export default function DepartmentPerformance({ encounters, onSelectDoctor }) {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("All");

  // Aggregate stats per department
  const deptStats = useMemo(() => {
    return DEPARTMENTS.map((dept) => {
      const deptEncounters = encounters.filter((e) => e.department === dept.name);
      const net = deptEncounters.reduce((s, e) => s + e.totalNet, 0);
      const collected = deptEncounters.reduce((s, e) => s + e.collected, 0);
      const outstanding = deptEncounters.reduce((s, e) => s + e.outstanding, 0);
      const consultNet = deptEncounters.reduce((s, e) => s + e.consultNet, 0);
      const labNet = deptEncounters.reduce((s, e) => s + e.labNet, 0);
      const pharmNet = deptEncounters.reduce((s, e) => s + e.pharmNet, 0);
      const procNet = deptEncounters.reduce((s, e) => s + e.procNet, 0);
      const ipdNet = deptEncounters.filter(e => e.invoiceType === "IPD").reduce((s, e) => s + e.totalNet, 0);
      const directYield = consultNet + procNet;

      const uniquePatients = new Set(deptEncounters.map((e) => e.patientId)).size;
      const completedVisits = deptEncounters.filter((e) => e.consultStatus === "Completed").length;
      const collectionRate = net > 0 ? Math.round((collected / net) * 100) : 0;

      return {
        name: dept.name,
        head: dept.head,
        beds: dept.bedCapacity,
        opdCount: dept.opdCount,
        encountersCount: deptEncounters.length,
        uniquePatients,
        completedVisits,
        consultNet,
        labNet,
        pharmNet,
        procNet,
        ipdNet,
        directYield,
        net,
        collected,
        outstanding,
        collectionRate,
        encounters: deptEncounters
      };
    }).filter(d => d.encountersCount > 0);
  }, [encounters]);

  const deptColors = ["#2563eb", "#0d9488", "#d97706", "#7c3aed", "#e11d48"];

  // SVG Stacked Bar Dimensions
  const maxDeptNet = Math.max(1, ...deptStats.map(d => d.net)) * 1.15;
  const sW = 680, sH = 220, sPL = 50, sPR = 20, sPT = 16, sPB = 34;
  const sColWidth = (sW - sPL - sPR) / Math.max(1, deptStats.length);
  const sBarW = Math.min(32, sColWidth - 16);

  return (
    <div className="space-y-6">
      {/* Department Scorecard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {deptStats.map((dept, idx) => (
          <div 
            key={dept.name}
            onClick={() => setSelectedDeptFilter(prev => prev === dept.name ? "All" : dept.name)}
            className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer ${
              selectedDeptFilter === dept.name 
                ? "border-blue-500 ring-2 ring-blue-500/10 shadow-sm bg-blue-50/20" 
                : "border-slate-200/90 hover:border-slate-300 shadow-xs"
            }`}
          >
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-slate-800 truncate">{dept.name}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                {dept.beds} Beds
              </span>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatMoney(dept.net)}
            </div>
            <div className="text-xs text-slate-500 mt-2 space-y-1">
              <div className="flex justify-between">
                <span>Transactions:</span>
                <strong className="text-slate-800">{dept.encountersCount} Invoiced</strong>
              </div>
              <div className="flex justify-between">
                <span>Cash Rate:</span>
                <strong className={dept.collectionRate >= 70 ? "text-emerald-600" : "text-amber-600"}>
                  {dept.collectionRate}%
                </strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Head:</span>
                <span className="truncate">{dept.head.replace("Dr. ", "")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* SVG Stacked Bar Chart */}
        <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                Department Yield by Service Stream
              </h3>
              <p className="text-xs text-slate-500">OPD Consult, Lab Diagnostics, Pharmacy, and Clinical Procedures</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-blue-600"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Consult</span>
              <span className="flex items-center gap-1 text-teal-600"><span className="w-2.5 h-2.5 rounded-sm bg-teal-600"></span> Labs</span>
              <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-sm bg-amber-600"></span> Pharmacy</span>
              <span className="flex items-center gap-1 text-purple-600"><span className="w-2.5 h-2.5 rounded-sm bg-purple-600"></span> Procedures</span>
            </div>
          </div>

          <div className="relative w-full h-60">
            <svg viewBox={`0 0 ${sW} ${sH}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
              {[0, 0.5, 1].map((lvl, idx) => {
                const yVal = sH - sPB - (lvl * (sH - sPT - sPB));
                return (
                  <g key={idx}>
                    <line x1={sPL} y1={yVal} x2={sW - sPR} y2={yVal} stroke="#f1f5f9" strokeDasharray="3 3" />
                    <text x={sPL - 8} y={yVal + 3} textAnchor="end" fill="#94a3b8" fontSize="10">
                      ₹{Math.round((maxDeptNet * lvl) / 1000)}k
                    </text>
                  </g>
                );
              })}

              {deptStats.map((dept, idx) => {
                const colX = sPL + idx * sColWidth + (sColWidth / 2);
                const scale = (sH - sPT - sPB) / maxDeptNet;
                const hProc = dept.procNet * scale;
                const hPharm = dept.pharmNet * scale;
                const hLab = dept.labNet * scale;
                const hConsult = dept.consultNet * scale;

                let curY = sH - sPB;

                const yConsult = curY - hConsult;
                curY -= hConsult;
                const yLab = curY - hLab;
                curY -= hLab;
                const yPharm = curY - hPharm;
                curY -= hPharm;
                const yProc = curY - hProc;

                return (
                  <g key={dept.name} className="cursor-pointer" onClick={() => setSelectedDeptFilter(prev => prev === dept.name ? "All" : dept.name)}>
                    <rect x={colX - sBarW / 2} y={yConsult} width={sBarW} height={Math.max(1, hConsult)} fill="#2563eb" />
                    <rect x={colX - sBarW / 2} y={yLab} width={sBarW} height={Math.max(1, hLab)} fill="#0d9488" />
                    <rect x={colX - sBarW / 2} y={yPharm} width={sBarW} height={Math.max(1, hPharm)} fill="#d97706" />
                    <rect x={colX - sBarW / 2} y={yProc} width={sBarW} height={Math.max(1, hProc)} rx="3" fill="#7c3aed" />
                    <text x={colX} y={sH - 10} textAnchor="middle" fill="#475569" fontSize="10" fontWeight="600">
                      {dept.name.slice(0, 7)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Department Revenue Contribution Share */}
        <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Department Revenue Share</h3>
            <p className="text-xs text-slate-500 mb-3">Specialty contribution to total hospital net</p>

            <div className="py-2 flex items-center justify-center">
              <div className="relative w-36 h-36">
                {(() => {
                  const total = deptStats.reduce((s, x) => s + x.net, 0) || 1;
                  let cur = 0;
                  const stops = deptStats.map((d, i) => {
                    let start = cur;
                    let pct = (d.net / total) * 100;
                    cur += pct;
                    return `${deptColors[i % deptColors.length]} ${start.toFixed(1)}% ${cur.toFixed(1)}%`;
                  }).join(", ");

                  return (
                    <div 
                      className="w-full h-full rounded-full flex items-center justify-center shadow-inner"
                      style={{ background: `conic-gradient(${stops})` }}
                    >
                      <div className="w-24 h-24 rounded-full bg-white flex flex-col items-center justify-center text-center shadow-xs">
                        <span className="text-base font-black text-slate-900 leading-tight">
                          ₹{Math.round(total / 1000)}k
                        </span>
                        <span className="text-[9px] font-bold uppercase text-slate-400">Total Depts</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-3 border-t border-slate-100 text-xs">
            {deptStats.map((d, i) => (
              <div 
                key={d.name}
                onClick={() => setSelectedDeptFilter(prev => prev === d.name ? "All" : d.name)}
                className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: deptColors[i % deptColors.length] }}></span>
                  <span className="font-semibold text-slate-800">{d.name}</span>
                </div>
                <strong className="text-slate-900">{formatMoney(d.net)}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
