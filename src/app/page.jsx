"use client";

import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";
import DoctorDashboardHeader from "../components/DoctorDashboardHeader";
import SearchFilterConsole from "../components/SearchFilterConsole";
import SearchPromptState from "../components/SearchPromptState";
import IpdRevenueStrip from "../components/IpdRevenueStrip";
import DoccureOverview from "../components/DoccureOverview";
import DoctorPerformance from "../components/DoctorPerformance";
import DepartmentPerformance from "../components/DepartmentPerformance";
import LabsPerformance from "../components/LabsPerformance";
import PharmacyPerformance from "../components/PharmacyPerformance";
import DoctorDetailPage from "../components/DoctorDetailPage";
import { generateEncounters, formatMoney } from "../data/mockData";
import { calculateDoctorNonRevenueMetrics } from "../data/nonRevenueCalculations";

export default function Home() {
  // Master encounters dataset (lifetime history)
  const masterEncounters = useMemo(() => generateEncounters(), []);

  // Filter State
  const [filters, setFilters] = useState({
    from: "2026-10-01",
    to: "2026-10-29",
    facility: "All",
    dept: "All",
    doctor: "All",
    payMode: "All",
    service: "All",
    keyword: ""
  });

  // Controls data calculation ("after we click only the data should be shown")
  // Initial state is true so user sees instant data, but user can reset or use search console
  const [hasApplied, setHasApplied] = useState(true);

  // Sidebar collapse toggle state (false = expanded w-64, true = mini-rail w-20)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Active section (Strictly 5 main sections requested by user)
  const [activeSection, setActiveSection] = useState("overview");

  // Sync active section & doctor drawer with URL hash or query param if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const tabParam = searchParams.get("tab") || searchParams.get("section");
      const docParam = searchParams.get("doctor");
      const hash = window.location.hash.replace("#", "");
      const target = (["overview", "doctors", "departments", "labs", "pharmacy"].includes(tabParam) && tabParam) ||
                     (["overview", "doctors", "departments", "labs", "pharmacy"].includes(hash) && hash);
      if (target) {
        setActiveSection(target);
      }
      if (docParam) {
        setSelectedDoctorForDrawer(decodeURIComponent(docParam));
      }
      const handleHashChange = () => {
        const newHash = window.location.hash.replace("#", "");
        if (["overview", "doctors", "departments", "labs", "pharmacy"].includes(newHash)) {
          setActiveSection(newHash);
        }
      };
      window.addEventListener("hashchange", handleHashChange);
      return () => window.removeEventListener("hashchange", handleHashChange);
    }
  }, []);

  // Applied filters snapshot
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  // Doctor Drawer state
  const [selectedDoctorForDrawer, setSelectedDoctorForDrawer] = useState(null);

  useEffect(() => {
    if (selectedDoctorForDrawer) window.scrollTo({ top: 0 });
  }, [selectedDoctorForDrawer]);

  // Global search state in TopHeader
  const [globalSearch, setGlobalSearch] = useState("");

  // Filter change handler
  const handleChangeFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters action (Reveals / recomputes data)
  const handleApply = () => {
    setAppliedFilters({ ...filters });
    setHasApplied(true);
  };

  // Reset action (Clears filters and sets ready state)
  const handleReset = () => {
    const defaultFilters = {
      from: "2026-10-01",
      to: "2026-10-29",
      facility: "All",
      dept: "All",
      doctor: "All",
      payMode: "All",
      service: "All",
      keyword: ""
    };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setGlobalSearch("");
    setHasApplied(false); // User asked: "after we click only the data should be shown"
  };

  // Open the Departments page already filtered to one department (used by Overview drill-down)
  const handleSelectDepartment = (dept) => {
    const updated = { ...filters, dept };
    setFilters(updated);
    setAppliedFilters(updated);
    setHasApplied(true);
    setActiveSection("departments");
  };

  // Filter by doctor from drawer
  const handleFilterByDoctor = (docName) => {
    const updated = { ...filters, doctor: docName };
    setFilters(updated);
    setAppliedFilters(updated);
    setHasApplied(true);
    setSelectedDoctorForDrawer(null);
    setActiveSection("doctors");
  };

  // Compute active dataset matching appliedFilters & global search
  const filteredEncounters = useMemo(() => {
    if (!hasApplied) return [];
    return masterEncounters.filter((e) => {
      const matchFrom = !appliedFilters.from || e.date >= appliedFilters.from;
      const matchTo = !appliedFilters.to || e.date <= appliedFilters.to;
      const matchFacility = appliedFilters.facility === "All" || e.facility === appliedFilters.facility;
      const matchDept = appliedFilters.dept === "All" || e.department === appliedFilters.dept;
      const matchDoc = appliedFilters.doctor === "All" || e.doctorName === appliedFilters.doctor;
      const matchPayMode = !appliedFilters.payMode || appliedFilters.payMode === "All" || e.payMode === appliedFilters.payMode;
      const matchService = !appliedFilters.service || appliedFilters.service === "All" || e.serviceType === appliedFilters.service;
      
      const q = globalSearch.toLowerCase().trim();
      const matchGlobal = !q || 
        e.doctorName.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.facility.toLowerCase().includes(q) ||
        e.patientName.toLowerCase().includes(q) ||
        e.patientId.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q);

      return matchFrom && matchTo && matchFacility && matchDept && matchDoc && matchPayMode && matchService && matchGlobal;
    });
  }, [masterEncounters, appliedFilters, hasApplied, globalSearch]);

  // Export CSV handler across all 5 modules
  const handleExportCSV = () => {
    if (!filteredEncounters.length) return alert("No records to export. Please apply filters first.");
    let rows = [];

    if (activeSection === "doctors") {
      const docNonRev = calculateDoctorNonRevenueMetrics(filteredEncounters);
      rows = docNonRev.map(d => ({
        DoctorId: d.doctorId,
        DoctorName: d.doctorName,
        Speciality: d.department,
        Facility: d.facility,
        TotalPatientVisits: d.totalPatientVisits,
        UniquePatientsById: d.uniquePatients,
        NewPatients: d.newPatients,
        ReturningPatients: d.returningPatients,
        OperationalDays: d.operationalDays,
        AvgPatientsPerDay: d.avgPatientsPerDay,
        FollowUpsCompleted: d.followUpsCompleted,
        PrescriptionsWritten: d.prescriptionsWritten,
        LabInvestigationOrders: d.labInvestigationOrders,
        ProceduresPerformed: d.proceduresPerformed,
        ReferralsMade: d.referralsMade,
        PatientRetentionRatePct: d.patientRetentionRate,
        RepeatVisitRatePct: d.repeatVisitRate,
        SameDoctorContinuityRatePct: d.sameDoctorContinuityRate,
        AdmissionsInitiated: d.admissionsInitiated,
        OpdToIpdConversionRatePct: d.opdToIpdConversionRate
      }));
    } else if (activeSection === "departments") {
      rows = filteredEncounters.map(e => ({
        Date: e.date,
        EncounterId: e.id,
        Speciality: e.department,
        Facility: e.facility,
        Doctor: e.doctorName,
        Patient: e.patientName,
        ConsultNet: e.consultNet,
        LabNet: e.labNet,
        PharmNet: e.pharmNet,
        TotalNet: e.totalNet,
        Collected: e.collected,
        PaymentMode: e.payMode,
        Status: e.paymentStatus
      }));
    } else if (activeSection === "labs") {
      rows = filteredEncounters.filter(e => e.hasLab).map(e => ({
        Date: e.date,
        EncounterId: e.id,
        Doctor: e.doctorName,
        Speciality: e.department,
        Patient: e.patientName,
        LabGross: e.labGross,
        LabDiscount: e.labDiscount,
        LabNet: e.labNet,
        Status: e.labStatus,
        Tests: e.labTests.map(t => t.name).join(" | ")
      }));
    } else if (activeSection === "pharmacy") {
      rows = filteredEncounters.filter(e => e.hasRx).map(e => ({
        Date: e.date,
        EncounterId: e.id,
        Doctor: e.doctorName,
        Speciality: e.department,
        Patient: e.patientName,
        DrugCategory: e.drugCategory,
        PharmGross: e.pharmGross,
        PharmNet: e.pharmNet,
        Status: e.pharmStatus,
        Drugs: e.pharmDrugs.map(d => d.name).join(" | ")
      }));
    } else {
      // Overview
      rows = filteredEncounters.map(e => ({
        Date: e.date,
        EncounterId: e.id,
        Doctor: e.doctorName,
        Speciality: e.department,
        Facility: e.facility,
        Patient: e.patientName,
        ConsultationFee: e.consultNet,
        LabFee: e.labNet,
        PharmacyFee: e.pharmNet,
        TotalNetRevenue: e.totalNet,
        AmountCollected: e.collected,
        OutstandingBalance: e.outstanding,
        PaymentMode: e.payMode,
        PaymentStatus: e.paymentStatus
      }));
    }

    if (!rows.length) return alert("No rows matching current section.");
    const keys = Object.keys(rows[0]);
    const csvContent = [
      keys.join(","),
      ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `doccure-hms-${activeSection}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`min-h-screen ${activeSection === "overview" || selectedDoctorForDrawer ? "bg-gradient-to-br from-slate-50 via-blue-50/40 to-teal-50/40" : "bg-gray-50/70"} text-gray-900 flex font-sans antialiased`}>
      {/* 1. Fixed Left White Sidebar Navigation (Doccure HMS 5 Sections) */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={(sec) => { setSelectedDoctorForDrawer(null); setActiveSection(sec); }}
        hasApplied={hasApplied}
        encountersCount={filteredEncounters.length}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* 2. Main Content Area (Offset by Sidebar w-64 or w-20, min-w-0 & overflow-x-hidden to prevent page blowouts) */}
      <div className={`${isSidebarCollapsed ? "pl-20" : "pl-64"} flex-1 min-w-0 max-w-full flex flex-col min-h-screen transition-all duration-300 ease-in-out overflow-x-hidden`}>
        {/* Top Header Bar (Doccure HMS reference) */}
        <TopHeader
          activeSection={activeSection}
          onExportCSV={handleExportCSV}
          hasApplied={hasApplied}
          encountersCount={filteredEncounters.length}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          globalSearch={globalSearch}
          onGlobalSearchChange={setGlobalSearch}
        />

        {/* Dashboard Page Wrapper (100% fluid, min-w-0) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full min-w-0 max-w-full">
          {selectedDoctorForDrawer ? (
            <DoctorDetailPage
              key={selectedDoctorForDrawer}
              doctorName={selectedDoctorForDrawer}
              encounters={masterEncounters}
              defaultFrom={appliedFilters.from}
              defaultTo={appliedFilters.to}
              onClose={() => setSelectedDoctorForDrawer(null)}
            />
          ) : (
          <>
          {/* The Overview has its own header and filters; the other pages share the search console */}
          {activeSection !== "overview" && (
          <>
          <DoctorDashboardHeader
            activeSection={activeSection}
            encountersCount={filteredEncounters.length}
            onExportCSV={handleExportCSV}
          />

          {/* Separate Search Component ("we need to have a separate component search one and after we click only the data should be shown") */}
          <SearchFilterConsole
            filters={filters}
            onChangeFilter={handleChangeFilter}
            onApply={handleApply}
            onReset={handleReset}
            hasApplied={hasApplied}
            encountersCount={filteredEncounters.length}
            onExportCSV={handleExportCSV}
            activeSectionTitle={activeSection}
          />

          {hasApplied && <IpdRevenueStrip encounters={filteredEncounters} />}
          </>
          )}

          {/* Conditional Data Display: If not applied, display prompt state */}
          {activeSection === "overview" ? (
            <DoccureOverview
              encounters={masterEncounters}
              defaultFrom={appliedFilters.from}
              defaultTo={appliedFilters.to}
              onSelectDoctor={(name) => setSelectedDoctorForDrawer(name)}
              onSelectDepartment={handleSelectDepartment}
              onNavigateSection={(sec) => setActiveSection(sec)}
            />
          ) : !hasApplied ? (
            <SearchPromptState onQuickLaunch={handleApply} />
          ) : (
            <>
              {/* Section 2: Doctor Performance (Contains 3 Sub-tabs: Financial & Revenue, Clinical Workflow & Patient Volume, 16-Metric Master Matrix) */}
              {activeSection === "doctors" && (
                <DoctorPerformance
                  encounters={filteredEncounters}
                  onSelectDoctor={(name) => setSelectedDoctorForDrawer(name)}
                />
              )}

              {/* Section 3: Speciality Performance */}
              {activeSection === "departments" && (
                <DepartmentPerformance
                  encounters={filteredEncounters}
                  onSelectDoctor={(name) => setSelectedDoctorForDrawer(name)}
                />
              )}

              {/* Section 4: Labs Performance */}
              {activeSection === "labs" && (
                <LabsPerformance
                  encounters={filteredEncounters}
                  onSelectDoctor={(name) => setSelectedDoctorForDrawer(name)}
                />
              )}

              {/* Section 5: Pharmacy Performance */}
              {activeSection === "pharmacy" && (
                <PharmacyPerformance
                  encounters={filteredEncounters}
                  onSelectDoctor={(name) => setSelectedDoctorForDrawer(name)}
                />
              )}
            </>
          )}
          </>
          )}
        </main>

        {/* Clean Footer */}
        <footer className="bg-white border-t border-gray-200/90 py-4 px-6 text-center text-xs text-gray-400 mt-auto">
          Doccure HMS · Enterprise Doctor Performance & Clinical Governance Intelligence Platform
        </footer>
      </div>
    </div>
  );
}
