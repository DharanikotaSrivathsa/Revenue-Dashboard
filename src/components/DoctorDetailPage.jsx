"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  Receipt,
  Wallet,
  Clock,
  Users,
  UserCheck,
  CalendarCheck,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Building2,
  DoorOpen,
  Layers,
  Stethoscope,
  CreditCard,
  RotateCcw,
  Search
} from "lucide-react";
import { DOCTORS, FACILITIES, DEPARTMENTS, formatMoney, formatNum } from "../data/mockData";
import { PAY_MODES, summarise, revenueTrend, dailySeries, previousRange, invoiceRows } from "../data/doctorAnalytics";
import { Section, Card, Stat, MiniStat, Donut, Columns, HBars, Lines, Progress, COLORS } from "./doctor/ChartKit";
import { Waterfall, FunnelView, StackedMoney } from "./doctor/SpecialCharts";
import { DoccureDropdown, DoccureDatePicker } from "./common";

const PAY_COLORS = { Cash: COLORS.teal, Card: COLORS.blue, UPI: COLORS.indigo, Insurance: COLORS.sky, "Bank transfer": COLORS.amber };
const STATUS_STYLE = {
  Paid: "bg-teal-50 text-teal-700 border-teal-200",
  Partial: "bg-amber-50 text-amber-700 border-amber-200",
  Unpaid: "bg-rose-50 text-rose-700 border-rose-200"
};

const applyFilters = (list, f) =>
  list.filter(
    (e) =>
      (!f.from || e.date >= f.from) &&
      (!f.to || e.date <= f.to) &&
      (f.facility === "All" || e.facility === f.facility) &&
      (f.dept === "All" || e.department === f.dept) &&
      (f.payMode === "All" || e.payMode === f.payMode)
  );

const delta = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null);
const initials = (name) => name.replace("Dr. ", "").split(" ").map((p) => p[0]).join("").slice(0, 2);

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-40 rounded-2xl bg-slate-100" />
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}
      </div>
      <div className="h-72 rounded-2xl bg-slate-100" />
    </div>
  );
}

