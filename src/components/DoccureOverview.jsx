"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  Wallet,
  Clock,
  Percent,
  Users,
  UserCheck,
  Stethoscope,
  Building2,
  Download,
  Printer,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  CalendarDays,
  CreditCard,
  RotateCcw,
  Search,
  FlaskConical,
  Pill,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Filter,
  X,
  Activity,
  ChevronRight,
  ShieldCheck,
  Award,
  Zap,
  BarChart3,
  Layers
} from "lucide-react";
import { DOCTORS, FACILITIES, DEPARTMENTS, formatMoney, formatNum } from "../data/mockData";
import { PAY_MODES, revenueTrend, summarise as summariseDoctor } from "../data/doctorAnalytics";
import { summariseHospital, applyFilters, series, previousRange, money, INVOICE_TYPES } from "../data/hospitalAnalytics";
import { Section, Card, Stat, StatStrip, Donut, Columns, HBars, Lines, COLORS } from "./doctor/ChartKit";
import { BarSeries, BarAndLine } from "./doctor/MoreCharts";
import { DoccureDropdown, DoccureDatePicker } from "./common";
import TopSellers from "./doctor/TopSellers";
import CollectionInsights from "./doctor/CollectionInsights";

const TYPE_COLORS = {
  REGISTRATION: COLORS.slate,
  CONSULTATION: COLORS.blue,
  TREATMENT: COLORS.indigo,
  SERVICE: COLORS.sky,
  IPD: COLORS.teal,
  PACKAGE: COLORS.amber
};

const PAY_COLORS = {
  Cash: COLORS.teal,
  Card: COLORS.blue,
  UPI: COLORS.indigo,
  Insurance: COLORS.sky,
  "Bank transfer": COLORS.amber
};

const SERVICE_SERIES = [
  { key: "consultation", name: "Consultation", color: COLORS.blue },
  { key: "procedureRev", name: "Procedures", color: COLORS.indigo },
  { key: "lab", name: "Labs", color: COLORS.teal },
  { key: "pharmacy", name: "Pharmacy", color: COLORS.amber }
];

const LINE_PALETTE = [COLORS.blue, COLORS.teal, COLORS.indigo, COLORS.amber, COLORS.rose, COLORS.sky];

const TABS = [
  { id: "Revenue", label: "Revenue", icon: TrendingUp, color: "#2563eb", activeBg: "#1d4ed8" },
  { id: "Payments", label: "Payments", icon: CreditCard, color: "#0d9488", activeBg: "#0f766e" },
  { id: "Patients", label: "Patients", icon: Users, color: "#6366f1", activeBg: "#4f46e5" },
  { id: "Doctors", label: "Doctors", icon: Stethoscope, color: "#0284c7", activeBg: "#0369a1" },
  { id: "Departments", label: "Departments", icon: Building2, color: "#7c3aed", activeBg: "#6d28d9" },
  { id: "Labs", label: "Labs", icon: FlaskConical, color: "#e11d48", activeBg: "#be123c" },
  { id: "Pharmacy", label: "Pharmacy", icon: Pill, color: "#d97706", activeBg: "#b45309" }
];

const TAB_COLORS = Object.fromEntries(TABS.map((t) => [t.id, t.color]));
const TAB_ACTIVE = Object.fromEntries(TABS.map((t) => [t.id, t.activeBg]));

const FILTER_KEYS = ["facility", "dept", "doctor", "payMode", "invoiceType"];

const delta = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);

const fmtDay = (iso) =>
  iso
    ? new Date(iso + "T00:00:00Z").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC"
      })
    : "—";

function ViewAll({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer no-print group"
    >
      <span>{label}</span>
      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  );
}

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-52 rounded-2xl bg-gradient-to-r from-slate-200 to-slate-100" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-200/80" />
        ))}
      </div>
      <div className="h-80 rounded-2xl bg-slate-200/80" />
    </div>
  );
}

/**
 * Ultra-Premium Executive Scorecard Card with glass highlight, gradient accents,
 * micro-kickers, and progress gauges.
 */
