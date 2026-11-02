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
  const { byType, byDoctor, stats } = useMemo(() => {
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

    return {
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
          title="Collected vs Outstanding by Invoice Type"
          subtitle="Identifies payment realization across Registration, Consultations, Treatments, Packages, and IPD bills"
        >
          <BarSeries stacked horizontal money height={270} data={byType} series={SERIES} />
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
