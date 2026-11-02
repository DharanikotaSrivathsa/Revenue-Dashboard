"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  Legend,
  FunnelChart,
  Funnel,
  LabelList
} from "recharts";
import { formatMoney, formatNum } from "../../data/mockData";
import { COLORS, NoData, shortMoney } from "./ChartKit";

const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" };

// steps: [{ name, value, kind: "total" | "minus" }]
export function Waterfall({ steps, height = 240 }) {
  if (!steps.some((s) => s.value > 0)) return <NoData height={height} />;
  let running = 0;
  const data = steps.map((s) => {
    if (s.kind === "total") {
      running = s.value;
      return { name: s.name, base: 0, value: s.value, color: s.color };
    }
    running -= s.value;
    return { name: s.name, base: Math.max(0, running), value: s.value, color: s.color, minus: true };
  });
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={shortMoney} />
          <Tooltip
            cursor={{ fill: "#f8fafc" }}
            contentStyle={tooltipStyle}
            formatter={(v, n, item) => (n === "base" ? [null, null] : [`${item.payload.minus ? "− " : ""}${formatMoney(v)}`, item.payload.name])}
            itemStyle={{ color: COLORS.navy }}
          />
          <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} legendType="none" />
          <Bar dataKey="value" stackId="w" radius={[6, 6, 0, 0]} maxBarSize={56}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FunnelView({ data, height = 260 }) {
  if (!data.some((d) => d.value > 0)) return <NoData height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip formatter={(v) => formatNum(v)} contentStyle={tooltipStyle} />
          <Funnel dataKey="value" data={data} isAnimationActive>
            <LabelList position="right" fill="#334155" stroke="none" dataKey="name" style={{ fontSize: 12, fontWeight: 600 }} />
            <LabelList position="center" fill="#ffffff" stroke="none" dataKey="value" style={{ fontSize: 13, fontWeight: 800 }} />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  );
}

// Collections vs outstanding, stacked per period
export function StackedMoney({ data, height = 240 }) {
  if (!data.some((d) => d.collected > 0 || d.outstanding > 0)) return <NoData height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} minTickGap={16} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={shortMoney} />
          <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} formatter={(v, n) => [formatMoney(v), n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="collected" name="Collected" stackId="s" fill={COLORS.teal} maxBarSize={36} />
          <Bar dataKey="outstanding" name="Outstanding" stackId="s" fill={COLORS.amber} radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
