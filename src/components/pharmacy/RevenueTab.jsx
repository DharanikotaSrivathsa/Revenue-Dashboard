"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { IndianRupee, Wallet, RotateCcw, Tag, Banknote, Hourglass, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { formatMoney } from "../../data/mockData";
import { KpiCard, Panel, PieBlock, NoData } from "./PharmUi";

const GRAINS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
];
const axisMoney = (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);
const tipStyle = { borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" };

export default function RevenueTab({ data }) {
  const [grain, setGrain] = useState("daily");
  const t = data.totals;
  const trend = data.trend[grain];

  const steps = [
    { label: "1. Gross Sales", amount: formatMoney(t.gross), note: "Σ total_amount", color: "text-slate-200" },
    { label: "2. (-) Discounts", amount: `- ${formatMoney(t.discounts)}`, note: "price list + cashier", color: "text-amber-300" },
    { label: "3. (-) Returns", amount: `- ${formatMoney(t.returns)}`, note: "sales_invoice_refund", color: "text-rose-300" },
    { label: "4. (=) Net Sales", amount: formatMoney(t.net), note: "GST-inclusive", color: "text-amber-300" },
    { label: "5. (-) GST Tax", amount: `- ${formatMoney(t.gst)}`, note: "12% CGST/SGST", color: "text-sky-300" },
    { label: "6. Net Excl. Tax", amount: formatMoney(t.netExTax), note: "Base top-line", color: "text-teal-300" },
    { label: "7. (-) COGS", amount: `- ${formatMoney(t.cogs)}`, note: "stock.purchase_price", color: "text-violet-300" },
    { label: "8. Gross Profit", amount: formatMoney(t.profit), note: `${t.margin.toFixed(0)}% margin`, color: "text-emerald-300", highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700">
          <div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider">Financial Report Service</span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-2">Pharmacy Revenue Reconciliation</h2>
            <p className="text-xs text-slate-300 max-w-2xl mt-1">
              Multi-channel pharmacy sales with returns, output GST and batch purchase cost (COGS) taken off to reach gross profit.
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-800 rounded-2xl p-3 px-4 self-start lg:self-auto">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Net Sales (GST-Incl)</span>
              <span className="text-2xl font-black text-amber-400">{formatMoney(t.net)}</span>
            </div>
            <div className="h-8 w-px bg-slate-600" />
            <div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Gross Margin</span>
              <span className="text-2xl font-black text-emerald-400">{t.margin.toFixed(0)}%</span>
            </div>
          </div>
        </div>
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {steps.map((s) => (
            <div key={s.label} className={`p-2.5 rounded-xl ${s.highlight ? "bg-emerald-900 border border-emerald-500" : "bg-slate-800"}`}>
              <span className={`text-[9px] font-bold uppercase block ${s.color}`}>{s.label}</span>
              <span className={`text-sm font-black mt-0.5 block ${s.color}`}>{s.amount}</span>
              <span className="text-[10px] text-slate-400">{s.note}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <KpiCard tone="amber" label="Gross Sales" value={formatMoney(t.gross)} sub="Before returns" icon={IndianRupee} />
        <KpiCard tone="emerald" label="Net Sales" value={formatMoney(t.net)} sub="After drug returns" icon={Wallet} />
        <KpiCard tone="rose" label="Total Drug Returns" value={formatMoney(t.returns)} sub={`${t.gross > 0 ? ((t.returns / t.gross) * 100).toFixed(1) : 0}% of gross`} icon={RotateCcw} />
        <KpiCard tone="violet" label="Total Discounts" value={formatMoney(t.discounts)} sub="Price list + cashier" icon={Tag} />
        <KpiCard tone="sky" label="Collected Revenue" value={formatMoney(t.collected)} sub="Payments received" icon={Banknote} />
        <KpiCard tone="indigo" label="Outstanding Amount" value={formatMoney(t.outstanding)} sub="Pending payment" icon={Hourglass} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Panel
          className="lg:col-span-7" accent="border-t-amber-500" icon={TrendingUp}
          title="Sales Trend" subtitle="Net pharmacy sales over time"
          action={
            <div className="inline-flex p-0.5 rounded-lg bg-gray-100 text-[11px] font-bold">
              {GRAINS.map((g) => (
                <button key={g.key} onClick={() => setGrain(g.key)} className={`px-2.5 py-1 rounded-md transition-colors ${grain === g.key ? "bg-amber-500 text-white" : "text-gray-500 hover:text-gray-800"}`}>
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
                <LineChart data={trend} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={axisMoney} />
                  <Tooltip formatter={(v) => [formatMoney(v), "Net sales"]} contentStyle={tipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={trend.length < 12 ? { r: 3, fill: "#f59e0b" } : false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel className="lg:col-span-5" accent="border-t-indigo-500" icon={PieIcon} title="Sales by Payment Mode" subtitle="Cash, Card, UPI, Insurance and transfers">
          <PieBlock data={data.payMode} format={formatMoney} />
        </Panel>
      </div>
    </div>
  );
}
