"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

/**
 * Reusable Doccure HMS Dropdown Component
 * 
 * Supports:
 * - Simple string options: ["All", "Cardiology", "General Medicine"]
 * - Object options: [{ value: "All", label: "All Facilities (3)", badge: "3" }]
 * - Icon integration (e.g. Building2, Layers, Stethoscope)
 * - Click-outside to close
 * - Internal quick search when options > 5
 * - Checkmark indicator on active item
 */
export default function DoccureDropdown({
  label,
  icon: Icon,
  value,
  onChange,
  options = [],
  placeholder = "Select option...",
  disabled = false,
  className = "",
  size = "md", // "sm" | "md"
  compact = false, // refined 36px control used on the analytics pages
  menuAlign = "left", // "right" keeps the list inside the screen for the last filters in a row
  active = false // highlights a filter that is currently narrowing the data
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Normalize options to [{ value, label, badge, icon }]
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return {
        value: opt.value ?? opt.name ?? opt.id,
        label: opt.label ?? opt.name ?? String(opt.value),
        badge: opt.badge,
        icon: opt.icon
      };
    }
    return {
      value: opt,
      label: String(opt),
      badge: undefined,
      icon: undefined
    };
  });

  // Current selected option object
  const selectedOption = normalizedOptions.find((o) => o.value === value) || {
    value,
    label: value || placeholder
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
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
        setSearchTerm("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filter options if searching
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (optValue) => {
    onChange && onChange(optValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const isSmall = size === "sm";
  const compactCls = `w-full h-9 px-3 text-[13px] rounded-lg bg-white border transition-colors duration-150 flex items-center justify-between gap-2 text-left cursor-pointer select-none ${
    isOpen ? "border-blue-600 ring-2 ring-blue-600/15" : active ? "border-blue-300 bg-blue-50/40" : "border-slate-200 hover:border-slate-300"
  } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50" : ""}`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
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
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={compact ? compactCls : `w-full ${
          isSmall ? "h-8 px-2.5 text-xs rounded-lg" : "h-10 px-3 text-xs rounded-xl"
        } bg-gray-50 hover:bg-white focus:bg-white border transition-all flex items-center justify-between gap-2 text-left cursor-pointer select-none ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/10 bg-white"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-100" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {!label && Icon && <Icon className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />}
          <span className="font-semibold text-gray-900 truncate">
            {selectedOption.label}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 text-gray-400">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-blue-600" : ""
            }`}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className={`absolute ${menuAlign === "right" ? "right-0" : "left-0 right-0"} top-full mt-1.5 z-50 bg-white border border-gray-200/90 rounded-2xl shadow-xl overflow-hidden animate-fadeIn min-w-[200px]`}>
          {/* Quick Search inside dropdown if more than 5 options */}
          {normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Quick search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-7 pl-7 pr-7 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 font-medium"
                  autoFocus
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-gray-400">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-600 font-bold"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {opt.icon && <opt.icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                      {opt.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
