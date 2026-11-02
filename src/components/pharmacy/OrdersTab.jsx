"use client";

import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShoppingBag, Receipt, PieChart as PieIcon, Route, BarChart3, ShoppingCart, Building2, Workflow } from "lucide-react";
import { formatMoney, formatNum } from "../../data/mockData";
import { KpiCard, Panel, PieBlock, Hero, NoData, PALETTE } from "./PharmUi";

const axisMoney = (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);
const tipStyle = { borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" };

const CHANNEL_NOTES = {
  OPD: { icon: Receipt, color: "bg-sky-600", title: "Hospital Outpatient OPD", text: "Prescriptions synced directly from doctor consultations." },
  WALK_IN: { icon: ShoppingCart, color: "bg-amber-500", title: "Retail Walk-In Counter", text: "Direct OTC and external prescription sales paid at the cashier." },
  IPD_OT: { icon: Building2, color: "bg-violet-600", title: "Inpatient & Surgery Issues", text: "Paid in full at creation and settled in the Accounts service." },
};

export default function OrdersTab({ data }) {
  const { totals, status, channels } = data;
  const pct = (n) => (totals.orders > 0 ? (n / totals.orders) * 100 : 0);
  const count = (name) => status.find((s) => s.name === name)?.value || 0;
  const opd = channels.find((c) => c.key === "OPD");

  return (
    <div className="space-y-6">
      <Hero
        bg="bg-orange-600" badge="Order Flow" icon={Workflow} title="Order & Channel Pulse"
        description="How prescriptions are fulfilled and which counter they come through."
        rings={[
          { value: pct(count("Dispensed")), label: "Fully Dispensed", sub: `${count("Dispensed")} orders`, color: "#fde047" },
          { value: pct(count("Returned")), label: "Returned Orders", sub: `${count("Returned")} orders`, color: "#a5f3fc" },
          { value: pct(opd?.orders || 0), label: "OPD Share", sub: `${opd?.orders || 0} orders`, color: "#bbf7d0" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <KpiCard tone="indigo" label="Total Pharmacy Orders" value={formatNum(totals.orders)} sub={`${count("Dispensed")} dispensed · ${count("Partial")} partial · ${count("Returned")} returned`} icon={ShoppingBag} />
        <KpiCard tone="emerald" label="Average Order Value" value={formatMoney(Math.round(totals.aov))} sub="Net sales per order" icon={Receipt} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel accent="border-t-amber-500" icon={PieIcon} title="Orders by Status" subtitle="Dispensed, Partial and Returned">
          <PieBlock data={status} format={formatNum} />
        </Panel>
        <Panel accent="border-t-indigo-500" icon={Route} title="OPD vs Walk-in vs IPD / OT" subtitle="Share of pharmacy orders by channel">
          <PieBlock data={channels.map((c) => ({ name: c.name, value: c.orders }))} format={formatNum} />
        </Panel>
      </div>

      <Panel accent="border-t-emerald-500" icon={BarChart3} title="Sales by Channel" subtitle="Net sales from OPD, Walk-in and IPD / OT">
        <div className="h-64">
          {totals.orders === 0 ? (
            <NoData />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels.map((c) => ({ name: c.name, value: c.sales }))} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={axisMoney} />
                <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => [formatMoney(v), "Net sales"]} contentStyle={tipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
                  {channels.map((c, i) => <Cell key={c.key} fill={PALETTE[(i + 1) % PALETTE.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((c) => {
          const n = CHANNEL_NOTES[c.key];
          return (
            <div key={c.key} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className={`${n.color} text-white px-5 py-3 flex items-center justify-between`}>
                <span className="text-sm font-extrabold">{n.title}</span>
                <n.icon className="w-4 h-4" />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-gray-500">{n.text}</p>
                <div className="mt-3 flex items-end justify-between">
                  <span className="text-2xl font-black text-gray-900">{formatMoney(c.sales)}</span>
                  <span className="text-xs font-semibold text-gray-500">{c.orders} orders</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