function PremiumStatCard({
  kicker,
  label,
  value,
  subtext,
  deltaVal,
  invertDelta = false,
  icon: Icon,
  tone = "blue",
  progress = null,
  benchmark = null
}) {
  const tones = {
    blue: {
      border: "hover:border-blue-400/80",
      iconGrad: "from-blue-600 to-indigo-600 text-white shadow-blue-500/25",
      kickerBg: "bg-blue-50 text-blue-700 border-blue-200/70",
      barBg: "bg-blue-600",
      glow: "hover:shadow-[0_12px_30px_rgba(37,99,235,0.12)]"
    },
    emerald: {
      border: "hover:border-emerald-400/80",
      iconGrad: "from-emerald-600 to-teal-600 text-white shadow-emerald-500/25",
      kickerBg: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
      barBg: "bg-emerald-600",
      glow: "hover:shadow-[0_12px_30px_rgba(13,148,136,0.12)]"
    },
    amber: {
      border: "hover:border-amber-400/80",
      iconGrad: "from-amber-500 to-orange-600 text-white shadow-amber-500/25",
      kickerBg: "bg-amber-50 text-amber-700 border-amber-200/70",
      barBg: "bg-amber-500",
      glow: "hover:shadow-[0_12px_30px_rgba(217,119,6,0.12)]"
    },
    violet: {
      border: "hover:border-violet-400/80",
      iconGrad: "from-violet-600 to-purple-600 text-white shadow-violet-500/25",
      kickerBg: "bg-violet-50 text-violet-700 border-violet-200/70",
      barBg: "bg-violet-600",
      glow: "hover:shadow-[0_12px_30px_rgba(124,58,237,0.12)]"
    },
    sky: {
      border: "hover:border-sky-400/80",
      iconGrad: "from-sky-500 to-blue-600 text-white shadow-sky-500/25",
      kickerBg: "bg-sky-50 text-sky-700 border-sky-200/70",
      barBg: "bg-sky-500",
      glow: "hover:shadow-[0_12px_30px_rgba(14,165,233,0.12)]"
    },
    indigo: {
      border: "hover:border-indigo-400/80",
      iconGrad: "from-indigo-600 to-blue-700 text-white shadow-indigo-500/25",
      kickerBg: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      barBg: "bg-indigo-600",
      glow: "hover:shadow-[0_12px_30px_rgba(99,102,241,0.12)]"
    },
    teal: {
      border: "hover:border-teal-400/80",
      iconGrad: "from-teal-600 to-emerald-600 text-white shadow-teal-500/25",
      kickerBg: "bg-teal-50 text-teal-700 border-teal-200/70",
      barBg: "bg-teal-600",
      glow: "hover:shadow-[0_12px_30px_rgba(13,148,136,0.12)]"
    },
    rose: {
      border: "hover:border-rose-400/80",
      iconGrad: "from-rose-600 to-pink-600 text-white shadow-rose-500/25",
      kickerBg: "bg-rose-50 text-rose-700 border-rose-200/70",
      barBg: "bg-rose-600",
      glow: "hover:shadow-[0_12px_30px_rgba(225,29,72,0.12)]"
    }
  };

  const cfg = tones[tone] || tones.blue;
  const isPositive = deltaVal != null && (deltaVal >= 0) !== invertDelta;

  return (
    <div
      className={`relative bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-5 shadow-[0_2px_12px_rgba(15,23,42,0.03)] hover:-translate-y-1 transition-all duration-300 ${cfg.border} ${cfg.glow} flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          {kicker ? (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.kickerBg}`}
            >
              {kicker}
            </span>
          ) : (
            <span />
          )}
          {Icon && (
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${cfg.iconGrad} flex items-center justify-center shadow-md flex-shrink-0`}
            >
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-500 truncate">{label}</div>
        <div className="font-data text-2xl sm:text-[28px] font-extrabold tracking-tight text-slate-900 mt-1 leading-none">
          {value}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100/90 space-y-2">
        {progress != null && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>Realization Rate</span>
              <span className="font-data font-bold text-slate-900">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${cfg.barBg}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] gap-2 min-h-[20px]">
          <span className="text-slate-500 truncate">{subtext}</span>
          {deltaVal != null && (
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold flex-shrink-0 ${
                isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {deltaVal >= 0 ? "↑" : "↓"} {Math.abs(deltaVal)}%
            </span>
          )}
          {benchmark && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {benchmark}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DoccureOverview({
  encounters = [],
  defaultFrom = "",
  defaultTo = "",
  onSelectDoctor,
  onSelectDepartment,
  onNavigateSection
}) {
  const initial = {
    from: defaultFrom || "2026-10-01",
    to: defaultTo || "2026-10-29",
    facility: "All",
    dept: "All",
    doctor: "All",
    payMode: "All",
    invoiceType: "All"
  };

  const [draft, setDraft] = useState(initial);
  const [filters, setFilters] = useState(initial);
  const [tab, setTab] = useState("Revenue");
  const [view, setView] = useState("daily");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(t);
  }, [attempt]);

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const isDirty = JSON.stringify(draft) !== JSON.stringify(filters);
  const badRange = draft.from && draft.to && draft.from > draft.to;

  const apply = () => {
    if (!badRange) setFilters(draft);
  };

  const reset = () => {
    setDraft(initial);
    setFilters(initial);
  };

  // Quick Date Range Presets
  const handleDatePreset = (from, to) => {
    const updated = { ...draft, from, to };
    setDraft(updated);
    setFilters(updated);
  };

  // Clear single applied filter
  const removeFilter = (key) => {
    const updated = { ...filters, [key]: "All" };
    setDraft(updated);
    setFilters(updated);
  };

  const result = useMemo(() => {
    try {
      const scoped = applyFilters(encounters, filters);
      const range = previousRange(filters.from, filters.to);
      return {
        scoped,
        cur: summariseHospital(scoped),
        prev: range ? summariseHospital(applyFilters(encounters, { ...filters, ...range })) : null
      };
    } catch (error) {
      return { error };
    }
  }, [encounters, filters, attempt]);

  if (loading) return <Skeleton />;

  if (result.error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center space-y-3 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-base font-semibold text-slate-800">Something went wrong while preparing the overview.</p>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{String(result.error.message || result.error)}</p>
        <button
          onClick={() => setAttempt((a) => a + 1)}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reload Overview
        </button>
      </div>
    );
  }

  const { scoped, cur, prev } = result;
  const t = cur.totals;
  const pt = cur.patients;
  const lab = cur.lab;
  const rx = cur.pharmacy;
  const isEmpty = scoped.length === 0;
  const accent = TAB_COLORS[tab];
  const activeCount = FILTER_KEYS.filter((k) => filters[k] !== "All").length;

  const byTypeMap = Object.fromEntries(cur.byType.map((x) => [x.id, x.value]));
  const trend = series(scoped, view, filters.from, filters.to, {
    net: (e) => e.totalNet,
    collected: (e) => e.collected,
    outstanding: (e) => e.outstanding,
    visits: (e) => (e.consultStatus === "Completed" ? 1 : 0),
    lab: (e) => e.labNet || 0,
    pharmacy: (e) => e.pharmNet || 0
  });

  const revTrend = series(scoped, view, filters.from, filters.to, {
    billed: (e) => money(e).billed,
    net: (e) => money(e).net
  });

  const deptSorted = [...cur.departments].sort((a, b) => b.net - a.net);
  const docSorted = [...cur.doctors].sort((a, b) => b.revenue - a.revenue);
  const docByName = (short) => cur.doctors.find((d) => d.short === short)?.name;

  const doctorTrend = (() => {
    const map = new Map();
    cur.doctors.forEach((d) => {
      const es = scoped.filter((e) => e.doctorName === d.name);
      const rows = revenueTrend(summariseDoctor(es).billedRows, view, filters.from, filters.to);
      rows.forEach((r) => {
        const row = map.get(r.key) || { key: r.key, label: r.label };
        row[d.short] = r.net;
        map.set(r.key, row);
      });
    });
    return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
  })();

  const downloadCSV = () => {
    if (!cur.invoices.length) return alert("No invoices to export for the selected filters.");
    const head = [
      "Invoice",
      "Date",
      "Patient",
      "Type",
      "Department",
      "Doctor",
      "Billed",
      "Discount",
      "Refund",
      "Collected",
      "Outstanding",
      "Payment Mode",
      "Status"
    ];
    const lines = cur.invoices.map((i) => [
      i.id,
      i.date,
      i.patient,
      i.type,
      i.dept,
      i.doctor,
      i.billed,
      i.discount,
      i.refund,
      i.collected,
      i.outstanding,
      i.payMode,
      i.status
    ]);
    const csv = [head, ...lines].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `doccure-hospital-overview_${filters.from}_${filters.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ViewToggle = (
    <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs font-medium no-print">
      {["daily", "weekly", "monthly"].map((v) => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={`px-2.5 py-1 rounded-md capitalize cursor-pointer transition-all duration-150 ${
            view === v ? "bg-white text-slate-900 shadow-sm font-semibold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {v}
        </button>
      ))}
    </div>
  );

  return (
    <div className="ov-root w-full min-w-0 space-y-6 text-slate-800">
      <a
        href="#ov-panel"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:bg-white focus:text-blue-800 focus:font-bold focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
      >
        Skip to report
      </a>

      {/* 1. Ultra-Premium Command Center Header & Filter Bar */}
      <div className="relative z-20 bg-white rounded-3xl border border-slate-200/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] overflow-hidden">
        {/* Banner with Deep Obsidian & Sapphire Ambient Glow */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 px-6 py-7 sm:px-8 text-white border-b border-slate-800/80">
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-10 -top-24 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl" />
            <div className="absolute right-72 -bottom-24 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
            <div className="absolute left-1/3 -top-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 ring-2 ring-white/10 flex-shrink-0">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                      Hospital Executive Overview
                    </h1>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Live Telemetry
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">
                    Doccure Multi-Entity Healthcare Intelligence & Clinical Governance Platform
                  </p>
                </div>
              </div>

              {/* Ticker Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                  Period: <strong className="text-white font-semibold">{fmtDay(filters.from)} – {fmtDay(filters.to)}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Users className="w-3.5 h-3.5 text-blue-400" />
                  <strong className="text-white font-semibold">{formatNum(scoped.length)}</strong> Encounters
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  Net: <strong className="text-emerald-300 font-bold">{formatMoney(t.net)}</strong>
                </span>
                {filters.facility !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-300">
                    <Building2 className="w-3.5 h-3.5" />
                    Facility: <strong>{filters.facility}</strong>
                  </span>
                )}
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2.5 no-print self-start md:self-center">
              <button
                onClick={downloadCSV}
                className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 ring-1 ring-inset ring-white/20 text-xs font-semibold text-white inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Download className="w-4 h-4 text-cyan-300" /> Export CSV ({scoped.length})
              </button>
              <button
                onClick={() => window.print()}
                className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-bold text-white inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 ring-1 ring-white/20 transition-all cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Ribbon */}
        <div className="bg-slate-50/80 p-5 sm:p-6 space-y-4 no-print border-t border-slate-200/80">
          {/* Quick Date Range Preset Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-bold text-slate-500 mr-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Time Presets:
              </span>
              {[
                { label: "Full Month (Oct 01 - 29)", from: "2026-10-01", to: "2026-10-29" },
                { label: "Last 14 Days", from: "2026-10-16", to: "2026-10-29" },
                { label: "Last 7 Days", from: "2026-10-23", to: "2026-10-29" },
                { label: "Latest Day (Oct 29)", from: "2026-10-29", to: "2026-10-29" }
              ].map((p) => {
                const isSelected = draft.from === p.from && draft.to === p.to;
                return (
                  <button
                    key={p.label}
                    onClick={() => handleDatePreset(p.from, p.to)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            {/* Active Filter Tags */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {filters.facility !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    Facility: {filters.facility}
                    <button onClick={() => removeFilter("facility")} className="hover:text-blue-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.dept !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Dept: {filters.dept}
                    <button onClick={() => removeFilter("dept")} className="hover:text-indigo-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.doctor !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                    Doctor: {filters.doctor}
                    <button onClick={() => removeFilter("doctor")} className="hover:text-teal-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.payMode !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                    Payment: {filters.payMode}
                    <button onClick={() => removeFilter("payMode")} className="hover:text-amber-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters.invoiceType !== "All" && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                    Type: {filters.invoiceType}
                    <button onClick={() => removeFilter("invoiceType")} className="hover:text-purple-900 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 7 Filter Selectors Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <DoccureDatePicker compact label="From date" value={draft.from} onChange={set("from")} />
            <DoccureDatePicker compact label="To date" value={draft.to} onChange={set("to")} />
            <DoccureDropdown
              compact
              active={draft.facility !== "All"}
              label="Facility"
              value={draft.facility}
              onChange={set("facility")}
              options={[{ value: "All", label: "All Facilities" }, ...FACILITIES.map((f) => ({ value: f, label: f }))]}
            />
            <DoccureDropdown
              compact
              active={draft.dept !== "All"}
              label="Department"
              value={draft.dept}
              onChange={set("dept")}
              options={[{ value: "All", label: "All Departments" }, ...DEPARTMENTS.map((d) => ({ value: d.name, label: d.name }))]}
            />
            <DoccureDropdown
              compact
              active={draft.doctor !== "All"}
              label="Doctor"
              value={draft.doctor}
              onChange={set("doctor")}
              options={[{ value: "All", label: "All Doctors" }, ...DOCTORS.map((d) => ({ value: d.name, label: d.name }))]}
            />
            <DoccureDropdown
              compact
              active={draft.payMode !== "All"}
              label="Payment channel"
              value={draft.payMode}
              onChange={set("payMode")}
              options={[{ value: "All", label: "All Channels" }, ...PAY_MODES.map((m) => ({ value: m.id, label: m.label }))]}
            />
            <DoccureDropdown
              compact
              active={draft.invoiceType !== "All"}
              label="Invoice type"
              value={draft.invoiceType}
              onChange={set("invoiceType")}
              options={[{ value: "All", label: "All Types" }, ...INVOICE_TYPES.map((i) => ({ value: i.id, label: i.label }))]}
            />
          </div>

          {/* Filter Footer with Status & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p
              role="status"
              aria-live="polite"
              className={`text-xs flex items-center gap-1.5 ${
                badRange
                  ? "font-semibold text-rose-600"
                  : isDirty
                  ? "font-semibold text-amber-700"
                  : activeCount > 0
                  ? "font-medium text-blue-700"
                  : "text-slate-500"
              }`}
            >
              {badRange ? (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  From date must be on or before To date.
                </>
              ) : isDirty ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Filter parameters modified. Click Apply to recompute.
                </>
              ) : activeCount > 0 ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  {activeCount} active filter{activeCount > 1 ? "s" : ""} applied ({scoped.length} matching encounters)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                  Full hospital encounters dataset active
                </>
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="h-9 px-3.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
              </button>
              <button
                onClick={apply}
                disabled={!isDirty || badRange}
                className={`h-9 px-4 rounded-xl text-xs font-bold text-white inline-flex items-center gap-2 transition-all cursor-pointer ${
                  !isDirty || badRange
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/20"
                }`}
              >
                <Search className="w-3.5 h-3.5" /> Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center space-y-3 shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No hospital records match these criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your date range, clearing specific filters, or resetting back to all departments and doctors.
          </p>
          <button
            onClick={reset}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      ) : (
        <>
          {/* 2. Executive Intelligence Banner (Auto-Calculated Key Insights) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-lg border border-slate-800">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
                    Executive Key Highlights
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Live Pulse
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Lead Specialty: <strong className="text-cyan-300">{deptSorted[0]?.name || "Cardiology"}</strong> ({formatMoney(deptSorted[0]?.net || 0)} · {Math.round(((deptSorted[0]?.net || 0) / (t.net || 1)) * 100)}% share) ·
                    Lead Doctor: <strong className="text-white">Dr. {docSorted[0]?.short || "Sarah Jenkins"}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                  Collection Rate: <strong className="text-emerald-300">{t.rate}%</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                  Daily Run-Rate: <strong className="text-cyan-300">{pt.perDay} visits/day</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-200">
                  Diagnostic TAT: <strong className="text-amber-300">{lab.avgTurnaround} min</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Ultra-Premium Dual-Band Executive Scorecards */}
          <div className="space-y-4">
            {/* Band 1: Financial Health & Collections */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-blue-600" />
                  Financial Health & Cash Collections
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Gross Billed: <strong className="text-slate-900 font-data font-bold">{formatMoney(t.gross)}</strong>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <PremiumStatCard
                  kicker="PRIMARY NET"
                  label="Hospital Net Revenue"
                  value={formatMoney(t.net)}
                  subtext={`Gross ${formatMoney(t.gross)} − ₹${Math.round((t.discount + t.refund) / 1000)}k deductions`}
                  icon={Receipt}
                  tone="blue"
                  deltaVal={prev ? delta(t.net, prev.totals.net) : null}
                />
                <PremiumStatCard
                  kicker="CASH REALIZED"
                  label="Total Collections Received"
                  value={formatMoney(t.collected)}
                  subtext="Actual cash, UPI & cards banked"
                  icon={Wallet}
                  tone="emerald"
                  deltaVal={prev ? delta(t.collected, prev.totals.collected) : null}
                />
                <PremiumStatCard
                  kicker="RECEIVABLES"
                  label="Outstanding Balances"
                  value={formatMoney(t.outstanding)}
                  subtext="Pending patient & insurer accounts"
                  icon={Clock}
                  tone="amber"
                  invertDelta
                  deltaVal={prev ? delta(t.outstanding, prev.totals.outstanding) : null}
                />
                <PremiumStatCard
                  kicker="EFFICIENCY"
                  label="Collection Efficiency"
                  value={`${t.rate}%`}
                  subtext="Benchmark Goal: ≥ 90.0%"
                  icon={Percent}
                  tone="violet"
                  progress={t.rate}
                  deltaVal={prev ? delta(t.rate, prev.totals.rate) : null}
                />
              </div>
            </div>

            {/* Band 2: Clinical Operations & Volume */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Clinical Workload & Patient Volume
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {cur.activeDoctors} Active Doctors across {cur.activeDepartments} Departments
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <PremiumStatCard
                  kicker="ENCOUNTERS"
                  label="Completed Consultations"
                  value={formatNum(pt.visits)}
                  subtext={`${pt.perDay} avg encounters / day`}
                  icon={Users}
                  tone="sky"
                  deltaVal={prev ? delta(pt.visits, prev.patients.visits) : null}
                />
                <PremiumStatCard
                  kicker="PATIENTS"
                  label="Unique Patients Served"
                  value={formatNum(pt.unique)}
                  subtext={`${formatNum(pt.newP)} new · ${formatNum(pt.returning)} returning`}
                  icon={UserCheck}
                  tone="indigo"
                  deltaVal={prev ? delta(pt.unique, prev.patients.unique) : null}
                />
                <PremiumStatCard
                  kicker="PHYSICIANS"
                  label="Active Clinical Doctors"
                  value={`${formatNum(cur.activeDoctors)} Doctors`}
                  subtext="Treating physicians on active roster"
                  icon={Stethoscope}
                  tone="teal"
                  deltaVal={prev ? delta(cur.activeDoctors, prev.activeDoctors) : null}
                />
                <PremiumStatCard
                  kicker="SPECIALTIES"
                  label="Clinical Departments"
                  value={`${formatNum(cur.activeDepartments)} Specialty Units`}
                  subtext="Multi-facility department network"
                  icon={Building2}
                  tone="rose"
                  deltaVal={prev ? delta(cur.activeDepartments, prev.activeDepartments) : null}
                />
              </div>
            </div>
          </div>

          {/* 4. Modern Segmented Tab Navigation with Live Badges */}
          <div className="pt-2">
            <div
              role="tablist"
              aria-label="Overview Analytics Modules"
              className="flex items-center gap-2 overflow-x-auto pb-2 no-print scrollbar-none"
              onKeyDown={(e) => {
                if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                const tabIds = TABS.map((t) => t.id);
                const next = tabIds[(tabIds.indexOf(tab) + (e.key === "ArrowRight" ? 1 : tabIds.length - 1)) % tabIds.length];
                setTab(next);
                e.currentTarget.querySelector(`[data-tab="${next}"]`)?.focus();
              }}
            >
              {TABS.map((tItem) => {
                const Icon = tItem.icon;
                const isActive = tab === tItem.id;
                const color = tItem.color;

                let badgeText = "";
                if (tItem.id === "Revenue") badgeText = formatMoney(t.net);
                else if (tItem.id === "Payments") badgeText = `${t.rate}%`;
                else if (tItem.id === "Patients") badgeText = `${formatNum(pt.visits)}`;
                else if (tItem.id === "Doctors") badgeText = `${cur.activeDoctors}`;
                else if (tItem.id === "Departments") badgeText = `${cur.activeDepartments}`;
                else if (tItem.id === "Labs") badgeText = `${lab.completed}`;
                else if (tItem.id === "Pharmacy") badgeText = formatMoney(rx.net);

                return (
                  <button
                    key={tItem.id}
                    role="tab"
                    data-tab={tItem.id}
                    aria-selected={isActive}
                    aria-controls="ov-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setTab(tItem.id)}
                    style={
                      isActive
                        ? {
                            background: tItem.activeBg,
                            boxShadow: `0 6px 20px ${color}45`
                          }
                        : undefined
                    }
                    className={`group px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 border ${
                      isActive
                        ? "text-white border-transparent"
                        : "bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : ""
                      }`}
                      style={!isActive ? { color } : undefined}
                    />
                    <span>{tItem.label}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      }`}
                    >
                      {badgeText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. Tab Content Panel */}
          <div id="ov-panel" role="tabpanel" aria-label={`${tab} report`} tabIndex={-1} className="space-y-6 outline-none">
            {/* TAB 1: REVENUE */}
            {tab === "Revenue" && (
              <Section
                accent={accent}
                title="Hospital Revenue Performance & Financial Breakdown"
                subtitle="Reconciliation of gross billing, concessions, refunds, and departmental streams"
              >
                {/* Revenue Streams & Reconciliation Pipeline */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Stream Breakdown */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-blue-600" />
                      Revenue by Billing Stream (Net)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { label: "Registration", val: byTypeMap.REGISTRATION, color: TYPE_COLORS.REGISTRATION },
                        { label: "Consultation", val: byTypeMap.CONSULTATION, color: TYPE_COLORS.CONSULTATION },
                        { label: "Procedures (Treatment)", val: byTypeMap.TREATMENT, color: TYPE_COLORS.TREATMENT },
                        { label: "Hospital Services", val: byTypeMap.SERVICE, color: TYPE_COLORS.SERVICE },
                        { label: "IPD Admissions", val: byTypeMap.IPD, color: TYPE_COLORS.IPD },
                        { label: "Health Packages", val: byTypeMap.PACKAGE, color: TYPE_COLORS.PACKAGE }
                      ].map((s) => (
                        <div key={s.label} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors">
                          <div className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                            {s.label}
                          </div>
                          <div className="font-data text-base font-extrabold text-slate-900 mt-1">
                            {formatMoney(s.val || 0)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Settlement Pipeline */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Billing Reconciliation Pipeline
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-slate-50">
                        <span className="font-medium text-slate-600">Gross Billed Total</span>
                        <span className="font-data font-bold text-slate-900">{formatMoney(t.gross)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-amber-50/70 border border-amber-100">
                        <span className="font-medium text-amber-800">Less: Concessions & Discounts</span>
                        <span className="font-data font-bold text-amber-700">− {formatMoney(t.discount)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-rose-50/70 border border-rose-100">
                        <span className="font-medium text-rose-800">Less: Refunds & Cancellations</span>
                        <span className="font-data font-bold text-rose-700">− {formatMoney(t.refund)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                        <span className="font-bold text-blue-900">Final Net Revenue</span>
                        <span className="font-data font-black text-blue-700 text-sm">{formatMoney(t.net)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Visualizations */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Revenue Distribution by Invoice Type">
                    <Donut
                      money
                      centerLabel="Net Revenue"
                      data={cur.byType.map((x) => ({
                        name: x.label,
                        value: x.value,
                        color: TYPE_COLORS[x.id]
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Hospital Revenue Trajectory" subtitle="Gross billed vs net revenue" action={ViewToggle}>
                    <Lines
                      money
                      data={revTrend}
                      lines={[
                        { key: "billed", name: "Gross Billed", color: COLORS.blue },
                        { key: "net", name: "Net Revenue", color: COLORS.teal, dashed: true }
                      ]}
                    />
                  </Card>

                  <Card
                    accent={accent}
                    title="Department Revenue Ranking"
                    subtitle="Click any department bar to filter and drill down"
                  >
                    <HBars
                      money
                      data={deptSorted.map((d) => ({ name: d.name, value: d.net, color: COLORS.blue }))}
                      onSelect={onSelectDepartment}
                    />
                  </Card>

                  <Card
                    accent={accent}
                    title="Service Revenue Matrix by Department"
                    subtitle="Consultations, procedures, labs and pharmacy breakdown"
                  >
                    <BarSeries stacked money data={deptSorted.map((d) => ({ ...d }))} series={SERVICE_SERIES} />
                  </Card>

                  <div className="xl:col-span-2">
                    <TopSellers encounters={scoped} accent={accent} />
                  </div>
                </div>
              </Section>
            )}

            {/* TAB 2: PAYMENTS */}
            {tab === "Payments" && (
              <Section
                accent={accent}
                title="Collections, Payment Modes & Settlement Status"
                subtitle="Audit of cash, UPI, cards, insurer disbursements, and outstanding patient balances"
              >
                <Strip
                  accent={accent}
                  items={[
                    { label: "Total Collections", value: formatMoney(t.collected), tone: "text-teal-700" },
                    ...cur.payModes.map((m) => ({ label: `${m.label}`, value: formatMoney(m.value) })),
                    { label: "Outstanding Balance", value: formatMoney(t.outstanding), tone: "text-amber-700" },
                    { label: "Collection Rate", value: `${t.rate}%` },
                    { label: "Fully Paid Invoices", value: formatNum(cur.status.Paid), tone: "text-teal-700" },
                    { label: "Partially Paid", value: formatNum(cur.status.Partial), tone: "text-amber-700" },
                    { label: "Unpaid / Pending", value: formatNum(cur.status.Unpaid), tone: "text-rose-600" },
                    {
                      label: "Refunded Receipts",
                      value: `${formatNum(cur.refunded.count)} · ${formatMoney(cur.refunded.amount)}`,
                      tone: "text-rose-600"
                    }
                  ]}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Collections by Payment Channel">
                    <Donut
                      money
                      centerLabel="Collected"
                      data={cur.payModes.map((m) => ({
                        name: m.label,
                        value: m.value,
                        color: PAY_COLORS[m.id]
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Invoice Settlement Status">
                    <Donut
                      centerLabel="Invoices"
                      data={[
                        { name: "Paid", value: cur.status.Paid, color: COLORS.teal },
                        { name: "Partially Paid", value: cur.status.Partial, color: COLORS.amber },
                        { name: "Unpaid", value: cur.status.Unpaid, color: COLORS.rose }
                      ]}
                    />
                  </Card>

                  <Card accent={accent} title="Collections vs Outstanding Balance" action={ViewToggle}>
                    <BarSeries
                      stacked
                      money
                      data={trend.map((r) => ({ ...r, name: r.label }))}
                      series={[
                        { key: "collected", name: "Collected", color: COLORS.teal },
                        { key: "outstanding", name: "Outstanding", color: COLORS.amber }
                      ]}
                    />
                  </Card>

                  <Card accent={accent} title="Daily Collections Velocity" action={ViewToggle}>
                    <Lines money data={trend} lines={[{ key: "collected", name: "Collections", color: COLORS.teal }]} />
                  </Card>
                </div>
              </Section>
            )}

            {/* TAB 3: PATIENTS */}
            {tab === "Patients" && (
              <Section
                accent={accent}
                title="Patient Demographics & Encounter Analytics"
                subtitle="Cohort analysis derived from completed clinical encounters and verified patient identifiers"
              >
                <Strip
                  accent={accent}
                  items={[
                    { label: "Total Completed Visits", value: formatNum(pt.visits) },
                    { label: "Unique Patients", value: formatNum(pt.unique) },
                    { label: "New Patients (First visit)", value: formatNum(pt.newP) },
                    { label: "Returning Patients", value: formatNum(pt.returning) },
                    { label: "Avg Encounters / Day", value: pt.perDay }
                  ]}
                  cols="grid-cols-2 md:grid-cols-5"
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Patient Visit Trend" action={ViewToggle}>
                    <Lines data={trend} lines={[{ key: "visits", name: "Visits", color: COLORS.blue }]} />
                  </Card>

                  <Card accent={accent} title="New vs Returning Patient Cohort">
                    <Donut
                      centerLabel="Visits"
                      data={[
                        { name: "New Patients", value: pt.newP, color: COLORS.blue },
                        { name: "Returning Patients", value: pt.returning, color: COLORS.teal }
                      ]}
                    />
                  </Card>

                  <Card accent={accent} title="Patient Age Demographics">
                    <Columns data={pt.ageBins} color={COLORS.indigo} />
                  </Card>

                  <Card accent={accent} title="Gender Distribution">
                    <Donut
                      centerLabel="Visits"
                      data={pt.gender.map((g) => ({
                        ...g,
                        color: g.name === "Female" ? COLORS.indigo : COLORS.sky
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Patient Visits by Department" subtitle="Click bar to view department">
                    <HBars
                      data={[...cur.departments]
                        .sort((a, b) => b.visits - a.visits)
                        .map((d) => ({ name: d.name, value: d.visits, color: COLORS.blue }))}
                      onSelect={onSelectDepartment}
                    />
                  </Card>

                  <Card accent={accent} title="Patient Visits by Hospital Facility">
                    <HBars data={cur.facilityVisits.map((f) => ({ ...f, color: COLORS.teal }))} />
                  </Card>

                  <Card
                    accent={accent}
                    title="Patient Encounter Frequency"
                    subtitle="Distribution of single-visit vs multi-visit patient retention"
                    className="xl:col-span-2"
                  >
                    <Columns data={pt.frequency} color={COLORS.teal} height={200} />
                  </Card>
                </div>
              </Section>
            )}

            {/* TAB 4: DOCTORS */}
            {tab === "Doctors" && (
              <Section
                accent={accent}
                title="Physician Clinical Governance & Revenue Attribution"
                subtitle="Doctor-attributed services, consultations, packages, and clinical productivity metrics"
              >
                <Strip
                  accent={accent}
                  items={[
                    { label: "Active Doctors", value: formatNum(cur.activeDoctors) },
                    { label: "Completed Consultations", value: formatNum(sumOf(cur.doctors, "visits")) },
                    { label: "Unique Patients", value: formatNum(pt.unique) },
                    { label: "New Patients", value: formatNum(sumOf(cur.doctors, "newP")) },
                    { label: "Returning Patients", value: formatNum(sumOf(cur.doctors, "returning")) },
                    { label: "Completed Follow-ups", value: formatNum(sumOf(cur.doctors, "followups")) },
                    { label: "Prescriptions Written", value: formatNum(sumOf(cur.doctors, "prescriptions")) },
                    { label: "Lab Orders Placed", value: formatNum(sumOf(cur.doctors, "labOrders")) },
                    { label: "Procedures Completed", value: formatNum(sumOf(cur.doctors, "procedures")) },
                    { label: "Referrals Made", value: formatNum(sumOf(cur.doctors, "referrals")) },
                    { label: "Admissions Initiated", value: formatNum(sumOf(cur.doctors, "admissions")) },
                    { label: "Doctor Revenue", value: formatMoney(sumOf(cur.doctors, "revenue")), tone: "text-blue-700" },
                    { label: "Doctor Collections", value: formatMoney(sumOf(cur.doctors, "collections")), tone: "text-teal-700" }
                  ]}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Top Doctors by Patient Visits" subtitle="Click any bar to open doctor drawer">
                    <HBars
                      data={[...cur.doctors]
                        .sort((a, b) => b.visits - a.visits)
                        .map((d) => ({ name: d.short, value: d.visits, color: COLORS.blue }))}
                      onSelect={(n) => onSelectDoctor(docByName(n))}
                    />
                  </Card>

                  <Card accent={accent} title="Top Doctors by Revenue Generation" subtitle="Click any bar to open doctor drawer">
                    <HBars
                      money
                      data={docSorted.map((d) => ({ name: d.short, value: d.revenue, color: COLORS.teal }))}
                      onSelect={(n) => onSelectDoctor(docByName(n))}
                    />
                  </Card>

                  <Card accent={accent} title="Doctor-wise Collections Realized">
                    <Columns money data={docSorted.map((d) => ({ name: d.short, value: d.collections }))} color={COLORS.indigo} />
                  </Card>

                  <Card accent={accent} title="Doctor Clinical Workload Matrix">
                    <BarSeries
                      data={cur.doctors.map((d) => ({ ...d, name: d.short }))}
                      series={[
                        { key: "prescriptions", name: "Prescriptions", color: COLORS.blue },
                        { key: "labOrders", name: "Lab Orders", color: COLORS.teal },
                        { key: "procedures", name: "Procedures", color: COLORS.indigo },
                        { key: "referrals", name: "Referrals", color: COLORS.amber }
                      ]}
                    />
                  </Card>

                  <Card accent={accent} title="Doctor Revenue Trajectory" action={ViewToggle} className="xl:col-span-2">
                    <Lines
                      money
                      data={doctorTrend}
                      lines={cur.doctors.map((d, i) => ({
                        key: d.short,
                        name: d.short,
                        color: LINE_PALETTE[i % LINE_PALETTE.length]
                      }))}
                    />
                  </Card>

                  {/* Top Doctors Master Scorecard Table */}
                  <Card
                    accent={accent}
                    title="Physician Performance Leaderboard"
                    subtitle="Click any row to open the complete doctor clinical & financial dossier"
                    action={<ViewAll label="View all doctors" onClick={() => onNavigateSection("doctors")} />}
                    className="xl:col-span-2"
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-3">Physician</th>
                            <th className="py-3 px-3">Department</th>
                            <th className="py-3 px-3 text-right">Encounters</th>
                            <th className="py-3 px-3 text-right">Revenue</th>
                            <th className="py-3 px-3 text-right">Collections</th>
                            <th className="py-3 px-3 text-right">Collection Rate</th>
                            <th className="py-3 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {docSorted.slice(0, 5).map((d) => {
                            const rate = d.revenue > 0 ? Math.round((d.collections / d.revenue) * 100) : 0;
                            const maxRev = docSorted[0]?.revenue || 1;
                            const revPct = Math.round((d.revenue / maxRev) * 100);

                            return (
                              <tr
                                key={d.name}
                                onClick={() => onSelectDoctor(d.name)}
                                className="group hover:bg-blue-50/50 cursor-pointer transition-colors"
                              >
                                <td className="py-3 px-3 font-semibold text-slate-900">
                                  <div className="flex items-center gap-2.5">
                                    <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                                      {d.name.replace("Dr. ", "").split(" ").map((w) => w[0]).join("").slice(0, 2)}
                                    </span>
                                    <span>{d.name}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                                    {d.dept}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right font-data text-slate-700 font-bold">
                                  {formatNum(d.visits)}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <div className="font-data font-bold text-slate-900">{formatMoney(d.revenue)}</div>
                                  <div className="w-16 bg-slate-100 h-1 rounded-full ml-auto mt-1 overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${revPct}%` }} />
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-data font-semibold text-emerald-700">
                                  {formatMoney(d.collections)}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                      rate >= 85
                                        ? "bg-emerald-100 text-emerald-800"
                                        : rate >= 65
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {rate}%
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-800">
                                    View <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </Section>
            )}

            {/* TAB 5: DEPARTMENTS */}
            {tab === "Departments" && (
              <Section
                accent={accent}
                title="Specialty Department Operations & Clinical Volumes"
                subtitle="Clinical encounter volume, revenue attribution, and procedural workload by medical specialty"
              >
                <Strip
                  accent={accent}
                  items={[
                    { label: "Active Departments", value: formatNum(cur.activeDepartments) },
                    { label: "Patient Encounters", value: formatNum(sumOf(cur.departments, "visits")) },
                    { label: "Unique Patients", value: formatNum(pt.unique) },
                    { label: "Department Net Revenue", value: formatMoney(sumOf(cur.departments, "net")), tone: "text-blue-700" },
                    { label: "Collections", value: formatMoney(sumOf(cur.departments, "collected")), tone: "text-teal-700" },
                    { label: "Outstanding", value: formatMoney(sumOf(cur.departments, "outstanding")), tone: "text-amber-700" },
                    { label: "Active Doctors", value: formatNum(cur.activeDoctors) },
                    { label: "Completed Follow-ups", value: formatNum(sumOf(cur.departments, "followups")) },
                    { label: "Lab Orders", value: formatNum(sumOf(cur.departments, "labOrders")) },
                    { label: "Completed Procedures", value: formatNum(sumOf(cur.departments, "procedures")) },
                    { label: "Admissions Initiated", value: formatNum(sumOf(cur.departments, "admissions")) }
                  ]}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Department Patient Visits" subtitle="Click bar to drill down">
                    <HBars
                      data={[...cur.departments]
                        .sort((a, b) => b.visits - a.visits)
                        .map((d) => ({ name: d.name, value: d.visits, color: COLORS.blue }))}
                      onSelect={onSelectDepartment}
                    />
                  </Card>

                  <Card accent={accent} title="Department Net Revenue" subtitle="Click bar to drill down">
                    <HBars
                      money
                      data={deptSorted.map((d) => ({ name: d.name, value: d.net, color: COLORS.teal }))}
                      onSelect={onSelectDepartment}
                    />
                  </Card>

                  <Card accent={accent} title="Department Revenue Contribution">
                    <Donut
                      money
                      centerLabel="Revenue"
                      data={deptSorted.map((d, i) => ({
                        name: d.name,
                        value: d.net,
                        color: LINE_PALETTE[i % LINE_PALETTE.length]
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Department Clinical Workload Matrix">
                    <BarSeries
                      data={cur.departments}
                      series={[
                        { key: "followups", name: "Follow-ups", color: COLORS.blue },
                        { key: "labOrders", name: "Lab Orders", color: COLORS.teal },
                        { key: "procedures", name: "Procedures", color: COLORS.indigo },
                        { key: "admissions", name: "Admissions", color: COLORS.amber }
                      ]}
                    />
                  </Card>

                  <Card accent={accent} title="Collections vs Outstanding by Department" className="xl:col-span-2">
                    <BarSeries
                      stacked
                      money
                      data={deptSorted}
                      series={[
                        { key: "collected", name: "Collected", color: COLORS.teal },
                        { key: "outstanding", name: "Outstanding", color: COLORS.amber }
                      ]}
                    />
                  </Card>

                  {/* Top Departments Cards */}
                  <Card
                    accent={accent}
                    title="Department Breakdown & One-Click Drill Down"
                    action={<ViewAll label="View all departments" onClick={() => onNavigateSection("departments")} />}
                    className="xl:col-span-2"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {deptSorted.map((d) => {
                        const maxDeptRev = deptSorted[0]?.net || 1;
                        const pctShare = Math.round((d.net / (t.net || 1)) * 100);

                        return (
                          <div
                            key={d.name}
                            onClick={() => onSelectDepartment(d.name)}
                            className="group p-4 rounded-2xl border border-slate-200/90 hover:border-blue-500 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                {d.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                {pctShare}% share
                              </span>
                            </div>
                            <div className="font-data text-lg font-black text-slate-900 mb-1">
                              {formatMoney(d.net)}
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-2.5">
                              <div
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                                style={{ width: `${(d.net / maxDeptRev) * 100}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                              <span>{formatNum(d.visits)} visits</span>
                              <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                                Drill down <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </Section>
            )}

            {/* TAB 6: LABS */}
            {tab === "Labs" && (
              <Section
                accent={accent}
                title="Laboratory Operations & Diagnostic Investigation Analytics"
                subtitle="Diagnostic test volume, status fulfillment, and departmental laboratory revenue"
              >
                <Strip
                  accent={accent}
                  items={[
                    { label: "Lab Requisitions", value: formatNum(lab.requisitions) },
                    { label: "Individual Tests Ordered", value: formatNum(lab.tests) },
                    { label: "Completed Tests", value: formatNum(lab.completed), tone: "text-teal-700" },
                    { label: "Pending Tests", value: formatNum(lab.pending), tone: "text-amber-700" },
                    { label: "Cancelled Tests", value: formatNum(lab.cancelled), tone: "text-rose-600" },
                    { label: "Lab Gross Revenue", value: formatMoney(lab.revenue) },
                    { label: "Lab Collections", value: formatMoney(lab.collections), tone: "text-teal-700" },
                    { label: "Lab Refunds", value: formatMoney(lab.refunds), tone: "text-rose-600" },
                    { label: "Net Lab Revenue", value: formatMoney(lab.net), tone: "text-blue-700" },
                    { label: "Average Turnaround", value: `${lab.avgTurnaround} min` },
                    { label: "Diagnostic Completion Rate", value: `${lab.completionRate}%` }
                  ]}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Diagnostic Tests by Fulfillment Status">
                    <Donut
                      centerLabel="Tests"
                      data={[
                        { name: "Completed", value: lab.completed, color: COLORS.teal },
                        { name: "Pending", value: lab.pending, color: COLORS.amber },
                        { name: "Cancelled", value: lab.cancelled, color: COLORS.rose }
                      ]}
                    />
                  </Card>

                  <Card accent={accent} title="Laboratory Revenue Trend" action={ViewToggle}>
                    <Lines money data={trend} lines={[{ key: "lab", name: "Lab Revenue", color: COLORS.indigo }]} />
                  </Card>

                  <Card accent={accent} title="Lab Workload by Diagnostic Discipline">
                    <HBars data={lab.byDiscipline.map((d) => ({ ...d, color: COLORS.blue }))} />
                  </Card>

                  <Card accent={accent} title="Revenue by Order Origin">
                    <Donut
                      money
                      centerLabel="Net Lab"
                      data={lab.bySource.map((s, i) => ({
                        ...s,
                        color: [COLORS.blue, COLORS.teal, COLORS.amber][i % 3]
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Average Turnaround Time (TAT) by Investigation" subtitle="Minutes from order to result" className="xl:col-span-2">
                    <HBars data={lab.turnaround.map((d) => ({ ...d, color: COLORS.sky }))} />
                  </Card>
                </div>

                <div className="flex justify-end pt-2">
                  <ViewAll label="Open Full Diagnostic Suite & Test Explorer" onClick={() => onNavigateSection("labs")} />
                </div>
              </Section>
            )}

            {/* TAB 7: PHARMACY */}
            {tab === "Pharmacy" && (
              <Section
                accent={accent}
                title="Pharmacy Operations & Pharmaceutical Profitability"
                subtitle="Prescription dispensing fulfillment, sales channels, cost of goods, and therapeutic profit margins"
              >
                <Strip
                  accent={accent}
                  items={[
                    { label: "Total Prescriptions", value: formatNum(rx.prescriptions) },
                    { label: "Fully Dispensed", value: formatNum(rx.full), tone: "text-teal-700" },
                    { label: "Partially Dispensed", value: formatNum(rx.partial), tone: "text-amber-700" },
                    { label: "Returned Prescriptions", value: formatNum(rx.returned), tone: "text-rose-600" },
                    { label: "Gross Sales", value: formatMoney(rx.gross) },
                    { label: "Discounts Given", value: formatMoney(rx.discount), tone: "text-amber-700" },
                    { label: "GST Collected", value: formatMoney(rx.gst) },
                    { label: "Net Pharmacy Sales", value: formatMoney(rx.net), tone: "text-blue-700" },
                    { label: "Sales Returns", value: formatMoney(rx.returns), tone: "text-rose-600" },
                    { label: "Cost of Goods Sold (COGS)", value: formatMoney(rx.cogs) },
                    { label: "Gross Pharmacy Profit", value: formatMoney(rx.grossProfit), tone: "text-teal-700" },
                    { label: "Gross Profit Margin", value: `${rx.margin}%` }
                  ]}
                />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <Card accent={accent} title="Pharmacy Net Sales Trajectory" action={ViewToggle}>
                    <Lines money data={trend} lines={[{ key: "pharmacy", name: "Net Sales", color: COLORS.amber }]} />
                  </Card>

                  <Card accent={accent} title="Sales by Dispensing Channel">
                    <Donut
                      money
                      centerLabel="Net Sales"
                      data={rx.byChannel.map((c, i) => ({
                        ...c,
                        color: [COLORS.blue, COLORS.teal, COLORS.indigo][i % 3]
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Prescription Dispensing Status">
                    <Donut
                      centerLabel="Prescriptions"
                      data={rx.byStatus.map((s, i) => ({
                        ...s,
                        color: [COLORS.teal, COLORS.amber, COLORS.rose][i]
                      }))}
                    />
                  </Card>

                  <Card accent={accent} title="Revenue by Therapeutic Category">
                    <HBars money data={rx.byCategory.map((c) => ({ name: c.name, value: c.revenue, color: COLORS.amber }))} />
                  </Card>

                  <Card
                    accent={accent}
                    title="Gross Profit & Margin by Therapeutic Category"
                    subtitle="Gross margin percentage compared against total category profit"
                    className="xl:col-span-2"
                  >
                    <BarAndLine
                      data={rx.byCategory}
                      barKey="profit"
                      barName="Gross Profit"
                      lineKey="margin"
                      lineName="Margin %"
                      barColor={COLORS.teal}
                      lineColor={COLORS.indigo}
                    />
                  </Card>
                </div>

                <div className="flex justify-end pt-2">
                  <ViewAll label="Open Full Pharmacy Inventory & Medicine Explorer" onClick={() => onNavigateSection("pharmacy")} />
                </div>
              </Section>
            )}
          </div>

          {/* 6. Executive Collections Intelligence & Insights */}
          <div className="pt-2">
            <CollectionInsights invoices={cur.invoices} accent={COLORS.teal} />
          </div>
        </>
      )}
    </div>
  );
}

const sumOf = (arr, key) => arr.reduce((s, x) => s + (x[key] || 0), 0);
