"use client";

import React, { useMemo, useState } from "react";
import { IndianRupee, ClipboardList, ShieldCheck, Network } from "lucide-react";
import { computeLabAnalytics } from "../data/labAnalytics";
import RevenueTab from "./labs/RevenueTab";
import OrdersTab from "./labs/OrdersTab";
import QualityTab from "./labs/QualityTab";
import HmsTab from "./labs/HmsTab";

const TABS = [
  { key: "revenue", label: "Revenue Performance", short: "Revenue", icon: IndianRupee },
  { key: "orders", label: "Order & Workflow", short: "Orders", icon: ClipboardList },
  { key: "quality", label: "Quality Performance", short: "Quality", icon: ShieldCheck },
  { key: "hms", label: "HMS Integration", short: "HMS", icon: Network },
];

export default function LabsPerformance({ encounters = [], onSelectDoctor }) {
  const [tab, setTab] = useState("revenue");
  const data = useMemo(() => computeLabAnalytics(encounters), [encounters]);

  // Extract all encounters with lab investigations
  const labEncounters = useMemo(() => {
    return encounters.filter(e => e.hasLab);
  }, [encounters]);

  // Production Revenue Metrics calculation
  const stats = useMemo(() => {
    const totalReceipts = labEncounters.length;
    const completedEncounters = labEncounters.filter(e => e.labStatus === "Completed");
    const completed = completedEncounters.length;
    const pending = labEncounters.filter(e => e.labStatus === "Pending").length;
    const cancelled = labEncounters.filter(e => e.labStatus === "Cancelled").length;

    // Total Requisitions Pipeline (All 122 orders)
    const pipelineGross = labEncounters.reduce((s, e) => s + (e.labGross || 0), 0);
    const pendingGross = labEncounters.filter(e => e.labStatus === "Pending").reduce((s, e) => s + (e.labGross || 0), 0);
    const cancelledGross = labEncounters.filter(e => e.labStatus === "Cancelled").reduce((s, e) => s + (e.labGross || 0), 0);

    // Revenue recognized on checkout receipts (lab_order_receipt):
    // 1. Gross MRP of billed receipts
    const grossMRP = completedEncounters.reduce((s, e) => s + (e.labGross || 0), 0);
    // 2. Discounts on billed receipts: pack discount + manual additional discount
    const packDiscount = completedEncounters.reduce((s, e) => s + (e.labPackDiscount || Math.round((e.labDiscount || 0) * 0.65)), 0);
    const manualDiscount = completedEncounters.reduce((s, e) => s + (e.labManualDiscount || Math.max(0, (e.labDiscount || 0) - packDiscount)), 0);
    const totalDiscounts = packDiscount + manualDiscount;
    // 3. Collected at checkout (receipt.total_price = gross - discounts)
    const collectedReceipts = grossMRP - totalDiscounts;
    // 4. Refunds on completed receipts
    const refunds = completedEncounters.reduce((s, e) => s + (e.labRefund || 0), 0);
    // 5. Net Labs Revenue = Collected - Refunds
    const netLabsRevenue = collectedReceipts - refunds;

    // Source Breakdown: MANUAL (Walk-in), OPENMRS_ORDER (OPD Doctor Queue), PACKAGE_PAID
    const walkInEncounters = labEncounters.filter(e => e.labSource === "MANUAL");
    const walkInRevenue = walkInEncounters.reduce((s, e) => s + (e.labNet || 0), 0);

    const doctorOrderEncounters = labEncounters.filter(e => e.labSource === "OPENMRS_ORDER" || !e.labSource || e.labSource === "N/A");
    const doctorOrderRevenue = doctorOrderEncounters.reduce((s, e) => s + (e.labNet || 0), 0);

    const packagePaidCount = labEncounters.filter(e => e.isPackagePaid || e.labSource === "PACKAGE_PAID").length;

    // Profiles vs Individual Tests (Trap 1 avoidance)
    const profilesCount = labEncounters.filter(e => e.labType === "PROFILE_BUNDLE" || (e.labTests && e.labTests.length > 1)).length;
    const singleTestsCount = totalReceipts - profilesCount;

    const completionRate = totalReceipts > 0 ? Math.round((completed / totalReceipts) * 100) : 0;
    const avgReceiptValue = completed > 0 ? Math.round(netLabsRevenue / completed) : 0;

    return {
      totalReceipts,
      completed,
      pending,
      cancelled,
      pipelineGross,
      pendingGross,
      cancelledGross,
      grossMRP,
      packDiscount,
      manualDiscount,
      totalDiscounts,
      collectedReceipts,
      refunds,
      netLabsRevenue,
      walkInRevenue,
      walkInCount: walkInEncounters.length,
      doctorOrderRevenue,
      doctorOrderCount: doctorOrderEncounters.length,
      packagePaidCount,
      profilesCount,
      singleTestsCount,
      completionRate,
      avgReceiptValue
    };
  }, [labEncounters]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-slate-50/90 backdrop-blur">
        <div role="tablist" className="flex gap-1 p-1 rounded-2xl bg-white border border-gray-200/80 shadow-sm overflow-x-auto">
          {TABS.map((t, i) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  active
                    ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${active ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                <t.icon className="w-4 h-4 hidden sm:block" />
                <span className="hidden md:inline">{t.label}</span>
                <span className="md:hidden">{t.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "revenue" && <RevenueTab stats={stats} data={data} />}
      {tab === "orders" && <OrdersTab data={data} />}
      {tab === "quality" && <QualityTab data={data} />}
      {tab === "hms" && <HmsTab data={data} />}
    </div>
  );
}
