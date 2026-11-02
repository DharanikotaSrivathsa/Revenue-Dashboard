"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Clock,
  Sparkles
} from "lucide-react";

/**
 * Reusable Doccure HMS Calendar & DatePicker Component
 * 
 * Features:
 * - Clean Doccure input pill showing formatted date (e.g. "01 Oct 2026")
 * - Interactive calendar grid popup with smooth month/year navigation
 * - Quick preset jumpers: Today, Start of Month, End of Month
 * - Click outside to dismiss
 * - Keyboard support
 * - Output format: "YYYY-MM-DD" matching HTML5 date standard
 */
export default function DoccureDatePicker({
  label,
  icon: Icon = CalendarIcon,
  value = "2026-10-01",
  onChange,
  min,
  max,
  className = "",
  placeholder = "Select date...",
  compact = false, // refined 36px control used on the analytics pages
  active = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse current value into year, month (0-11), date
  const parseDate = (str) => {
    if (!str) return new Date();
    const [y, m, d] = str.split("-").map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const currentDateObj = parseDate(value);

  // Calendar view state (which month and year the popup is currently looking at)
  const [viewYear, setViewYear] = useState(currentDateObj.getFullYear() || 2026);
  const [viewMonth, setViewMonth] = useState(currentDateObj.getMonth() ?? 9); // 0-indexed, 9 = October

  // Sync view when external value changes
  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Month Names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthShortNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Navigate Months
  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Format date helper: YYYY-MM-DD
  const formatYMD = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // Format readable display e.g. "01 Oct 2026"
  const formatDisplay = (ymdStr) => {
    if (!ymdStr) return placeholder;
    const parts = ymdStr.split("-");
    if (parts.length !== 3) return ymdStr;
    const y = parts[0];
    const m = parseInt(parts[1], 10) - 1;
    const d = parts[2];
    return `${d} ${monthShortNames[m] || ""} ${y}`;
  };

  // Build calendar days for viewMonth and viewYear
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y, m) => new Date(y, m, 1).getDay(); // 0 = Sunday

  const daysInCurrentMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
  const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);

  // Generate calendar grid array
  const calendarCells = [];

  // Trailing days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      year: viewMonth === 0 ? viewYear - 1 : viewYear,
      month: viewMonth === 0 ? 11 : viewMonth - 1
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    calendarCells.push({
      day: d,
      isCurrentMonth: true,
      year: viewYear,
      month: viewMonth
    });
  }

  // Next month leading days to complete 35 or 42 cells
  const remainingCells = 35 - calendarCells.length;
  const paddingCount = remainingCells >= 0 ? remainingCells : 42 - calendarCells.length;
  for (let i = 1; i <= paddingCount; i++) {
    calendarCells.push({
      day: i,
      isCurrentMonth: false,
      year: viewMonth === 11 ? viewYear + 1 : viewYear,
      month: viewMonth === 11 ? 0 : viewMonth + 1
    });
  }

  const handleSelectDay = (y, m, d) => {
    const formatted = formatYMD(y, m, d);
    onChange && onChange(formatted);
    setIsOpen(false);
  };

  const handlePreset = (type) => {
    if (type === "today") {
      const now = new Date();
      handleSelectDay(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (type === "start-month") {
      handleSelectDay(viewYear, viewMonth, 1);
    } else if (type === "end-month") {
      handleSelectDay(viewYear, viewMonth, daysInCurrentMonth);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Optional Top Label */}
      {label && (
        <label className={compact ? "block text-xs font-medium text-slate-500 mb-1.5 select-none" : "block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1 select-none"}>
          {Icon && !compact && <Icon className="w-3 h-3 text-blue-600 flex-shrink-0" />}
          <span>{label}</span>
        </label>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={compact
          ? `w-full h-9 px-3 bg-white border rounded-lg text-[13px] font-normal text-slate-900 transition-colors duration-150 flex items-center justify-between gap-2 text-left cursor-pointer select-none ${isOpen ? "border-blue-600 ring-2 ring-blue-600/15" : active ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:border-slate-300"}`
          : `w-full h-10 px-3 bg-gray-50 hover:bg-white focus:bg-white border rounded-xl text-xs font-semibold text-gray-900 transition-all flex items-center justify-between gap-2 text-left cursor-pointer select-none ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/10 bg-white"
            : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <CalendarIcon className={`w-3.5 h-3.5 flex-shrink-0 ${compact ? "text-slate-400" : "text-blue-600"}`} />
          <span className={`${compact ? "font-normal" : "font-semibold"} text-gray-900 truncate`}>
            {formatDisplay(value)}
          </span>
        </div>

        {!compact && (
          <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            Pick
          </span>
        )}
      </button>

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-gray-200/90 rounded-2xl shadow-2xl p-4 w-72 animate-fadeIn select-none">
          {/* Calendar Header: Month, Year, and Nav Arrows */}
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
            <button
              type="button"
              onClick={prevMonth}
              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-xs font-bold text-gray-900 flex items-center gap-1">
              <span>{monthNames[viewMonth]}</span>
              <span className="text-blue-600">{viewYear}</span>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-gray-400 mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarCells.map((cell, idx) => {
              const cellYMD = formatYMD(cell.year, cell.month, cell.day);
              const isSelected = cellYMD === value;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30 scale-105"
                      : cell.isCurrentMonth
                      ? "text-gray-800 hover:bg-blue-50 hover:text-blue-600"
                      : "text-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Quick Presets & Shortcuts */}
          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset("start-month")}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 font-semibold transition-colors cursor-pointer"
              >
                1st of Mo
              </button>
              <button
                type="button"
                onClick={() => handlePreset("end-month")}
                className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 font-semibold transition-colors cursor-pointer"
              >
                End of Mo
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 font-semibold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
