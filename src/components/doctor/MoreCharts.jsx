"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatMoney, formatNum } from "../../data/mockData";
import { NoData, shortMoney, useAnimate } from "./ChartKit";

const tick = { fontSize: 11, fill: "#64748b" };
const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, boxShadow: "0 8px 24px rgba(15,23,42,0.08)" };
const hasValues = (data, series) => data.some((d) => series.some((s) => d[s.key] > 0));

// series: [{ key, name, color }]. stacked puts the series on top of each other, otherwise side by side.
export function BarSeries({ data, series, stacked = false, horizontal = false, money = false, height = 260 }) {
  const animate = useAnimate();
  if (!hasValues(data, series)) return <NoData height={height} />;
  const fmt = money ? formatMoney : formatNum;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={horizontal} horizontal={!horizontal} stroke="#eef1f5" />
          {horizontal ? (
            <>
              <XAxis type="number" tickLine={false} axisLine={false} tick={tick} tickFormatter={money ? shortMoney : undefined} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={104} tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" interval={0} tickLine={false} axisLine={false} tick={tick} />
              <YAxis tickLine={false} axisLine={false} width={money ? 48 : 30} tick={tick} tickFormatter={money ? shortMoney : undefined} allowDecimals={false} />
            </>
          )}
          <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={tooltipStyle} formatter={(v, n) => [fmt(v), n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          {series.map((s, i) => (
            <Bar
              isAnimationActive={animate}
              key={s.key}
              dataKey={s.key}
              name={s.name}
              fill={s.color}
              stackId={stacked ? "s" : undefined}
              maxBarSize={stacked ? 34 : 22}
              radius={stacked ? (i === series.length - 1 ? (horizontal ? [0, 6, 6, 0] : [6, 6, 0, 0]) : 0) : horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Bars for an amount with a line for a percentage on the right-hand axis.
export function BarAndLine({ data, barKey, barName, lineKey, lineName, barColor, lineColor, money = true, height = 260 }) {
  const animate = useAnimate();
  if (!data.some((d) => d[barKey] > 0)) return <NoData height={height} />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef1f5" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={tick} minTickGap={8} />
          <YAxis yAxisId="l" tickLine={false} axisLine={false} width={48} tick={tick} tickFormatter={money ? shortMoney : undefined} />
          <YAxis yAxisId="r" orientation="right" tickLine={false} axisLine={false} width={36} tick={tick} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [n === lineName ? `${v}%` : formatMoney(v), n]} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar isAnimationActive={animate} yAxisId="l" dataKey={barKey} name={barName} fill={barColor} radius={[6, 6, 0, 0]} maxBarSize={40} />
          <Line isAnimationActive={animate} yAxisId="r" type="monotone" dataKey={lineKey} name={lineName} stroke={lineColor} strokeWidth={2.5} dot={{ r: 3 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
