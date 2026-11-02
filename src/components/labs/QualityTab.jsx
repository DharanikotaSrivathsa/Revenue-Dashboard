"use client";

import React from "react";
import { Percent, AlertTriangle, Repeat2, Ban, PieChart as PieIcon, Sparkles } from "lucide-react";
import { formatNum } from "../../data/mockData";
import { KpiCard, Panel, DonutBlock, Hero, HBarList } from "./LabUi";

export default function QualityTab({ data }) {
  const { quality, orders } = data;
  const tests = orders.testsPerformed;
  const acceptance = 100 - quality.rejectionRate;
  const abnormalPct = tests > 0 ? (quality.abnormal / tests) * 100 : 0;
  const firstPass = tests > 0 ? 100 - (quality.retests / tests) * 100 : 100;

  return (
    <div className="space-y-6">
      <Hero
        badge="Quality Health" icon={Sparkles} title="Diagnostic Quality Scorecard"
        description="How cleanly samples are accepted, results come out first time, and tests land in the normal range."
        rings={[
          { id: "acc", value: acceptance, label: "Sample Acceptance", sub: `${orders.samplesRejected} rejected`, from: "#5eead4", to: "#22d3ee" },
          { id: "fp", value: firstPass, label: "First-pass Rate", sub: `${quality.retests} retests`, from: "#a5b4fc", to: "#e879f9" },
          { id: "norm", value: 100 - abnormalPct, label: "Normal Results", sub: `${quality.abnormal} abnormal`, from: "#fde68a", to: "#fb923c" },
        ]}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard solid tone="rose" label="Sample Rejection Rate" value={`${quality.rejectionRate.toFixed(1)}%`} sub={`${orders.samplesRejected} of ${orders.samplesCollected} samples`} icon={Percent} />
        <KpiCard solid tone="amber" label="Abnormal Results" value={formatNum(quality.abnormal)} sub={`${abnormalPct.toFixed(1)}% of tests performed`} icon={AlertTriangle} />
        <KpiCard solid tone="indigo" label="Repeat / Retest Count" value={formatNum(quality.retests)} sub="Tests repeated" icon={Repeat2} />
        <KpiCard solid tone="violet" label="Cancelled Orders" value={formatNum(quality.cancelled)} sub="Total cancelled lab orders" icon={Ban} />
      </div>

      <Panel className="bg-gradient-to-br from-white via-white to-rose-50/60" title="Sample Rejection Reasons" subtitle="Why collected samples were rejected" icon={PieIcon}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <DonutBlock data={quality.reasons} format={formatNum} centerLabel="Rejected" />
          <HBarList data={quality.reasons} format={formatNum} color="from-rose-400 to-fuchsia-500" />
        </div>
      </Panel>
    </div>
  );
}
