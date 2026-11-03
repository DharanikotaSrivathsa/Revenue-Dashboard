"use client";

import React from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { ClipboardList, TestTube2, PackageX, FlaskConical, Filter, TrendingUp, Layers, Users, Workflow } from "lucide-react";
import { formatNum } from "../../data/mockData";
import { KpiCard, Panel, DonutBlock, NoData, Hero } from "./LabUi";

const tipStyle = { borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" };
const STAGE_COLORS = ["#64748b", "#3b82f6", "#0284c7", "#f59e0b", "#10b981"];

export default function OrdersTab({ data }) {
  const { orders } = data;
  const top = Math.max(1, orders.funnel[0]?.value || 1);
  const pctOf = (n, d) => (d > 0 ? (n / d) * 100 : 0);
  const completedN = orders.funnel[4]?.value || 0;
  const acceptedN = orders.funnel[1]?.value || 0;
  const activeOrders = orders.total - orders.cancelled;
  const docPortalOrders = (orders.opd || 0) + (orders.ipd || 0);

  return (
    <div className="space-y-6">
      <Hero
        badge="Clinical LIS Lifecycle" icon={Workflow} title="Order & Workflow Pulse"
        description="Tracks specimens from Sample Collection through Acceptance, Result Entry, Pathologist Validation, and Completion."
        glowA="bg-indigo-500/25" glowB="bg-sky-500/20" gradient="from-slate-900 via-indigo-950 to-sky-900"
        rings={[
          { id: "done", value: pctOf(completedN, activeOrders), label: "Completion Rate", sub: `${completedN} completed`, from: "#5eead4", to: "#22d3ee" },
          { id: "acc", value: pctOf(acceptedN, activeOrders), label: "Sample Acceptance", sub: `${acceptedN} accepted in lab`, from: "#93c5fd", to: "#a78bfa" },
          { id: "hms", value: pctOf(docPortalOrders, orders.total), label: "Doctor Portal Share", sub: `${docPortalOrders} OPD/IPD orders`, from: "#fbcfe8", to: "#f472b6" },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard solid label="Total Orders" value={formatNum(orders.total)} sub="OPD, IPD & Walk-in received" icon={ClipboardList} tone="teal" />
        <KpiCard solid label="Samples Collected" value={formatNum(orders.samplesCollected)} sub="Specimens drawn & received" icon={TestTube2} tone="sky" />
        <KpiCard solid label="Samples Rejected" value={formatNum(orders.samplesRejected)} sub={`${data.quality.rejectionRate.toFixed(1)}% rejected at acceptance`} icon={PackageX} tone="rose" />
        <KpiCard solid label="Tests Performed" value={formatNum(orders.testsPerformed)} sub="Across completed orders" icon={FlaskConical} tone="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <Panel className="lg:col-span-5 bg-gradient-to-br from-white to-indigo-50/60" title="Customer Streams" subtitle="OPD Consultations · IPD Inpatient · Walk-in" icon={Users}>
          <DonutBlock
            data={[
              { name: "OPD Orders", value: orders.opd },
              { name: "Walk-in Counter", value: orders.walkIn },
              { name: "IPD Inpatient", value: orders.ipd },
            ]}
            format={formatNum}
            centerLabel="Orders"
          />
        </Panel>

        <Panel className="lg:col-span-7 bg-gradient-to-br from-white to-sky-50/60" title="Clinical Diagnostic Workflow Funnel" subtitle={`Sample Collection → Completed · ${orders.cancelled} cancelled orders excluded`} icon={Filter}>
          <div className="space-y-2.5">
            {orders.funnel.map((s, i) => {
              const pct = (s.value / top) * 100;
              const conv = i > 0 && orders.funnel[i - 1].value > 0 ? Math.round((s.value / orders.funnel[i - 1].value) * 100) : null;
              return (
                <div key={s.name} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-xs font-semibold text-gray-700">{s.name}</span>
                  <div className="flex-1 flex justify-center">
                    <div
                      className="h-9 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-sm transition-all"
                      style={{ width: `${Math.max(14, pct)}%`, background: STAGE_COLORS[i] }}
                    >
                      {s.value}
                    </div>
                  </div>
                  <span className="w-14 shrink-0 text-right text-[11px] font-bold text-gray-500">{conv !== null ? `${conv}%` : "—"}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-500 mt-3">Each stage counts orders that reached it or went further. Right column is stage-to-stage conversion.</p>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel className="bg-gradient-to-br from-white to-violet-50/60" title="Daily Order Trend" subtitle="Lab orders received each day" icon={TrendingUp}>
          <div className="h-64">
            {orders.daily.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orders.daily} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} minTickGap={16} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => [v, "Orders"]} contentStyle={tipStyle} />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 2.5 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>

        <Panel className="bg-gradient-to-br from-white to-teal-50/60" title="Department-wise Orders" subtitle="Tests ordered per lab department" icon={Layers}>
          <div className="h-64">
            {orders.byDept.length === 0 ? (
              <NoData />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orders.byDept} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} formatter={(v) => [v, "Tests"]} contentStyle={tipStyle} />
                  <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
