"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Inbox } from "lucide-react";
import { formatMoney, formatNum } from "../../data/mockData";

export const COLORS = {
  navy: "#0f172a",
  blue: "#2563eb",
  teal: "#0d9488",
  indigo: "#6366f1",
  sky: "#0ea5e9",
  amber: "#d9822b",
  rose: "#dc4a4a",
  slate: "#94a3b8"
};

// False when the visitor asks for reduced motion, so charts draw instantly.
export function useAnimate() {
  const [animate, setAnimate] = useState(true);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setAnimate(!m.matches);
    const h = (e) => setAnimate(!e.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  return animate;
}

export const shortMoney = (v) =>
  v >= 10000000 ? `₹${(v / 10000000).toFixed(1)}Cr` : v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`;

const axisTick = { fontSize: 11, fill: "#64748b" };
const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" };

// Design tokens: white surfaces, one slate border, one soft shadow. Colour is opt-in through `accent` / `tinted`.
const SURFACE = "bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)]";

export function Section({ title, subtitle, children, accent }) {
  return (
    <section className="space-y-4">
      <div style={accent ? { borderLeft: `4px solid ${accent}`, paddingLeft: 12 } : undefined}>
        <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
        {subtitle && <p className="text-[13px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export function Card({ title, subtitle, action, children, className = "", accent }) {
  return (
    <div
      style={accent ? { borderTop: `3px solid ${accent}`, backgroundImage: `linear-gradient(180deg, ${accent}12 0%, #ffffff 120px)` } : undefined}
      className={`${SURFACE} p-5 min-w-0 transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(16,24,40,0.08)] ${className}`}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div role="group" aria-label={title || undefined}>{children}</div>
    </div>
  );
}

const STAT_TONES = {
  blue: { icon: "text-blue-600", tint: "from-blue-100 border-blue-200", solid: "bg-blue-600 shadow-blue-600/30" },
  sky: { icon: "text-sky-600", tint: "from-sky-100 border-sky-200", solid: "bg-sky-500 shadow-sky-500/30" },
  indigo: { icon: "text-indigo-600", tint: "from-indigo-100 border-indigo-200", solid: "bg-indigo-600 shadow-indigo-600/30" },
  violet: { icon: "text-violet-600", tint: "from-violet-100 border-violet-200", solid: "bg-violet-600 shadow-violet-600/30" },
  teal: { icon: "text-teal-600", tint: "from-teal-100 border-teal-200", solid: "bg-teal-600 shadow-teal-600/30" },
  emerald: { icon: "text-emerald-600", tint: "from-emerald-100 border-emerald-200", solid: "bg-emerald-600 shadow-emerald-600/30" },
  amber: { icon: "text-amber-600", tint: "from-amber-100 border-amber-200", solid: "bg-amber-500 shadow-amber-500/30" },
  rose: { icon: "text-rose-600", tint: "from-rose-100 border-rose-200", solid: "bg-rose-600 shadow-rose-600/30" },
  slate: { icon: "text-slate-500", tint: "from-slate-200 border-slate-300", solid: "bg-slate-600 shadow-slate-600/30" }
};

