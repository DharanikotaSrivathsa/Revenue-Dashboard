"use client";

import React, { useMemo, useState } from "react";
import { IndianRupee, Pill, PiggyBank, ShoppingBag } from "lucide-react";
import { computePharmacyAnalytics } from "../data/pharmacyAnalytics";
import RevenueTab from "./pharmacy/RevenueTab";
import MedicineTab from "./pharmacy/MedicineTab";
import ProfitTab from "./pharmacy/ProfitTab";
import OrdersTab from "./pharmacy/OrdersTab";

const TABS = [
  { key: "revenue", label: "Revenue & Sales", short: "Revenue", icon: IndianRupee },
  { key: "medicine", label: "Medicine & Product", short: "Medicine", icon: Pill },
  { key: "profit", label: "Profit & Margin", short: "Profit", icon: PiggyBank },
  { key: "orders", label: "Order & Channel", short: "Orders", icon: ShoppingBag },
];

export default function PharmacyPerformance({ encounters = [] }) {
  const [tab, setTab] = useState("revenue");
  const data = useMemo(() => computePharmacyAnalytics(encounters), [encounters]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="sticky top-0 z-10 -mx-1 px-1 py-2 bg-slate-50">
        <div role="tablist" className="flex gap-1 p-1 rounded-2xl bg-white border border-gray-200 shadow-sm overflow-x-auto">
          {TABS.map((t, i) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  active ? "bg-amber-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] ${active ? "bg-white/25" : "bg-gray-100 text-gray-500"}`}>{i + 1}</span>
                <t.icon className="w-4 h-4 hidden sm:block" />
                <span className="hidden md:inline">{t.label}</span>
                <span className="md:hidden">{t.short}</span>
              </button>
            );
          })}
        </div>
      </div>

      {tab === "revenue" && <RevenueTab data={data} />}
      {tab === "medicine" && <MedicineTab data={data} />}
      {tab === "profit" && <ProfitTab data={data} />}
      {tab === "orders" && <OrdersTab data={data} />}
    </div>
  );
}
