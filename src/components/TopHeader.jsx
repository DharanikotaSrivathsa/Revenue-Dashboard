"use client";

import React from "react";
import { 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Search,
  Bell,
  ChevronDown,
  Download
} from "lucide-react";

export default function TopHeader({ 
  activeSection = "overview", 
  hasApplied, 
  encountersCount = 0,
  isSidebarCollapsed,
  onToggleSidebar,
  globalSearch = "",
  onGlobalSearchChange
}) {
  const sectionBreadcrumbs = {
    overview: "Hospital Overview",
    doctors: "Doctor Performance",
    departments: "Department Performance",
    labs: "Labs Performance",
    pharmacy: "Pharmacy Performance"
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs w-full min-w-0">
      {/* 1. Left Cluster: Sidebar Toggle + Breadcrumbs + Search Input */}
      <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 shadow-2xs flex-shrink-0"
          title={isSidebarCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-600" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Compact Breadcrumb Path */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium flex-shrink-0">
          <span className="text-gray-400">Dashboard</span>
          <ChevronRight className="w-3 h-3 text-gray-300" />
          <span className="font-bold text-gray-900">
            {sectionBreadcrumbs[activeSection] || "Overview"}
          </span>
        </div>

        {/* Doccure Global Search Bar */}
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search records..."
            value={globalSearch}
            onChange={(e) => onGlobalSearchChange && onGlobalSearchChange(e.target.value)}
            className="w-full h-8 pl-8 pr-8 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-gray-400 font-medium"
          />
          <div className="absolute right-2 top-2 px-1 py-0.5 rounded text-[9px] font-bold text-gray-400 bg-gray-200/60 border border-gray-300/60 pointer-events-none">
            ⌘K
          </div>
        </div>
      </div>

      {/* 2. Right Cluster: Decluttered & Streamlined with Screenshot ZIP Download */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Direct Download Screenshots ZIP Link */}
        <a
          href="/doccure_hospital_dashboard_full_screenshots.zip"
          download="doccure_hospital_dashboard_full_screenshots.zip"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          title="Download all 13 dashboard full-page screenshots in a ZIP file"
        >
          <Download className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span className="hidden sm:inline">Download Screenshots (.ZIP)</span>
          <span className="sm:hidden">ZIP</span>
        </a>

        {/* Live Active Pill */}
        {hasApplied && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{encountersCount} Active</span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative cursor-pointer p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border border-gray-200 shadow-2xs">
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            4
          </span>
        </div>

        {/* Doctor Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-200 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all shadow-2xs flex-shrink-0">
            AM
          </div>
          <div className="hidden md:block text-left min-w-0">
            <div className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              Dr. Angela Merkel
            </div>
            <div className="text-[10px] text-gray-400 font-semibold truncate leading-tight">
              Chief Physician
            </div>
          </div>
          <ChevronDown className="w-3 h-3 text-gray-400 hidden md:block" />
        </div>
      </div>
    </header>
  );
}
