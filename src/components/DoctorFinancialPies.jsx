"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Stethoscope } from "lucide-react";
import { formatMoney } from "../data/mockData";

const DOCTOR_COLORS = ["#2563eb", "#0d9488", "#d97706", "#7c3aed", "#e11d48", "#059669", "#0891b2", "#9333ea"];

const METRICS = [
  { key: "net", label: "Net Revenue" },
  { key: "collected", label: "Collected" },
  { key: "outstanding", label: "Outstanding" },
  { key: "packageNet", label: "Package Revenue" }
];

export default function DoctorFinancialPies({ doctors, onSelectDoctor }) {
  const [metric, setMetric] = useState("net");
  const [hoverId, setHoverId] = useState(null);

  const metricLabel = METRICS.find(m => m.key === metric).label;
  const data = doctors
    .map((d, i) => ({ ...d, value: d[metric], color: DOCTOR_COLORS[i % DOCTOR_COLORS.length] }))
    .filter(d => d.value > 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  const focusId = hoverId;
  const focus = data.find(d => d.id === focusId) || null;

  // Second pie: how the focused doctor's (or everyone's) invoiced amount splits into collected vs outstanding
  const scope = focus || {
    name: "All Doctors",
    net: doctors.reduce((s, d) => s + d.net, 0),
    collected: doctors.reduce((s, d) => s + d.collected, 0),
    outstanding: doctors.reduce((s, d) => s + d.outstanding, 0)
  };
  const rate = scope.net > 0 ? Math.round((scope.collected / scope.net) * 100) : 0;
  const splitData = [
    { name: "Collected", value: scope.collected, color: "#0d9488" },
    { name: "Outstanding", value: scope.outstanding, color: "#d97706" }
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/90 shadow-2xs w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-blue-600" />
            <span>Doctor Financial Comparison</span>
          </h3>
          <p className="text-xs text-gray-500">Switch the metric, hover a slice or doctor for details, click to open the doctor</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === m.key ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-6 items-center">
        {/* Pie 1: share by doctor */}
        <div className="relative h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="92%"
                paddingAngle={2}
                stroke="none"
                onMouseEnter={(_, i) => setHoverId(data[i].id)}
                onMouseLeave={() => setHoverId(null)}
                onClick={(_, i) => onSelectDoctor(data[i].name)}
              >
                {data.map(d => (
                  <Cell
                    key={d.id}
                    fill={d.color}
                    fillOpacity={focusId && focusId !== d.id ? 0.35 : 1}
                    className="cursor-pointer outline-none transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={() => null} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-12">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              {focus ? focus.name : metricLabel}
            </span>
            <span className="text-xl font-black text-gray-900 tracking-tight">
              {formatMoney(focus ? focus.value : total)}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold">
              {focus ? `${Math.round((focus.value / total) * 100)}% of ${metricLabel}` : `${data.length} doctors`}
            </span>
          </div>
        </div>

        {/* Legend / ranking list */}
        <div className="space-y-1.5">
          {data.length === 0 && <p className="text-xs text-gray-400">No {metricLabel.toLowerCase()} recorded for this selection.</p>}
          {[...data].sort((a, b) => b.value - a.value).map(d => (
            <button
              key={d.id}
              onMouseEnter={() => setHoverId(d.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onSelectDoctor(d.name)}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl border text-left transition-all cursor-pointer ${
                focusId === d.id ? "border-blue-300 bg-blue-50/60" : "border-transparent hover:bg-gray-50"
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <span className="text-xs font-bold text-gray-800 truncate">{d.name}</span>
              </span>
              <span className="text-xs text-gray-600 flex-shrink-0">
                <strong className="text-gray-900">{formatMoney(d.value)}</strong>
                <span className="text-gray-400 ml-1.5">{Math.round((d.value / total) * 100)}%</span>
              </span>
            </button>
          ))}
        </div>

        {/* Pie 2: collected vs outstanding for focused doctor */}
        <div className="flex flex-col items-center">
          <div className="relative h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={splitData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {splitData.map(d => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-black text-gray-900">{rate}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Collected</span>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-800 mt-1">{scope.name}</div>
          <div className="flex items-center gap-4 mt-1.5 text-[11px] font-semibold">
            <span className="text-teal-700">● {formatMoney(scope.collected)} collected</span>
            <span className="text-amber-700">● {formatMoney(scope.outstanding)} due</span>
          </div>
        </div>
      </div>
    </div>
  );
}
