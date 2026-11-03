"use client";

import React from "react";
import { Inbox, BadgeCheck, Unlink, MapPin, Stethoscope, Network } from "lucide-react";
import { formatNum } from "../../data/mockData";
import { KpiCard, Panel, DonutBlock, HBarList, Hero } from "./LabUi";

export default function HmsTab({ data }) {
  const { hms } = data;
  const confirmRate = hms.received > 0 ? Math.round((hms.confirmed / hms.received) * 100) : 0;
  const lead = hms.received + hms.unconverted;
  const conversion = lead > 0 ? (hms.received / lead) * 100 : 0;
  const unconvRate = hms.encounters > 0 ? Math.round((hms.unconverted / hms.encounters) * 100) : 0;

  return (
    <div className="space-y-6">
      <Hero
        badge="HMS Bridge" icon={Network} title="Hospital Integration Health"
        description="How reliably hospital encounters turn into confirmed lab orders."
        glowA="bg-emerald-500/25" glowB="bg-amber-500/20" gradient="from-slate-900 via-teal-950 to-emerald-900"
        rings={[
          { id: "conf", value: confirmRate, label: "Confirmation Rate", sub: `${hms.confirmed} of ${hms.received} confirmed`, from: "#6ee7b7", to: "#22d3ee" },
          { id: "conv", value: conversion, label: "Encounter Conversion", sub: `${hms.unconverted} unconverted`, from: "#fde68a", to: "#fb923c" },
          { id: "opd", value: hms.received > 0 ? (hms.byVisitType[0].value / hms.received) * 100 : 0, label: "OPD Share", sub: "of HMS orders", from: "#c4b5fd", to: "#f0abfc" },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <KpiCard solid label="HMS Orders Received" value={formatNum(hms.received)} sub="Orders sent from the hospital system" icon={Inbox} tone="teal" />
        <KpiCard solid label="HMS Orders Confirmed" value={formatNum(hms.confirmed)} sub={`${confirmRate}% confirmed by the lab`} icon={BadgeCheck} tone="emerald" />
        <KpiCard solid label="Unconverted Encounters" value={formatNum(hms.unconverted)} sub={`${unconvRate}% of encounters never became a lab order`} icon={Unlink} tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Panel className="bg-gradient-to-br from-white to-emerald-50/60" title="Orders by Hospital Location" subtitle="HMS lab orders per facility" icon={MapPin}>
          <HBarList data={hms.byLocation.map((r) => ({ ...r }))} format={formatNum} color="from-teal-400 to-teal-600" />
        </Panel>

        <Panel className="bg-gradient-to-br from-white to-amber-50/60" title="Orders by Customer Stream" subtitle="OPD, IPD and Walk-in" icon={Stethoscope}>
          <DonutBlock data={hms.byVisitType} format={formatNum} centerLabel="Lab orders" />
        </Panel>
      </div>
    </div>
  );
}
