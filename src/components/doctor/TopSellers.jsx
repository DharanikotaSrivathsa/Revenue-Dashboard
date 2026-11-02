"use client";

import React, { useMemo, useState } from "react";
import { calculateCommercialAnalytics } from "../../data/commercialAnalytics";
import { formatMoney, formatNum } from "../../data/mockData";
import { Card, NoData } from "./ChartKit";
import { Package, Pill, FlaskConical, Stethoscope, Award, Sparkles, Filter } from "lucide-react";

const TYPES = {
  Package: { color: "#f59e0b", bg: "#fef3c7", border: "#fde68a", unit: "sold", label: "Packages", icon: Package },
  Medicine: { color: "#0d9488", bg: "#ccfbf1", border: "#99f6e4", unit: "units", label: "Medications", icon: Pill },
  Test: { color: "#6366f1", bg: "#e0e7ff", border: "#c7d2fe", unit: "tests", label: "Lab Tests", icon: FlaskConical },
  Procedure: { color: "#2563eb", bg: "#dbeafe", border: "#bfdbfe", unit: "done", label: "Procedures", icon: Stethoscope }
};

// The ten best-selling items across the hospital: packages, medications, lab tests and procedures.
export default function TopSellers({ encounters, accent }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const items = useMemo(() => {
    const c = calculateCommercialAnalytics(encounters);
    return [
      ...c.topPackages.map((x) => ({ name: x.name, type: "Package", sub: x.description, units: x.unitsSold, revenue: x.revenueGenerated })),
      ...c.topMedications.map((x) => ({ name: x.name, type: "Medicine", sub: x.category, units: x.unitsSold, revenue: x.revenueGenerated })),
      ...c.topLabTests.map((x) => ({ name: x.name, type: "Test", sub: x.category, units: x.unitsSold, revenue: x.revenueGenerated })),
      ...c.topProcedures.map((x) => ({ name: x.name, type: "Procedure", sub: x.department, units: x.volumeCompleted, revenue: x.revenueGenerated }))
    ].filter((x) => x.revenue > 0);
  }, [encounters]);

  const total = items.reduce((s, x) => s + x.revenue, 0);

  // Filter and rank items based on category selection
  const filteredAndRanked = useMemo(() => {
    if (selectedCategory !== "All") {
      return items
        .filter((x) => x.type === selectedCategory)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
    }

    // "All" alternates across categories to ensure diverse representation of top earners
    const ranked = [...items].sort((a, b) => b.revenue - a.revenue);
    const lanes = Object.keys(TYPES).map((type) => ranked.filter((x) => x.type === type));
    const mixed = [];
    for (let round = 0; mixed.length < 10 && lanes.some((l) => l.length > round); round++) {
      lanes.forEach((l) => {
        if (l[round] && mixed.length < 10) mixed.push(l[round]);
      });
    }
    return mixed;
  }, [items, selectedCategory]);

  const maxRevenue = Math.max(1, ...filteredAndRanked.map((x) => x.revenue));

  // Category counts and summary
  const categoryStats = useMemo(() => {
    const counts = { All: items.length };
    Object.keys(TYPES).forEach((type) => {
      counts[type] = items.filter((x) => x.type === type).length;
    });
    return counts;
  }, [items]);

  const CategoryFilters = (
    <div className="flex flex-wrap items-center gap-1.5 no-print">
      <button
        onClick={() => setSelectedCategory("All")}
        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          selectedCategory === "All"
            ? "bg-slate-900 text-white shadow-sm font-semibold"
            : "bg-slate-100 hover:bg-slate-200 text-slate-600"
        }`}
      >
        All ({categoryStats.All || 0})
      </button>
      {Object.entries(TYPES).map(([typeKey, cfg]) => {
        const Icon = cfg.icon;
        const count = categoryStats[typeKey] || 0;
        const isActive = selectedCategory === typeKey;
        return (
          <button
            key={typeKey}
            onClick={() => setSelectedCategory(typeKey)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              isActive
                ? "text-white shadow-sm font-semibold"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
            style={isActive ? { background: cfg.color } : undefined}
          >
            <Icon className="w-3 h-3" />
            <span>{cfg.label}</span>
            <span className={`text-[10px] ml-0.5 px-1 py-0.2 rounded-full ${isActive ? "bg-white/25 text-white" : "bg-slate-200 text-slate-600"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <Card
      accent={accent}
      title="Top 10 Best-Selling Hospital Services & Products"
      subtitle="Ranked by gross revenue generated across clinical procedures, packages, laboratory tests, and medications"
      action={CategoryFilters}
    >
      {filteredAndRanked.length === 0 ? (
        <NoData height={200} />
      ) : (
        <div className="space-y-2 mt-2">
          {filteredAndRanked.map((x, i) => {
            const t = TYPES[x.type];
            const Icon = t.icon;
            const pctShare = total > 0 ? Math.round((x.revenue / total) * 100) : 0;
            const barPct = Math.min(100, Math.round((x.revenue / maxRevenue) * 100));

            return (
              <div
                key={`${x.type}-${x.name}`}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Rank Badge */}
                  <span
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 tabular-nums ${
                      i === 0
                        ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-500/30"
                        : i === 1
                        ? "bg-gradient-to-br from-slate-400 to-slate-600 text-white shadow-md shadow-slate-500/20"
                        : i === 2
                        ? "bg-gradient-to-br from-amber-700 to-yellow-800 text-white shadow-md shadow-amber-800/20"
                        : "bg-slate-100 text-slate-700 group-hover:bg-slate-200"
                    }`}
                  >
                    {i + 1}
                  </span>

                  {/* Title and subtext */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">
                        {x.name}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0 border"
                        style={{ background: t.bg, color: t.color, borderColor: t.border }}
                      >
                        <Icon className="w-2.5 h-2.5" />
                        {x.type}
                      </span>
                      {x.sub && (
                        <span className="text-xs text-slate-500 hidden md:inline truncate">
                          · {x.sub}
                        </span>
                      )}
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${barPct}%`, background: t.color }}
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Figures */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center flex-shrink-0 sm:w-32 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="font-data text-sm font-bold text-slate-900">
                    {formatMoney(x.revenue)}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-medium text-slate-700">{formatNum(x.units)}</span>
                    <span>{t.unit}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-medium">{pctShare}% share</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Diagnostic tests are tracked from laboratory orders; packages and medication rows reflect active encounters.</span>
        </span>
        <span className="font-medium text-slate-600">
          Showing top {filteredAndRanked.length} items
        </span>
      </div>
    </Card>
  );
}
