"use client";

import React, { useMemo, useRef, useState } from "react";
import { Search, X, FlaskConical, Layers, Syringe, Package as PackageIcon, Pill } from "lucide-react";
import { buildServiceIndex, searchServices, SERVICE_TYPES } from "../../data/doctorServices";
import { formatMoney, formatNum } from "../../data/mockData";
import { Section, Card, StatStrip, HBars } from "./ChartKit";

const ICONS = { test: FlaskConical, profile: Layers, procedure: Syringe, package: PackageIcon, medication: Pill };
const typeOf = (id) => SERVICE_TYPES.find((t) => t.id === id);
const unitWord = (id, n) => { const u = typeOf(id).unit; return n === 1 ? ({ tests: "test", profiles: "profile", procedures: "procedure", packages: "package", units: "unit" })[u] : u; };
// Wraps the typed words inside a name in <mark> so the user sees why it matched.
function Highlight({ text, query }) {
  const words = query.trim().split(/\s+/).filter(Boolean).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!words.length) return text;
  const parts = text.split(new RegExp(`(${words.join("|")})`, "ig"));
  return parts.map((part, i) => (i % 2 === 1 ? <mark key={i} className="bg-blue-100 text-blue-900 rounded px-0.5">{part}</mark> : part));
}

const chartName = (n) => { const t = n.replace(/\s*\(.*?\)/g, ""); return t.length > 24 ? t.slice(0, 23) + "…" : t; };

function TypeTag({ id }) {
  const t = typeOf(id);
  return <span className="px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0" style={{ background: `${t.color}1a`, color: t.color }}>{t.label.replace(/s$/, "")}</span>;
}

