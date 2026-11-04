"use client";

import React, { useMemo } from "react";
import { Card, COLORS } from "./ChartKit";
import { BarSeries } from "./MoreCharts";
import { formatMoney } from "../../data/mockData";
import { AlertCircle, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";

const SERIES = [
  { key: "collected", name: "Collected", color: COLORS.teal },
  { key: "outstanding", name: "Outstanding", color: COLORS.amber }
];

// Where money is still waiting to be collected, by kind of bill and by doctor (follows the page filters).
export default function CollectionInsights({ invoices = [], accent }) {
  const { bills, byType, byDoctor, stats } = useMemo(() => {
    const group = (keyFn, labelFn) => {
      const map = new Map();
      invoices.forEach((i) => {
        const k = keyFn(i);
        const row = map.get(k) || { name: labelFn(k), collected: 0, outstanding: 0 };
        row.collected += i.collected;
        row.outstanding += i.outstanding;
        map.set(k, row);
      });
      return [...map.values()].sort((a, b) => b.collected + b.outstanding - (a.collected + a.outstanding));
    };

    const typeRows = group(
      (i) => i.type,
      (t) => (t === "IPD" ? "IPD" : t.charAt(0) + t.slice(1).toLowerCase())
    );

    const docRows = group(
      (i) => i.doctor,
      (d) => d.replace("Dr. ", "")
    );

    // Calculate smart summary insights
    const totalCollected = invoices.reduce((s, i) => s + (i.collected || 0), 0);
    const totalOutstanding = invoices.reduce((s, i) => s + (i.outstanding || 0), 0);
    const totalBilled = totalCollected + totalOutstanding;
    const rate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    const highestOutstandingType = [...typeRows].sort((a, b) => b.outstanding - a.outstanding)[0];
    const highestOutstandingDoc = [...docRows].sort((a, b) => b.outstanding - a.outstanding)[0];

    // Plain summary: how many bills are fully paid, part paid or not paid, and what is still owed on them
    const bill = (status) => {
      const rows = invoices.filter((i) => i.status === status);
      return { count: rows.length, received: rows.reduce((s, i) => s + (i.collected || 0), 0), due: rows.reduce((s, i) => s + (i.outstanding || 0), 0) };
    };
    const bills = { paid: bill("Paid"), partial: bill("Partial"), unpaid: bill("Unpaid") };

    return {
      bills,
      byType: typeRows,
      byDoctor: docRows,
      stats: {
        totalCollected,
        totalOutstanding,
        rate,
        highestOutstandingType,
        highestOutstandingDoc
      }
    };
  }, [invoices]);

  return (
    <div className="space-y-4">
      {/* Executive Digest Ribbon */}
      {invoices.length > 0 && stats && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl p-4 text-white shadow-md border border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 border border-teal-500/30">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                  Executive Collections Intelligence
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {stats.rate}% Efficiency
                  </span>
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Total Collected: <strong className="text-teal-300">{formatMoney(stats.totalCollected)}</strong> ·
                  Outstanding: <strong className="text-amber-300">{formatMoney(stats.totalOutstanding)}</strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {stats.highestOutstandingType && stats.highestOutstandingType.outstanding > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Max Gap in <strong>{stats.highestOutstandingType.name}</strong> ({formatMoney(stats.highestOutstandingType.outstanding)})</span>
                </div>
              )}
              {stats.highestOutstandingDoc && stats.highestOutstandingDoc.outstanding > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Lead Doctor: <strong>Dr. {stats.highestOutstandingDoc.name}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Two Comparative Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card
          accent={accent}
          title="Money received vs still to collect"
          subtitle="A simple view of what has been paid and what is still owed"
        >
          {invoices.length === 0 ? (
            <p className="text-sm text-slate-500 py-10 text-center">No bills for the selected filters.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-slate-600">
                    <strong className="font-data text-xl text-teal-700">{formatMoney(stats.totalCollected)}</strong> received out of{" "}
                    <strong className="font-data text-slate-900">{formatMoney(stats.totalCollected + stats.totalOutstanding)}</strong> billed
                  </p>
                  <span className="text-sm font-semibold text-slate-900">{stats.rate}% collected</span>
                </div>
                {(() => {
                  const billed = stats.totalCollected + stats.totalOutstanding;
                  const pct = (v) => (billed > 0 ? (v / billed) * 100 : 0);
                  return (
                    <div className="mt-3 h-3 rounded-full bg-slate-100 overflow-hidden flex" role="img" aria-label={`${stats.rate}% of the billed amount has been received`}>
                      <div className="h-full bg-teal-600 transition-all duration-500" style={{ width: `${pct(stats.totalCollected)}%` }} />
                      <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${pct(bills.partial.due)}%` }} />
                      <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${pct(bills.unpaid.due)}%` }} />
                    </div>
                  );
                })()}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mt-2">
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-600" /> Received</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Part paid</span>
                  <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Not paid yet</span>
                  <span className="inline-flex items-center gap-1.5">Still to collect: <strong className="font-data text-slate-700">{formatMoney(stats.totalOutstanding)}</strong></span>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border-t border-slate-100">
                {[
                  { key: "paid", label: "Paid in full", note: "received", amount: bills.paid.received, dot: "bg-teal-600", tone: "text-teal-700" },
                  { key: "partial", label: "Part paid", note: "still to collect", amount: bills.partial.due, dot: "bg-amber-500", tone: "text-amber-700" },
                  { key: "unpaid", label: "Not paid yet", note: "still to collect", amount: bills.unpaid.due, dot: "bg-rose-500", tone: "text-rose-700" }
                ].map((r) => (
                  <div key={r.key} className="flex items-center justify-between gap-3 py-3">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.dot}`} />
                      <span className="text-sm font-medium text-slate-800">{r.label}</span>
                      <span className="text-xs text-slate-500">{bills[r.key].count} {bills[r.key].count === 1 ? "bill" : "bills"}</span>
                    </span>
                    <span className="text-sm text-right">
                      <strong className={`font-data ${r.tone}`}>{formatMoney(r.amount)}</strong>
                      <span className="text-xs text-slate-500 ml-1.5">{r.note}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card
          accent={accent}
          title="Collected vs Outstanding by Doctor"
          subtitle="Compares payments realized against pending balances for each treating physician"
        >
          <BarSeries stacked horizontal money height={270} data={byDoctor} series={SERIES} />
        </Card>
      </div>
    </div>
  );
}