// Neutral by default. `tinted` gives the card a soft colour wash and a solid colour icon.
export function Stat({ label, value, note, icon: Icon, tone = "blue", delta, invert = false, tinted = false }) {
  const t = STAT_TONES[tone] || STAT_TONES.blue;
  const good = delta != null && (delta >= 0) !== invert;
  return (
    <div className={`rounded-xl border p-5 min-w-0 h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,24,40,0.09)] ${tinted ? `bg-gradient-to-br ${t.tint} via-white to-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]` : "bg-white border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] hover:border-slate-300"}`}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-600">{label}</span>
        {Icon && (
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${tinted ? `${t.solid} text-white shadow-md` : `bg-slate-50 ring-1 ring-slate-200 ${t.icon}`}`}>
            <Icon className="w-[18px] h-[18px]" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="font-data mt-3 text-[28px] leading-8 font-semibold text-slate-900 truncate">{value}</div>
      <div className="mt-2.5 flex items-center justify-between gap-2 min-h-[22px]">
        <span className="text-xs text-slate-500 truncate">{note}</span>
        {delta != null && (
          <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold flex-shrink-0 ${good ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
            <span aria-hidden="true">{delta >= 0 ? "↑" : "↓"}</span> {Math.abs(delta)}%
          </span>
        )}
      </div>
    </div>
  );
}

export function MiniStat({ label, value, tone = "text-slate-900" }) {
  return (
    <div className="rounded-lg bg-white border border-slate-200 px-3.5 py-3 min-w-0 transition-colors hover:border-slate-300">
      <div className="text-xs font-medium text-slate-500 truncate">{label}</div>
      <div className={`font-data text-base font-semibold mt-0.5 truncate ${tone}`}>{value}</div>
    </div>
  );
}

// A row of figures in one bordered panel, separated by hairlines. `accent` colours the top edge and the hover wash.
export function StatStrip({ items, cols = "grid-cols-2 md:grid-cols-3 xl:grid-cols-5", accent }) {
  return (
    <div className={`${SURFACE} overflow-hidden`} style={accent ? { borderTop: `3px solid ${accent}` } : undefined}>
      <div className={`grid ${cols} -mr-px -mb-px`}>
        {items.map((i) => (
          <div key={i.label} className="group px-4 py-3.5 border-r border-b border-slate-200 min-w-0 transition-colors hover:bg-slate-50" style={accent ? { backgroundImage: `linear-gradient(135deg, ${accent}0d 0%, transparent 70%)` } : undefined}>
            <div className="text-xs font-medium text-slate-500 truncate flex items-center gap-1.5">
              {accent && <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />}
              <span className="truncate">{i.label}</span>
            </div>
            <div className={`font-data text-[17px] leading-6 font-semibold mt-0.5 truncate ${i.tone || "text-slate-900"}`}>{i.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NoData({ height = 220 }) {
  return (
    <div className="flex flex-col items-center justify-center text-slate-500 text-xs gap-2" style={{ height }}>
      <Inbox className="w-6 h-6" />
      <span>No data for the selected filters</span>
    </div>
  );
}

export function Donut({ data, money = false, centerLabel, centerValue, height = 220 }) {
  const animate = useAnimate();
  const fmt = money ? formatMoney : formatNum;
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <NoData height={height} />;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="relative w-full sm:w-1/2" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie isAnimationActive={animate} data={data} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="92%" paddingAngle={2} stroke="none">
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [fmt(v), n]} contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-data text-lg font-semibold text-slate-900">{centerValue ?? fmt(total)}</span>
          <span className="text-[11px] font-medium text-slate-500">{centerLabel || "Total"}</span>
        </div>
      </div>
      <ul className="w-full sm:w-1/2 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
              <span className="font-medium text-slate-700 truncate">{d.name}</span>
            </span>
            <span className="text-slate-500 flex-shrink-0">
              <strong className="font-data font-semibold text-slate-900">{fmt(d.value)}</strong>
              <span className="ml-2 text-slate-500 tabular-nums inline-block w-9 text-right">{Math.round((d.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Columns({ data, color = COLORS.blue, height = 220, money = false }) {
  const animate = useAnimate();
  if (!data.some((d) => d.value > 0)) return <NoData height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={axisTick} />
          <YAxis tickLine={false} axisLine={false} width={money ? 48 : 30} allowDecimals={false} tick={axisTick} tickFormatter={money ? shortMoney : undefined} />
          <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => [money ? formatMoney(v) : formatNum(v), "Count"]} contentStyle={tooltipStyle} />
          <Bar isAnimationActive={animate} dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HBars({ data, height = 240, money = false, onSelect }) {
  const animate = useAnimate();
  if (!data.some((d) => d.value > 0)) return <NoData height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef1f5" />
          <XAxis type="number" tickLine={false} axisLine={false} tick={axisTick} allowDecimals={false} tickFormatter={money ? shortMoney : undefined} />
          <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={124} tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }} />
          <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => [money ? formatMoney(v) : formatNum(v), ""]} contentStyle={tooltipStyle} />
          <Bar isAnimationActive={animate} dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={26} cursor={onSelect ? "pointer" : undefined} onClick={onSelect ? (d) => onSelect(d.name) : undefined}>
            {data.map((d) => <Cell key={d.name} fill={d.color || COLORS.blue} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// lines: [{ key, name, color, dashed? }]
export function Lines({ data, lines, height = 240, money = false }) {
  const animate = useAnimate();
  if (!data.length || !data.some((d) => lines.some((l) => d[l.key] > 0))) return <NoData height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={axisTick} minTickGap={20} />
          <YAxis tickLine={false} axisLine={false} width={money ? 48 : 30} allowDecimals={false} tick={axisTick} tickFormatter={money ? shortMoney : undefined} />
          <Tooltip formatter={(v, n) => [money ? formatMoney(v) : formatNum(v), n]} contentStyle={tooltipStyle} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          {lines.map((l, i) => (
            <Line
              isAnimationActive={animate}
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              strokeDasharray={l.dashed ? "5 4" : lines.length > 2 ? ["", "6 3", "2 3", "10 3 2 3", "1 4", "8 2"][i % 6] || undefined : undefined}
              dot={data.length <= 12 ? { r: data.length === 1 ? 6 : 3 } : false}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Progress({ label, value, hint, color = COLORS.blue }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1.5">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-data font-semibold text-slate-900">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
      {hint && <p className="text-xs text-slate-500 mt-1.5">{hint}</p>}
    </div>
  );
}
