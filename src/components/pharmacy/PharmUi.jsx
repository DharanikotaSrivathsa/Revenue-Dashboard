"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Flat, saturated colours only: no gradients anywhere in the pharmacy views.
export const PALETTE = ["#f59e0b", "#6366f1", "#10b981", "#ec4899", "#0ea5e9", "#8b5cf6", "#ef4444"];

const SOLID = {
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  emerald: "bg-emerald-600",
  teal: "bg-teal-600",
  indigo: "bg-indigo-600",
  sky: "bg-sky-600",
  rose: "bg-rose-600",
  violet: "bg-violet-600",
};

export function KpiCard({ label, value, sub, icon: Icon, tone = "amber" }) {
  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 ${SOLID[tone]}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/85 leading-tight">{label}</span>
        {Icon && (
          <div className="w-8 h-8 shrink-0 rounded-xl bg-white/25 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="text-3xl font-black tracking-tight">{value}</div>
      {sub && <p className="text-xs text-white/85 mt-1">{sub}</p>}
    </div>
  );
}

export function Panel({ title, subtitle, icon: Icon, action, accent = "border-t-amber-500", children, className = "" }) {
  return (
    <div className={`bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 border-t-4 shadow-sm ${accent} ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-gray-500" />}
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

export function NoData({ children = "No data for the selected filters" }) {
  return (
    <div className="h-full min-h-[10rem] flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
      {children}
    </div>
  );
}

// Full pie (no hole). `format` renders the value text shown on hover.
export function PieBlock({ data, format = (v) => v }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <NoData />;
  const shown = data.filter((d) => d.value > 0);

  // Only the name sits on the slice; share and value appear on hover. Slices too thin for text stay unlabelled.
  const renderLabel = ({ cx, cy, midAngle, outerRadius, percent, name }) => {
    if (percent < 0.05) return null;
    const rad = Math.PI / 180;
    const r = outerRadius * 0.65;
    const x = cx + r * Math.cos(-midAngle * rad);
    const y = cy + r * Math.sin(-midAngle * rad);
    return (
      <text x={x} y={y} fill="#ffffff" fontSize={percent > 0.1 ? 13 : 11} fontWeight={800} textAnchor="middle" dominantBaseline="central" style={{ pointerEvents: "none" }}>
        {name}
      </text>
    );
  };

  const hoverCard = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0].payload;
    return (
      <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
        <div className="font-bold text-gray-900 mb-0.5">{name}</div>
        <div className="text-gray-600">
          <strong className="text-gray-900">{format(value)}</strong>
          <span className="mx-1.5 text-gray-300">|</span>
          <strong className="text-gray-900">{((value / total) * 100).toFixed(1)}%</strong>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={shown} dataKey="value" nameKey="name" outerRadius="98%" stroke="#ffffff" strokeWidth={3} startAngle={90} endAngle={-270} labelLine={false} label={renderLabel}>
              {shown.map((d) => (
                <Cell key={d.name} fill={PALETTE[data.indexOf(d) % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip content={hoverCard} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Ranked horizontal bars in a single flat colour.
export function HBarList({ data, format = (v) => v, limit, color = "#f59e0b", ranked = false }) {
  const rows = limit ? data.slice(0, limit) : data;
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0) return <NoData />;
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.name}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-700 truncate pr-3">
              {ranked && <span className="inline-block w-5 text-gray-400 font-bold">{i + 1}</span>}
              {r.name}
            </span>
            <span className="font-extrabold text-gray-900 shrink-0">{format(r.value)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${Math.max(3, (r.value / max) * 100)}%`, background: color }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Flat circular gauge. `value` is 0-100.
export function Ring({ value, label, sub, color = "#fbbf24" }) {
  const r = 44, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const CAP = 9;
  // Round caps extend half a stroke past each end, so shorten the arc to keep the gap honest.
  const arc = pct >= 100 ? c : pct <= 0 ? 0 : Math.max(0.01, (pct / 100) * c - CAP);
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="9" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${arc} ${c}`} strokeDashoffset={-CAP / 2} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">{pct.toFixed(1)}%</div>
      </div>
      <span className="mt-2 text-xs font-bold text-white">{label}</span>
      <span className="text-[10px] text-white/70">{sub}</span>
    </div>
  );
}

export function Hero({ badge, icon: Icon, title, description, rings, bg = "bg-indigo-700" }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-md ${bg}`}>
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10" />
      <div className="absolute right-40 -bottom-16 w-40 h-40 rounded-full bg-white/5" />
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            {Icon && <Icon className="w-3 h-3" />} {badge}
          </span>
          <h2 className="text-2xl font-black tracking-tight mt-2">{title}</h2>
          <p className="text-xs text-white/80 mt-1">{description}</p>
        </div>
        <div className="flex items-start justify-around gap-6 flex-1 lg:max-w-xl">
          {rings.map((r) => <Ring key={r.label} {...r} />)}
        </div>
      </div>
    </div>
  );
}
