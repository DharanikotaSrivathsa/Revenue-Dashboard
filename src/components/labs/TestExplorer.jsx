"use client";

import React, { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { formatMoney, formatNum } from "../../data/mockData";

const DEFAULT_COUNT = 5;

export default function TestExplorer({ tests }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(null);

  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () => (q ? tests.filter((t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)) : tests.slice(0, DEFAULT_COUNT)),
    [tests, q]
  );
  const max = Math.max(1, ...rows.map((r) => r.value));

  return (
    <div>
      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(null); }}
          placeholder="Search a test, e.g. CBC, Thyroid, Lipid…"
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300"
        />
        {query && (
          <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
          No test matches “{query}”. Only tests with settled orders in the selected filters are listed.
        </div>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((t) => {
            const isOpen = open === t.name;
            return (
              <li key={t.name} className={`rounded-xl border transition-all ${isOpen ? "border-indigo-200 bg-indigo-50/50 shadow-sm" : "border-transparent hover:bg-gray-50"}`}>
                <button onClick={() => setOpen(isOpen ? null : t.name)} aria-expanded={isOpen} className="w-full text-left px-3 py-2">
                  <div className="flex items-center justify-between text-xs mb-1.5 gap-3">
                    <span className="font-semibold text-gray-800 truncate">{t.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <strong className="text-gray-900">{formatMoney(t.value)}</strong>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500" style={{ width: `${Math.max(3, (t.value / max) * 100)}%` }} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Stat label="Bought" value={`${formatNum(t.bought)}×`} tone="text-indigo-700" />
                    <Stat label="Refunded" value={`${formatNum(t.refundedUnits)}×`} sub={formatMoney(t.refundedAmount)} tone="text-rose-600" />
                    <Stat label="Gross" value={formatMoney(t.gross)} sub={`− ${formatMoney(t.discount)} discounts`} tone="text-gray-900" />
                    <Stat label="Net revenue" value={formatMoney(t.value)} sub={t.category} tone="text-emerald-700" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="rounded-lg bg-white border border-gray-100 px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className={`block text-sm font-black ${tone}`}>{value}</span>
      {sub && <span className="block text-[10px] text-gray-500 truncate">{sub}</span>}
    </div>
  );
}