// Search any service (lab test, profile, procedure, package, medication) and see how the viewed doctor did against it.
export default function DoctorServiceExplorer({ doctorName, scoped }) {
  const index = useMemo(() => buildServiceIndex(scoped, doctorName), [scoped, doctorName]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [picked, setPicked] = useState(null);
  const [metric, setMetric] = useState("revenue");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const inputRef = useRef(null);
  const short = doctorName.replace("Dr. ", "");
  const searching = query.trim().length > 0;

  // Matches across the whole hospital's services. With nothing typed, show what this doctor sells most.
  const results = useMemo(() => {
    const found = searchServices(index, query, kind);
    return found.sort((a, b) => (b.revenue - a.revenue) || (b.hospitalRevenue - a.hospitalRevenue));
  }, [index, query, kind]);
  const shown = searching ? results : results.filter((r) => r.revenue > 0).slice(0, 12);
  const active = shown.find((r) => r.key === picked) || shown[0] || null;

  const counts = useMemo(() => {
    const base = searchServices(index, query, "all");
    return Object.fromEntries([["all", base.length], ...SERVICE_TYPES.map((t) => [t.id, base.filter((r) => r.service === t.id).length])]);
  }, [index, query]);

  // Live suggestions: names starting with what was typed come first, then the strongest sellers.
  const live = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q ? searchServices(index, query, kind) : index.filter((r) => r.revenue > 0 && (kind === "all" || r.service === kind));
    // 0 = name starts with the text, 1 = a word in the name starts with it, 2 = it appears inside a word
    const rank = (r) => {
      if (!q) return 0;
      const n = r.name.toLowerCase();
      if (n.startsWith(q)) return 0;
      return q.split(/\s+/).every((w) => new RegExp("(^|[^a-z0-9])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(n)) ? 1 : 2;
    };
    return [...base]
      .sort((a, b) => (rank(a) - rank(b)) || (b.revenue - a.revenue) || (b.hospitalRevenue - a.hospitalRevenue))
      .slice(0, 8);
  }, [index, query, kind]);

  const choose = (r) => {
    setQuery(r.name);
    setPicked(r.key);
    setOpen(false);
    inputRef.current?.blur();
  };

  const onKey = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, live.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter" && open && live[hi]) { e.preventDefault(); choose(live[hi]); }
    else if (e.key === "Escape") { e.preventDefault(); if (open) setOpen(false); else { setQuery(""); setPicked(null); } }
  };

  const suggestions = useMemo(() => index.filter((r) => r.revenue > 0).sort((a, b) => b.revenue - a.revenue).slice(0, 5), [index]);

  return (
    <Section
      title="Doctor × service"
      subtitle={`Search any lab test, profile, procedure, package or medicine to see how ${short} did against it and how other doctors compare.`}
    >
      {/* Search box */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={query}
            ref={inputRef}
            onChange={(e) => { setQuery(e.target.value); setPicked(null); setOpen(true); setHi(0); }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKey}
            role="combobox"
            aria-expanded={open && live.length > 0}
            aria-controls="service-suggestions"
            aria-autocomplete="list"
            autoComplete="off"
            placeholder="Search a service, e.g. CBC, Augmentin, cardiac package, echo…"
            aria-label="Search a service"
            className="w-full h-11 pl-10 pr-10 text-sm rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setQuery(""); setPicked(null); inputRef.current?.focus(); }} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}

          {open && live.length > 0 && (
            <ul id="service-suggestions" role="listbox" aria-label="Suggestions" className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white border border-slate-200 rounded-xl shadow-[0_12px_32px_rgba(16,24,40,0.14)] overflow-hidden max-h-[360px] overflow-y-auto">
              <li className="px-3.5 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 bg-slate-50 border-b border-slate-100" aria-hidden="true">
                {query.trim() ? "Suggestions" : `${short}'s top services`}
              </li>
              {live.map((r, i) => {
                const I = ICONS[r.service];
                const color = typeOf(r.service).color;
                return (
                  <li key={r.key} role="option" aria-selected={i === hi}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(r)}
                      onMouseEnter={() => setHi(i)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors ${i === hi ? "bg-blue-50" : "hover:bg-slate-50"}`}
                    >
                      <span className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${color}1a`, color }}>
                        <I className="w-3.5 h-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-slate-900 truncate"><Highlight text={r.name} query={query} /></span>
                        <span className="block text-xs text-slate-500 truncate">{typeOf(r.service).label.replace(/s$/, "")} · {r.sub}</span>
                      </span>
                      <span className="text-xs flex-shrink-0 text-right">
                        {r.revenue > 0 ? <span className="font-data font-medium text-slate-700">{formatMoney(r.revenue)}</span> : <span className="text-slate-400">Not ordered</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[{ id: "all", label: "All services" }, ...SERVICE_TYPES].map((t) => (
            <button
              key={t.id}
              onClick={() => { setKind(t.id); setPicked(null); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${kind === t.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {t.label}
              {searching && <span className={`tabular-nums ${kind === t.id ? "text-slate-300" : "text-slate-400"}`}>{counts[t.id]}</span>}
            </button>
          ))}
        </div>

        {!searching && (
          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <span>Try:</span>
            {suggestions.map((s) => (
              <button key={s.key} onClick={() => setQuery(chartName(s.name))} className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors cursor-pointer">
                {chartName(s.name)}
              </button>
            ))}
          </p>
        )}
      </div>

      {shown.length === 0 ? (
        <Card>
          <div className="py-10 text-center">
            <Search className="w-6 h-6 mx-auto text-slate-300" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-700 mt-3">Nothing matches “{query}”</p>
            <p className="text-xs text-slate-500 mt-1">Try a shorter word, or choose All services.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 items-start">
          {/* Results */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>{searching ? `${results.length} service${results.length === 1 ? "" : "s"} found` : `${short}'s top services`}</span>
              <span>{short}'s sales</span>
            </div>
            <ul role="listbox" aria-label="Matching services" className="max-h-[520px] overflow-y-auto divide-y divide-slate-100">
              {shown.map((r) => {
                const on = active && r.key === active.key;
                const I = ICONS[r.service];
                const color = typeOf(r.service).color;
                return (
                  <li key={r.key} role="option" aria-selected={on}>
                    <button onClick={() => setPicked(r.key)} className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer ${on ? "bg-slate-50" : "hover:bg-slate-50/70"}`} style={on ? { boxShadow: `inset 3px 0 0 ${color}` } : undefined}>
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}1a`, color }}>
                        <I className="w-4 h-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-medium text-slate-900 truncate" title={r.name}>{r.name}</span>
                        <span className="block text-xs text-slate-500 truncate">{typeOf(r.service).label.replace(/s$/, "")} · {r.sub}</span>
                      </span>
                      <span className="text-right flex-shrink-0">
                        {r.revenue > 0 ? (
                          <>
                            <span className="block font-data text-[13px] font-semibold text-slate-900">{formatMoney(r.revenue)}</span>
                            <span className="block text-xs text-slate-500">{formatNum(r.units)} {typeOf(r.service).unit}</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">Not ordered</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Detail */}
          {active && (
            <div className="xl:col-span-3 space-y-5 min-w-0">
              <div className="bg-white rounded-xl border border-slate-200 shadow-[0_1px_2px_rgba(16,24,40,0.04)] p-5" style={{ borderTop: `3px solid ${typeOf(active.service).color}` }}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900">{active.name}</h3>
                  <TypeTag id={active.service} />
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {active.revenue > 0 ? (
                    <><strong className="text-slate-900">{short}</strong> sold {formatNum(active.units)} {unitWord(active.service, active.units)} for <strong className="text-slate-900">{formatMoney(active.revenue)}</strong>. That is {active.sharePct}% of the hospital's sales of this service, ranked <strong className="text-slate-900">#{active.rank}</strong> of {active.doctorCount} doctor{active.doctorCount === 1 ? "" : "s"}.</>
                  ) : (
                    <><strong className="text-slate-900">{short}</strong> has not ordered this service in the selected period. {active.doctorCount} other doctor{active.doctorCount === 1 ? " has" : "s have"}; see the comparison below.</>
                  )}
                </p>
              </div>

              <StatStrip
                accent={typeOf(active.service).color}
                cols="grid-cols-2 md:grid-cols-3"
                items={[
                  { label: `${short}'s revenue`, value: formatMoney(active.revenue) },
                  { label: `${short}'s ${typeOf(active.service).unit}`, value: formatNum(active.units) },
                  { label: "Patients", value: formatNum(active.patients) },
                  { label: "Average per unit", value: active.units > 0 ? formatMoney(active.avgPerUnit) : "—" },
                  { label: "Hospital total", value: formatMoney(active.hospitalRevenue) },
                  { label: "Share of hospital", value: `${active.sharePct}%`, tone: "text-blue-700" }
                ]}
              />

              <Card
                title={`Every doctor's ${metric === "revenue" ? "revenue" : typeOf(active.service).unit} for this service`}
                subtitle={`${short} is highlighted`}
                action={
                  <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
                    {[["revenue", "Revenue"], ["units", "Units"]].map(([k, l]) => (
                      <button key={k} onClick={() => setMetric(k)} className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${metric === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{l}</button>
                    ))}
                  </div>
                }
              >
                <HBars
                  money={metric === "revenue"}
                  height={Math.max(200, active.doctors.length * 38 + 40)}
                  data={active.doctors.map((d) => ({ name: d.name.replace("Dr. ", ""), value: metric === "revenue" ? d.revenue : d.units, color: d.name === doctorName ? typeOf(active.service).color : "#cbd5e1" }))}
                />
              </Card>

              <Card title={`${short}'s bills for this service`} subtitle={active.bills.length ? `${active.bills.length} bill${active.bills.length === 1 ? "" : "s"}, latest first` : undefined}>
                {active.bills.length === 0 ? (
                  <p className="text-sm text-slate-500 py-4 text-center">No bills from {short} for this service in the selected period.</p>
                ) : (
                  <div className="overflow-x-auto max-h-[300px] overflow-y-auto -mx-1">
                    <table className="w-full text-left text-[13px] whitespace-nowrap">
                      <thead className="sticky top-0 bg-white text-xs text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3 font-medium">Invoice</th>
                          <th className="py-2.5 px-3 font-medium">Date</th>
                          <th className="py-2.5 px-3 font-medium">Patient</th>
                          <th className="py-2.5 px-3 font-medium text-right">Units</th>
                          <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {active.bills.map((b) => (
                          <tr key={b.encId} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3 font-medium text-blue-700">{b.encId}</td>
                            <td className="py-2.5 px-3 text-slate-500">{b.date}</td>
                            <td className="py-2.5 px-3 text-slate-800">{b.patient}</td>
                            <td className="py-2.5 px-3 text-right font-data">{formatNum(b.units)}</td>
                            <td className="py-2.5 px-3 text-right font-data font-semibold text-slate-900">{formatMoney(b.revenue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-500">
        {["test", "profile"].includes(active?.service)
          ? "Lab tests are single-test orders and profiles are orders that bundle two or more tests. Imaging is not included."
          : "Item names for procedures, packages and medications are illustrative, because the demo data holds only totals for them. Amounts and counts are real."}
        {" "}Each bill is counted once.
      </p>
    </Section>
  );
}