export default function DoctorDetailPage({ doctorName, encounters = [], defaultFrom = "", defaultTo = "", onClose }) {
  const doctor = DOCTORS.find((d) => d.name === doctorName);

  const initialFilters = { from: defaultFrom, to: defaultTo, facility: "All", dept: "All", payMode: "All" };
  // `draft` is what the controls show; `filters` is what the page uses once Apply is pressed.
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [trendView, setTrendView] = useState("daily");
  const [showAllInvoices, setShowAllInvoices] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [doctorName, attempt]);

  const setFilter = (key) => (value) => setDraft((f) => ({ ...f, [key]: value }));
  const isDirty = JSON.stringify(draft) !== JSON.stringify(filters);
  const badRange = draft.from && draft.to && draft.from > draft.to;
  const applyDraft = () => { if (!badRange) setFilters(draft); };
  const resetFilters = () => { setDraft(initialFilters); setFilters(initialFilters); };

  const result = useMemo(() => {
    try {
      const mine = encounters.filter((e) => e.doctorName === doctorName);
      const current = summarise(applyFilters(mine, filters));
      const range = previousRange(filters.from, filters.to);
      const previous = range ? summarise(applyFilters(mine, { ...filters, ...range })) : null;
      const scoped = applyFilters(mine, filters);
      return { current, previous, scoped, invoices: invoiceRows(current.rows) };
    } catch (error) {
      return { error };
    }
  }, [encounters, doctorName, filters, attempt]);

  if (!doctor) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
        <p className="text-sm text-slate-600">We could not find this doctor.</p>
        <button onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer">Back to Doctor Performance</button>
      </div>
    );
  }

  if (loading) return <Skeleton />;

  if (result.error) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-10 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-800">Something went wrong while preparing this report.</p>
        <p className="text-xs text-slate-500">{String(result.error.message || result.error)}</p>
        <button onClick={() => setAttempt((a) => a + 1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
          <RefreshCw className="w-3.5 h-3.5" /> Try again
        </button>
      </div>
    );
  }

  const { current: c, previous: p, scoped, invoices } = result;
  const { revenue: r, nonRev, clinical, ops } = c;
  const isEmpty = scoped.length === 0;

  const trend = revenueTrend(c.billedRows, trendView, filters.from, filters.to);
  const dayLine = (fields) => dailySeries(scoped, filters.from, filters.to, fields);

  const newVsReturning = [
    { name: "New", value: nonRev.newPatients, color: COLORS.blue },
    { name: "Returning", value: nonRev.returningPatients, color: COLORS.teal }
  ];
  const genderData = c.gender.map((g) => ({ ...g, color: g.name === "Female" ? COLORS.indigo : COLORS.sky }));
  const followUpData = [
    { name: "Completed", value: clinical.followup.completed, color: COLORS.teal },
    { name: "Pending", value: clinical.followup.pending, color: COLORS.sky },
    { name: "Cancelled", value: clinical.followup.cancelled, color: COLORS.amber },
    { name: "Missed", value: clinical.followup.missed, color: COLORS.rose }
  ];

  const downloadCSV = () => {
    if (!invoices.length) return alert("No invoices to export for the selected filters.");
    const head = ["Invoice", "Date", "Patient", "Type", "Billed", "Discount", "Refund", "Collected", "Outstanding", "Payment Mode", "Status"];
    const lines = invoices.map((i) => [i.id, i.date, i.patient, i.type, i.billed, i.discount, i.refund, i.collected, i.outstanding, i.payMode, i.status]);
    const csv = [head, ...lines].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doctor.name.replace(/\W+/g, "_")}_invoices_${filters.from}_${filters.to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shownInvoices = showAllInvoices ? invoices : invoices.slice(0, 8);

  return (
    <div className="ov-root w-full min-w-0 space-y-8 text-slate-800">
      {/* 1. Profile header and filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] relative z-20">
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 no-print">
            <button onClick={onClose} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Doctor Performance
            </button>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                DEMO DATA – NOT CONNECTED TO HMS
              </span>
              <button onClick={downloadCSV} className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 cursor-pointer">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
              <button onClick={() => window.print()} className="h-8 px-3 rounded-lg bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer">
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-700 text-white flex items-center justify-center text-2xl font-black tracking-tight shadow-md flex-shrink-0">
              {initials(doctor.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{doctor.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> On duty
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{doctor.dept} Specialist · {doctor.experience} experience</p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs font-semibold text-slate-600">
                <span className="inline-flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-600" />{doctor.dept}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-blue-600" />{doctor.facility}</span>
                <span className="inline-flex items-center gap-1.5"><DoorOpen className="w-3.5 h-3.5 text-blue-600" />{doctor.opdRoom}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarCheck className="w-3.5 h-3.5 text-blue-600" />Reporting period: {filters.from || "start"} to {filters.to || "today"}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-4 space-y-4 no-print">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <DoccureDatePicker label="From date" value={draft.from} onChange={setFilter("from")} />
              <DoccureDatePicker label="To date" value={draft.to} onChange={setFilter("to")} />
              <DoccureDropdown label="Facility" icon={Building2} value={draft.facility} onChange={setFilter("facility")} options={[{ value: "All", label: `All facilities (${FACILITIES.length})` }, ...FACILITIES.map((f) => ({ value: f, label: f }))]} />
              <DoccureDropdown label="Department" icon={Layers} value={draft.dept} onChange={setFilter("dept")} options={[{ value: "All", label: `All departments (${DEPARTMENTS.length})` }, ...DEPARTMENTS.map((d) => ({ value: d.name, label: d.name }))]} />
              <DoccureDropdown label="Doctor" icon={Stethoscope} value={doctor.name} onChange={() => {}} disabled options={[{ value: doctor.name, label: doctor.name }]} />
              <DoccureDropdown label="Payment channel" icon={CreditCard} value={draft.payMode} onChange={setFilter("payMode")} options={[{ value: "All", label: "All channels" }, ...PAY_MODES.map((m) => ({ value: m.id, label: m.label }))]} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <span className={`text-xs font-semibold ${badRange ? "text-rose-600" : isDirty ? "text-amber-700" : "text-slate-400"}`}>
                {badRange ? "From date must be on or before To date." : isDirty ? "Filters changed. Press Apply to update the page." : `Showing ${formatNum(scoped.length)} records`}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={resetFilters} className="h-9 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition-colors cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button onClick={applyDraft} disabled={!isDirty || badRange} className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white inline-flex items-center gap-1.5 shadow-md shadow-blue-600/25 disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed cursor-pointer transition-all">
                  <Search className="w-3.5 h-3.5" /> Apply filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-14 text-center space-y-2">
          <p className="text-sm font-bold text-slate-800">No activity for {doctor.name} with these filters</p>
          <p className="text-xs text-slate-500">Try a wider date range or set Facility, Department and Payment channel back to All.</p>
        </div>
      ) : (
        <>
          {/* 2. KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
            <Stat label="Total billed revenue" value={formatMoney(r.billed)} note="Before discounts and refunds" icon={Receipt} tone="blue" delta={p ? delta(r.billed, p.revenue.billed) : null} />
            <Stat label="Total collections" value={formatMoney(r.collected)} note={`${r.collectionRate}% of net revenue`} icon={Wallet} tone="teal" delta={p ? delta(r.collected, p.revenue.collected) : null} />
            <Stat label="Outstanding amount" value={formatMoney(r.outstanding)} note="Yet to be received" icon={Clock} tone="amber" delta={p ? delta(r.outstanding, p.revenue.outstanding) : null} />
            <Stat label="Total patient visits" value={formatNum(nonRev.totalPatientVisits)} note="Completed consultations" icon={Users} tone="indigo" delta={p ? delta(nonRev.totalPatientVisits, p.nonRev.totalPatientVisits) : null} />
            <Stat label="Unique patients" value={formatNum(nonRev.uniquePatients)} note="Counted by patient ID" icon={UserCheck} tone="blue" delta={p ? delta(nonRev.uniquePatients, p.nonRev.uniquePatients) : null} />
            <Stat label="Completed follow-ups" value={formatNum(clinical.followup.completed)} note="Completed only" icon={CalendarCheck} tone="teal" delta={p ? delta(clinical.followup.completed, p.clinical.followup.completed) : null} />
          </div>

          {/* 3. Revenue performance */}
          <Section title="Revenue performance" subtitle="Billed, net and collected amounts are kept separate. Percent change compares with the previous period of the same length.">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
              <MiniStat label="Consultation revenue" value={formatMoney(r.consultation)} />
              <MiniStat label="Follow-up revenue" value={formatMoney(r.followup)} />
              <MiniStat label="Procedure revenue" value={formatMoney(r.treatment)} />
              <MiniStat label="Package revenue" value={formatMoney(r.package)} />
              <MiniStat label="IPD revenue" value={formatMoney(r.ipd)} tone="text-indigo-700" />
              <MiniStat label="Total billed" value={formatMoney(r.billed)} />
              <MiniStat label="Discounts" value={formatMoney(r.discount)} tone="text-amber-700" />
              <MiniStat label="Refunds" value={formatMoney(r.refund)} tone="text-rose-600" />
              <MiniStat label="Net revenue" value={formatMoney(r.net)} tone="text-blue-700" />
              <MiniStat label="Collections" value={formatMoney(r.collected)} tone="text-teal-700" />
              <MiniStat label="Outstanding" value={formatMoney(r.outstanding)} tone="text-amber-700" />
            </div>
            <p className="text-[11px] text-slate-400 -mt-1">
              Package and IPD revenue appear only for bills booked against this doctor (IPD = admissions this doctor initiated). Lab and pharmacy sales on ordinary bills belong to those departments and are not counted here.
            </p>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Revenue by service type" subtitle="Net revenue">
                <HBars
                  money
                  data={[
                    { name: "Consultation", value: r.consultation, color: COLORS.blue },
                    { name: "Follow-up", value: r.followup, color: COLORS.teal },
                    { name: "Procedure", value: r.treatment, color: COLORS.indigo },
                    { name: "Package", value: r.package, color: COLORS.sky },
                    { name: "IPD", value: r.ipd, color: COLORS.rose }
                  ]}
                />
              </Card>
              <Card
                title="Revenue trend"
                subtitle="Billed vs collected"
                action={
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold no-print">
                    {["daily", "weekly", "monthly"].map((v) => (
                      <button key={v} onClick={() => setTrendView(v)} className={`px-2.5 py-1 rounded-md capitalize cursor-pointer transition-all ${trendView === v ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}>{v}</button>
                    ))}
                  </div>
                }
              >
                <Lines money data={trend} lines={[{ key: "billed", name: "Billed", color: COLORS.blue }, { key: "collected", name: "Collected", color: COLORS.teal, dashed: true }]} />
              </Card>
              <Card title="Revenue reconciliation" subtitle="Billed → Discounts → Refunds → Net revenue">
                <Waterfall
                  steps={[
                    { name: "Billed", value: r.billed, kind: "total", color: COLORS.blue },
                    { name: "Discounts", value: r.discount, kind: "minus", color: COLORS.amber },
                    { name: "Refunds", value: r.refund, kind: "minus", color: COLORS.rose },
                    { name: "Net revenue", value: r.net, kind: "total", color: COLORS.teal }
                  ]}
                />
              </Card>
              <Card title="Collections vs outstanding" subtitle={`Per ${trendView === "daily" ? "day" : trendView === "weekly" ? "week" : "month"}`}>
                <StackedMoney data={trend.map((d) => ({ ...d, outstanding: Math.max(0, d.net - d.collected) }))} />
              </Card>
            </div>
          </Section>

          {/* 4. Payment performance */}
          <Section title="Payment performance" subtitle="Collections come from payments allocated to this doctor's share of each bill.">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {c.payModes.map((m) => (
                <MiniStat key={m.id} label={`${m.label} collections`} value={formatMoney(m.value)} />
              ))}
              <MiniStat label="Collection rate" value={`${r.collectionRate}%`} tone="text-teal-700" />
              <MiniStat label="Paid invoices" value={formatNum(c.status.Paid)} tone="text-teal-700" />
              <MiniStat label="Partially paid" value={formatNum(c.status.Partial)} tone="text-amber-700" />
              <MiniStat label="Unpaid invoices" value={formatNum(c.status.Unpaid)} tone="text-rose-600" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Collections by payment mode">
                <Donut money centerLabel="Collected" data={c.payModes.map((m) => ({ name: m.label, value: m.value, color: PAY_COLORS[m.id] }))} />
              </Card>
              <Card title="Invoice payment status">
                <Donut
                  centerLabel="Invoices"
                  data={[
                    { name: "Paid", value: c.status.Paid, color: COLORS.teal },
                    { name: "Partially paid", value: c.status.Partial, color: COLORS.amber },
                    { name: "Unpaid", value: c.status.Unpaid, color: COLORS.rose }
                  ]}
                />
              </Card>
            </div>
          </Section>

          {/* 5. Patient analytics */}
          <Section title="Patient analytics" subtitle="Counted from completed consultations.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MiniStat label="Total patient visits" value={formatNum(nonRev.totalPatientVisits)} />
              <MiniStat label="Unique patients" value={formatNum(nonRev.uniquePatients)} />
              <MiniStat label="New patients" value={formatNum(nonRev.newPatients)} />
              <MiniStat label="Returning patients" value={formatNum(nonRev.returningPatients)} />
              <MiniStat label="Average patients per day" value={nonRev.avgPatientsPerDay} />
              <MiniStat label="Patient retention rate" value={`${nonRev.patientRetentionRate}%`} />
              <MiniStat label="Repeat-visit rate" value={`${nonRev.repeatVisitRate}%`} />
              <MiniStat label="Same-doctor continuity" value={`${nonRev.sameDoctorContinuityRate}%`} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Patient visit trend" subtitle="Completed visits per day">
                <Lines data={dayLine({ visits: (e) => (e.consultStatus === "Completed" ? 1 : 0) })} lines={[{ key: "visits", name: "Visits", color: COLORS.blue }]} />
              </Card>
              <Card title="New vs returning patients">
                <Donut centerLabel="Visits" data={newVsReturning} />
              </Card>
              <Card title="Age distribution" subtitle="Visits by patient age group">
                <Columns data={c.ageBins} color={COLORS.indigo} />
              </Card>
              <Card title="Gender distribution">
                <Donut centerLabel="Visits" data={genderData} />
              </Card>
              <Card title="Patient visit frequency" subtitle="How many patients came once, twice or more" className="xl:col-span-2">
                <Columns data={c.frequency} color={COLORS.teal} height={200} />
              </Card>
            </div>
          </Section>

          {/* 6. Clinical workflow */}
          <Section title="Clinical workflow" subtitle="Completed procedures only. Imaging is not counted as a laboratory investigation.">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <MiniStat label="Prescriptions written" value={formatNum(clinical.prescriptions)} />
              <MiniStat label="Lab investigation orders" value={formatNum(clinical.labOrders)} />
              <MiniStat label="Individual lab tests" value={formatNum(clinical.labTests)} />
              <MiniStat label="Completed procedures" value={formatNum(clinical.procedures)} />
              <MiniStat label="Referrals made" value={formatNum(clinical.referrals)} />
              <MiniStat label="Completed follow-ups" value={formatNum(clinical.followup.completed)} tone="text-teal-700" />
              <MiniStat label="Pending follow-ups" value={formatNum(clinical.followup.pending)} />
              <MiniStat label="Cancelled follow-ups" value={formatNum(clinical.followup.cancelled)} tone="text-amber-700" />
              <MiniStat label="Missed follow-ups" value={formatNum(clinical.followup.missed)} tone="text-rose-600" />
              <MiniStat label="Admissions initiated" value={formatNum(clinical.admissions)} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="Clinical activity distribution">
                <HBars
                  data={[
                    { name: "Prescriptions", value: clinical.prescriptions, color: COLORS.blue },
                    { name: "Lab orders", value: clinical.labOrders, color: COLORS.teal },
                    { name: "Lab tests", value: clinical.labTests, color: COLORS.sky },
                    { name: "Procedures", value: clinical.procedures, color: COLORS.indigo },
                    { name: "Referrals", value: clinical.referrals, color: COLORS.amber },
                    { name: "Admissions", value: clinical.admissions, color: COLORS.rose }
                  ]}
                />
              </Card>
              <Card title="Follow-up status">
                <Donut centerLabel="Follow-ups" data={followUpData} />
              </Card>
              <Card title="Clinical activity trend" subtitle="Per day" className="xl:col-span-2">
                <Lines
                  data={dayLine({
                    prescriptions: (e) => (e.hasRx && e.rxOrderId ? 1 : 0),
                    labOrders: (e) => (e.hasLab && (e.labTests || []).some((t) => t.category !== "Radiology") ? 1 : 0),
                    procedures: (e) => e.procedureCompleted || 0
                  })}
                  lines={[
                    { key: "prescriptions", name: "Prescriptions", color: COLORS.blue },
                    { key: "labOrders", name: "Lab orders", color: COLORS.teal },
                    { key: "procedures", name: "Procedures", color: COLORS.indigo }
                  ]}
                />
              </Card>
            </div>
          </Section>

          {/* 7. Hospital operations and continuity */}
          <Section title="Hospital operations and continuity" subtitle="Retention and continuity are measured within the selected reporting period.">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              <MiniStat label="OPD-to-IPD conversion" value={`${nonRev.opdToIpdConversionRate}%`} />
              <MiniStat label="Admissions initiated" value={formatNum(ops.admissions)} />
              <MiniStat label="Linked OPD-to-IPD" value={formatNum(ops.linkedAdmissions)} />
              <MiniStat label="Patient retention" value={`${nonRev.patientRetentionRate}%`} />
              <MiniStat label="Repeat-visit rate" value={`${nonRev.repeatVisitRate}%`} />
              <MiniStat label="Same-doctor continuity" value={`${nonRev.sameDoctorContinuityRate}%`} />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              <Card title="OPD-to-IPD conversion" subtitle="From booked consultations to inpatient admissions">
                <FunnelView
                  data={[
                    { name: "Consultations booked", value: ops.consultsBooked, fill: COLORS.navy },
                    { name: "Consultations completed", value: ops.consultsCompleted, fill: COLORS.blue },
                    { name: "Admissions initiated", value: ops.admissions, fill: COLORS.teal },
                    { name: "Linked IPD admissions", value: ops.linkedAdmissions, fill: COLORS.sky }
                  ]}
                />
              </Card>
              <Card title="Admissions trend" subtitle="Per day">
                <Lines data={dayLine({ admissions: (e) => e.admissionsInitiated || 0 })} lines={[{ key: "admissions", name: "Admissions", color: COLORS.rose }]} />
              </Card>
              <Card title="Continuity metrics" className="xl:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Progress label="Patient retention" value={nonRev.patientRetentionRate} color={COLORS.blue} hint="Patients with 2 or more visits in this period" />
                  <Progress label="Repeat-visit rate" value={nonRev.repeatVisitRate} color={COLORS.teal} hint="Unique patients who came back at least once" />
                  <Progress label="Same-doctor continuity" value={nonRev.sameDoctorContinuityRate} color={COLORS.indigo} hint="Returning visits that went to the same doctor as last time" />
                </div>
              </Card>
            </div>
          </Section>

        </>
      )}
    </div>
  );
}
