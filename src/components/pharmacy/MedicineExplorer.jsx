"use client";

import React, { useMemo, useState } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { formatMoney, formatNum } from "../../data/mockData";

const COUNTS = [5, 10, 20, 50];

export default function MedicineExplorer({ medicines }) {
  const [query, setQuery] = useState("");
  const [count, setCount] = useState(5);
  const [open, setOpen] = useState(null);

  const q = query.trim().toLowerCase();
  const matches = useMemo(
    () => (q ? medicines.filter((m) => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)) : medicines),
    [medicines, q]
  );
  // A search shows every match; otherwise only the chosen number of top earners.
  const rows = q ? matches : matches.slice(0, count);
  const max = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(null); }}
            placeholder="Search a medicine, e.g. Paracetamol, Vitamin…"
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-300"
          />
          {query && (
            <button onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
          Show
          <select
            value={count}
            disabled={!!q}
            onChange={(e) => { setCount(Number(e.target.value)); setOpen(null); }}
            className="py-2.5 px-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            {COUNTS.map((c) => <option key={c} value={c}>{c} medicines</option>)}
          </select>
        </label>
      </div>

      <p className="text-[11px] text-gray-400 mb-2">
        {q ? `${matches.length} of ${medicines.length} medicines match “${query}”` : `Showing the top ${Math.min(count, medicines.length)} of ${medicines.length} medicines by revenue`}
      </p>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl">
          No medicine matches “{query}”. Only medicines with sales in the selected filters are listed.
        </div>
      ) : (
        <ul className="space-y-2 max-h-[26rem] overflow-y-auto pr-1">
          {rows.map((m) => {
            const isOpen = open === m.name;
            return (
              <li key={m.name} className={`rounded-xl border transition-colors ${isOpen ? "border-amber-300 bg-amber-50" : "border-transparent hover:bg-gray-50"}`}>
                <button onClick={() => setOpen(isOpen ? null : m.name)} aria-expanded={isOpen} className="w-full text-left px-3 py-2">
                  <div className="flex items-center justify-between text-xs mb-1.5 gap-3">
                    <span className="font-semibold text-gray-800 truncate">{m.name}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <strong className="text-gray-900">{formatMoney(m.revenue)}</strong>
                      <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.max(3, (m.revenue / max) * 100)}%` }} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Stat label="Bought" value={`${formatNum(m.bought)} units`} tone="text-indigo-700" />
                    <Stat label="Returned" value={`${formatNum(m.returnedUnits)} units`} sub={formatMoney(m.returnedAmount)} tone="text-rose-600" />
                    <Stat label="Gross" value={formatMoney(m.gross)} sub={`− ${formatMoney(m.discount)} discounts`} tone="text-gray-900" />
                    <Stat label="Net revenue" value={formatMoney(m.revenue)} sub={m.category} tone="text-emerald-700" />
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
    <div className="rounded-lg bg-white border border-gray-200 px-3 py-2">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
      <span className={`block text-sm font-black ${tone}`}>{value}</span>
      {sub && <span className="block text-[10px] text-gray-500 truncate">{sub}</span>}
    </div>
  );
}
