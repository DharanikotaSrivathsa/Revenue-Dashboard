"use client";

import React from "react";
import { 
  LayoutDashboard, 
  Stethoscope, 
  Building2, 
  FlaskConical, 
  Pill, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  HelpCircle,
  Headphones,
  LogOut,
  Activity
} from "lucide-react";

export default function Sidebar({ 
  activeSection, 
  onSelectSection, 
  hasApplied, 
  encountersCount = 0,
  isCollapsed = false,
  onToggleCollapse
}) {
  // Strictly the 5 main sections requested by user
  const mainNav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "doctors", label: "Doctor Performance", icon: Stethoscope },
    { id: "departments", label: "Speciality Performance", icon: Building2 },
    { id: "labs", label: "Labs Performance", icon: FlaskConical },
    { id: "pharmacy", label: "Pharmacy Performance", icon: Pill },
  ];

  return (
    <aside 
      className={`bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-40 border-r border-slate-800 shadow-xl select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* 1. Brand Header with Doccure Circular Collapse Button */}
      <div className={`h-16 border-b border-slate-800 bg-slate-950/60 flex items-center transition-all ${
        isCollapsed ? "px-3 justify-center" : "px-5 justify-between"
      } relative`}>
        <div 
          onClick={() => onSelectSection("overview")} 
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
        >
          {/* Doccure Stethoscope Emblem */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base tracking-tight text-white">
                  SRIVATHSA <span className="text-cyan-400">HMS</span>
                </span>
                <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">Apollo Health System</p>
            </div>
          )}
        </div>

        {/* Circular Collapse Toggle Button (Exact Doccure HMS Style) */}
        <button
          onClick={onToggleCollapse}
          className={`w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all cursor-pointer z-50 ${
            isCollapsed 
              ? "absolute -right-3.5 top-5" 
              : ""
          }`}
          title={isCollapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Navigation Menu (5 Clean Sections) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Healthcare Operations
            </div>
          )}
          <nav className="space-y-1.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center ${isCollapsed ? "justify-center px-2 py-3" : "gap-3 px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Operational Status Footer (From Doccure HMS reference) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 text-xs">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 py-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="Hospital Online" />
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Hospital Online 81% load card */}
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white leading-tight truncate">
                    Hospital Online
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    81% load · 3 campuses
                  </div>
                </div>
              </div>
              <span className="text-[9px] font-extrabold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Live
              </span>
            </div>

            {/* Help, Support, Logout row */}
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-slate-400">
              <button className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                <span>Help</span>
              </button>
              <button className="hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer">
                <Headphones className="w-3 h-3 text-slate-400" />
                <span>Support</span>
              </button>
              <button 
                onClick={onToggleCollapse}
                className="hover:text-cyan-400 font-semibold cursor-pointer"
              >
                Mini-Rail ◀
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
