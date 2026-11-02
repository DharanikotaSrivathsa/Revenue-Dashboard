"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export const PALETTE = ["#0d9488", "#6366f1", "#f59e0b", "#ec4899", "#0ea5e9", "#8b5cf6", "#10b981"];

const TONES = {
  teal: { chip: "bg-teal-50 text-teal-600", value: "text-gray-900", bar: "from-teal-400 to-teal-600" },
  emerald: { chip: "bg-emerald-50 text-emerald-600", value: "text-emerald-700", bar: "from-emerald-400 to-emerald-600" },
  indigo: { chip: "bg-indigo-50 text-indigo-600", value: "text-gray-900", bar: "from-indigo-400 to-indigo-600" },
  amber: { chip: "bg-amber-50 text-amber-600", value: "text-amber-600", bar: "from-amber-400 to-amber-500" },
  rose: { chip: "bg-rose-50 text-rose-600", value: "text-rose-600", bar: "from-rose-400 to-rose-500" },
  sky: { chip: "bg-sky-50 text-sky-600", value: "text-gray-900", bar: "from-sky-400 to-sky-600" },
  violet: { chip: "bg-violet-50 text-violet-600", value: "text-gray-900", bar: "from-violet-400 to-violet-600" },
};

const SOLID = {
  teal: "from-teal-500 to-emerald-600 shadow-teal-500/30",
  emerald: "from-emerald-500 to-teal-600 shadow-emerald-500/30",
  indigo: "from-indigo-500 to-violet-600 shadow-indigo-500/30",
  amber: "from-amber-400 to-orange-500 shadow-amber-500/30",
  rose: "from-rose-500 to-pink-600 shadow-rose-500/30",
  sky: "from-sky-500 to-blue-600 shadow-sky-500/30",
  violet: "from-violet-500 to-fuchsia-600 shadow-violet-500/30",
};

export function KpiCard({ label, value, sub, icon: Icon, tone = "teal", solid = false }) {
  const t = TONES[tone];
  if (solid) {
    return (
      <div className={`relative overflow-hidden p-5 rounded-2xl text-white bg-gradient-to-br ${SOLID[tone]} shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all duration-200`}>
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -right-2 -bottom-10 w-24 h-24 rounded-full bg-white/10" />
        <div className="relative flex items-start justify-between gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 leading-tight">{label}</span>
          {Icon && (
            <div className="w-8 h-8 shrink-0 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="relative text-3xl font-black tracking-tight">{value}</div>
        {sub && <p className="relative text-xs text-white/80 mt-1">{sub}</p>}
      </div>
    );
  }
  return (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${t.bar} opacity-70`} />
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 leading-tight">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center ${t.chip}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className={`text-2xl font-black tracking-tight ${t.value}`}>{value}</div>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export function Panel({ title, subtitle, icon: Icon, action, children, className = "" }) {
  return (
    <div className={`bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-teal-600" />}
            <span>{title}</span>
          </h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-1 rounded-full bg-gradient-to-b from-teal-400 to-indigo-500" />
      <div>
        {eyebrow && <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600">{eyebrow}</span>}
        <h3 className="text-base font-black text-gray-900 leading-tight">{title}</h3>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
    </div>
  );
}

export function NoData({ children = "No data for the selected filters" }) {
  return (
    <div className="h-full min-h-[10rem] flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
      {children}
    </div>
  );
}

// Donut with a ranked legend. `format` renders the value text.
export function DonutBlock({ data, format = (v) => v, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <NoData />;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative w-44 h-44 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="92%" paddingAngle={2} stroke="none">
              {data.map((d, i) => (
                <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => format(v)} contentStyle={{ borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-lg font-black text-gray-900">{format(total)}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{centerLabel || "Total"}</span>
        </div>
      </div>
      <ul className="flex-1 w-full space-y-2">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-gray-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              {d.name}
            </span>
            <span className="text-gray-500">
              <strong className="text-gray-900">{format(d.value)}</strong>
              <span className="ml-1.5 text-gray-400">{Math.round((d.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Horizontal ranked bars (pure CSS, scales to long labels).
export function HBarList({ data, format = (v) => v, limit, color = "from-teal-400 to-teal-600" }) {
  const rows = limit ? data.slice(0, limit) : data;
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <NoData />;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.name}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700 truncate pr-3">{r.name}</span>
            <span className="font-extrabold text-gray-900 shrink-0">{format(r.value)}</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Circular progress ring. `value` is 0-100.
export function Ring({ value, label, sub, from = "#2dd4bf", to = "#6366f1", id }) {
  const r = 44, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  // Round caps extend half a stroke past each end, so shorten the arc by one stroke width to keep the gap honest.
  const CAP = 9;
  const arc = pct >= 100 ? c : pct <= 0 ? 0 : Math.max(0.01, (pct / 100) * c - CAP);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <defs>
            <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={from} />
              <stop offset="100%" stopColor={to} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={`url(#ring-${id})`} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${arc} ${c}`} strokeDashoffset={-CAP / 2} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{pct.toFixed(1)}%</div>
      </div>
      <span className="mt-2 text-xs font-bold text-white">{label}</span>
      <span className="text-[10px] text-slate-400">{sub}</span>
    </div>
  );
}

// Dark gradient hero with ring gauges, shared by the lab sub-tabs.
export function Hero({ badge, icon: Icon, title, description, rings, glowA = "bg-teal-500/20", glowB = "bg-fuchsia-500/20", gradient = "from-slate-900 via-indigo-950 to-teal-900" }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white bg-gradient-to-br ${gradient} border border-slate-800 shadow-xl`}>
      <div className={`absolute -left-10 -top-16 w-64 h-64 rounded-full ${glowA} blur-3xl`} />
      <div className={`absolute right-0 -bottom-20 w-72 h-72 rounded-full ${glowB} blur-3xl`} />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-wider text-teal-200">
            {Icon && <Icon className="w-3 h-3" />} {badge}
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">{title}</h2>
          <p className="text-xs text-slate-300 mt-1">{description}</p>
        </div>
        <div className="flex items-start justify-around gap-6 flex-1 lg:max-w-xl">
          {rings.map((r) => <Ring key={r.id} {...r} />)}
        </div>
      </div>
    </div>
  );
}
