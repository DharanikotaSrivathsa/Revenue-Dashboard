"use client";

import React from "react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Pill, Trophy, PieChart as PieIcon, BarChart3, Layers, Boxes } from "lucide-react";
import { formatMoney, formatNum } from "../../data/mockData";
import { KpiCard, Panel, PieBlock, HBarList, Hero, NoData, PALETTE } from "./PharmUi";
import MedicineExplorer from "./MedicineExplorer";

const axisMoney = (v) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);
const tipStyle = { borderRadius: 12, fontSize: 12, border: "1px solid #e5e7eb" };

function ColumnChart({ rows, xKey, tipKey, label, height = "h-64", angle = false }) {
  if (rows.length === 0) return <NoData />;
  return (
    <div className={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 8, left: -8, bottom: angle ? 24 : 0 }}>
          <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} angle={angle ? -30 : 0} textAnchor={angle ? "end" : "middle"} />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={axisMoney} />
          <Tooltip cursor={{ fill: "#f8fafc" }} labelFormatter={(_, p) => p?.[0]?.payload?.[tipKey] || ""} formatter={(v) => [formatMoney(v), label]} contentStyle={tipStyle} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {rows.map((r, i) => <Cell key={r[xKey]} fill={PALETTE[i % PALETTE.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function MedicineTab({ data }) {
  const { totals, categories, medicinesByUnits, medicinesByRevenue } = data;
  const top3Share = totals.net > 0 ? (medicinesByRevenue.slice(0, 3).reduce((s, m) => s + m.revenue, 0) / totals.net) * 100 : 0;
  const leadShare = totals.net > 0 && categories[0] ? (categories[0].sales / totals.net) * 100 : 0;
  const keptShare = totals.gross > 0 ? (totals.net / totals.gross) * 100 : 0;

  return (
    <div className="space-y-6">
      <Hero
        bg="bg-violet-700" badge="Product Mix" icon={Pill} title="Medicine Performance"
        description="Which medicines and drug classes carry the pharmacy."
        rings={[
          { value: top3Share, label: "Top 3 Medicines", sub: "share of net sales", color: "#fde047" },
          { value: leadShare, label: "Leading Category", sub: categories[0]?.short || "-", color: "#5eead4" },
          { value: keptShare, label: "Net-to-Gross", sub: "sales kept after returns", color: "#fda4af" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <KpiCard tone="violet" label="Total Medicines Sold" value={formatNum(totals.unitsSold)} sub="Units across dispensed orders" icon={Boxes} />
        <KpiCard tone="amber" label="Distinct Medicines" value={formatNum(medicinesByUnits.length)} sub="Sold in this period" icon={Pill} />
        <KpiCard tone="teal" label="Drug Categories" value={formatNum(categories.length)} sub="With sales" icon={Layers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel accent="border-t-violet-500" icon={Trophy} title="Top 10 Selling Medicines" subtitle="Ranked by quantity sold">
          <HBarList ranked limit={10} color="#7c3aed" format={(v) => `${formatNum(v)} units`} data={medicinesByUnits.map((m) => ({ name: m.name, value: m.units }))} />
        </Panel>
        <Panel accent="border-t-amber-500" icon={PieIcon} title="Sales by Medicine Category" subtitle="Share of units sold per drug class">
          <PieBlock format={(v) => `${formatNum(v)} units`} data={categories.map((c) => ({ name: c.short, value: c.units }))} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel accent="border-t-emerald-500" icon={BarChart3} title="Revenue by Medicine" subtitle="Search any medicine to see units bought and returned">
          <MedicineExplorer medicines={medicinesByRevenue} />
        </Panel>
        <Panel accent="border-t-sky-500" icon={Layers} title="Revenue by Medicine Category" subtitle="Net sales per drug class">
          <ColumnChart height="h-72" xKey="short" tipKey="name" label="Revenue" rows={categories.map((c) => ({ short: c.short, name: c.name, value: c.sales }))} />
        </Panel>
      </div>
    </div>
  );
}
