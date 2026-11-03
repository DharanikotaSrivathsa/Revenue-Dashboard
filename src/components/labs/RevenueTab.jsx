"use client";

import React, { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  IndianRupee, Wallet, Tag, RotateCcw, Banknote, Hourglass, TrendingUp, PieChart as PieIcon,
  Layers, ListOrdered, Receipt, UserCheck, Package, ShieldCheck, BedDouble, Stethoscope,
} from "lucide-react";
import { formatMoney } from "../../data/mockData";
import { KpiCard, Panel, SectionHeading, DonutBlock, NoData } from "./LabUi";
import TestExplorer from "./TestExplorer";

const GRAINS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];

const axisMoney = (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);
const tipStyle = { borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" };

export default function RevenueTab({ stats, data }) {
  const [grain, setGrain] = useState("daily");
  const { revenue } = data;
  const trend = data.trend[grain];

  return (
    <div className="space-y-6">
      {/* Waterfall reconciliation banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-bold uppercase tracking-wider">
                Production Billing Engine
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                lab_order_receipt Model
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">Laboratory Revenue Reconciliation</h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Revenue recognized on <strong>checkout receipts</strong>. Deducts pack and manual discounts, isolates bundled profile tariffs, and subtracts refunds.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 px-4 backdrop-blur-md self-start lg:self-auto">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Net Labs Revenue</span>
              <span className="text-2xl font-black text-teal-400">{formatMoney(stats.netLabsRevenue)}</span>
            </div>
            <div className="h-8 w-px bg-slate-700 mx-1" />
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Average Receipt</span>
              <span className="text-xl font-black">{formatMoney(stats.avgReceiptValue)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <WaterfallStep tone="text-slate-400" value="text-slate-200" label="1. Billed Catalog MRP" amount={formatMoney(stats.grossMRP)} note={`${stats.completed} settled receipts`} />
          <WaterfallStep tone="text-amber-400" value="text-amber-300" label="2. (-) Pack Discounts" amount={`- ${formatMoney(stats.packDiscount)}`} note="discount_configurations" />
          <WaterfallStep tone="text-amber-400" value="text-amber-300" label="3. (-) Cashier Additional" amount={`- ${formatMoney(stats.manualDiscount)}`} note="manual concessions" />
          <WaterfallStep tone="text-blue-400" value="text-blue-300" label="4. (=) Checkout Collected" amount={formatMoney(stats.collectedReceipts)} note="receipt.total_price event" />
          <WaterfallStep tone="text-rose-400" value="text-rose-300" label="5. (-) Order Refunds" amount={`- ${formatMoney(stats.refunds)}`} note="lab_order_refund" />
          <WaterfallStep highlight tone="text-teal-300" value="text-teal-300" label="6. (=) Net Labs Revenue" amount={formatMoney(stats.netLabsRevenue)} note="Ties to Hospital Billing" />
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KpiCard label="Gross Revenue" value={formatMoney(revenue.gross)} sub="Total invoice amount" icon={IndianRupee} tone="teal" />
        <KpiCard label="Net Revenue" value={formatMoney(revenue.net)} sub="After discounts & refunds" icon={Wallet} tone="emerald" />
        <KpiCard label="Total Discounts" value={formatMoney(revenue.discounts)} sub="Pack + manual concessions" icon={Tag} tone="amber" />
        <KpiCard label="Total Refunds" value={formatMoney(revenue.refunds)} sub="Settled receipt refunds" icon={RotateCcw} tone="rose" />
        <KpiCard label="Collected Revenue" value={formatMoney(revenue.collected)} sub="Payments received" icon={Banknote} tone="sky" />
        <KpiCard label="Outstanding Amount" value={formatMoney(revenue.outstanding)} sub="Pending payment" icon={Hourglass} tone="violet" />
      </div>

      {/* Trend + payment mode */}
      <SectionHeading eyebrow="Trends & Mix" title="Where the revenue comes from" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Panel
          className="lg:col-span-7"
          title="Revenue Trend"
          subtitle="Net lab revenue recognized on settled receipts"
          icon={TrendingUp}
          action={
            <div className="inline-flex p-0.5 rounded-lg bg-gray-100 text-[11px] font-bold">
              {GRAINS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGrain(g.key)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${grain === g.key ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-64">
            {trend.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="labTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={axisMoney} />
                  <Tooltip formatter={(v) => [formatMoney(v), "Net revenue"]} contentStyle={tipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2.5} fill="url(#labTrendFill)" dot={trend.length < 3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-5" title="Revenue by Payment Mode" subtitle="Cash, Card, UPI, Insurance & transfers" icon={PieIcon}>
          <DonutBlock data={data.payMode} format={formatMoney} centerLabel="Net revenue" />
        </Panel>
      </div>

      {/* Department + test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel title="Revenue by Department" subtitle="Hematology, Biochemistry, Endocrinology and more" icon={Layers}>
          <div className="h-64">
            {data.byDept.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byDept} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={axisMoney} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => [formatMoney(v), "Revenue"]} contentStyle={tipStyle} />
                  <Bar dataKey="value" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel title="Revenue by Test" subtitle="Search any test to see units sold and refunds" icon={ListOrdered}>
          <TestExplorer tests={data.byTest} />
        </Panel>
      </div>

      {/* Customer Streams & Attribution */}
      <SectionHeading eyebrow="Customer Streams" title="OPD, IPD & Walk-in Revenue Reconciliation" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SourceCard
          badge="Customer: OPD" badgeClass="bg-blue-50 text-blue-700 border-blue-200" icon={Stethoscope} iconClass="text-blue-600"
          title="OPD Consultations" text="Diagnostic requisitions ordered by physicians during outpatient clinic consultations."
          value={formatMoney(stats.opdRevenue)} valueClass="text-blue-700"
          left={`${stats.opdCompleted} Settled (${stats.opdCount} Orders)`} right="Clinical Attributed" rightClass="text-blue-700"
        />
        <SourceCard
          badge="Customer: IPD" badgeClass="bg-indigo-50 text-indigo-700 border-indigo-200" icon={BedDouble} iconClass="text-indigo-600"
          title="IPD Inpatient Requisitions" text="Bedside diagnostic investigations ordered for admitted inpatient ward/ICU patients."
          value={formatMoney(stats.ipdRevenue)} valueClass="text-indigo-700"
          left={`${stats.ipdCompleted} Settled (${stats.ipdCount} Orders)`} right="Inpatient Billed" rightClass="text-indigo-700"
        />
        <SourceCard
          badge="Customer: Walk-in" badgeClass="bg-teal-50 text-teal-700 border-teal-200" icon={Receipt} iconClass="text-teal-600"
          title="Walk-In Counter Bookings" text="Direct retail investigations registered and settled immediately at laboratory reception."
          value={formatMoney(stats.walkInRevenue)} valueClass="text-teal-700"
          left={`${stats.walkInCompleted} Settled (${stats.walkInCount} Receipts)`} right="Counter Realized" rightClass="text-teal-700"
        />
      </div>

      <Panel title="Order Catalog: Individual Tests · Profiles · Packages" subtitle="Attributed strictly by catalog structure — fully reconciles to Net Labs Revenue" icon={ShieldCheck}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Individual Tests</span>
                <span className="text-[11px] text-gray-500">Standalone lab investigations</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                {stats.singleTestsCompleted} / {stats.singleTestsCount} Settled
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-teal-100/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500">Net Revenue:</span>
              <span className="text-sm font-black text-teal-800">{formatMoney(stats.singleTestsRevenue)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Profile Bundles</span>
                <span className="text-[11px] text-gray-500">Multi-test panels (Thyroid, Lipid, etc.)</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                {stats.profilesCompleted} / {stats.profilesCount} Settled
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-purple-100/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500">Net Revenue:</span>
              <span className="text-sm font-black text-purple-800">{formatMoney(stats.profilesRevenue)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-gray-800 block">Doctor Portal Packages</span>
                <span className="text-[11px] text-gray-500">Health packages from Doctor Portal</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                {stats.packageCompleted} / {stats.packagePaidCount} Settled
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-indigo-100/60 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-gray-500">Net Revenue:</span>
              <span className="text-sm font-black text-indigo-800">{formatMoney(stats.packagePaidRevenue)}</span>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function WaterfallStep({ label, amount, note, tone, value, highlight }) {
  return (
    <div className={`p-2.5 rounded-xl border ${highlight ? "bg-teal-950/70 border-teal-500/40" : "bg-slate-950/60 border-slate-800"}`}>
      <span className={`text-[9px] font-bold uppercase block ${tone}`}>{label}</span>
      <span className={`text-sm font-black mt-0.5 block ${value}`}>{amount}</span>
      <span className={`text-[10px] ${highlight ? "text-teal-400 font-semibold" : "text-slate-500"}`}>{note}</span>
    </div>
  );
}

function SourceCard({ badge, badgeClass, icon: Icon, iconClass, title, text, value, valueClass, left, right, rightClass }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeClass}`}>{badge}</span>
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </div>
        <h4 className="text-sm font-extrabold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{text}</p>
        <div className={`text-2xl font-black mt-3 ${valueClass}`}>{value}</div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
        <span>{left}</span>
        <span className={`font-semibold ${rightClass}`}>{right}</span>
      </div>
    </div>
  );
}
