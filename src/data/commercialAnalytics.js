// Commercial Analytics & Top Performer Calculations for Doccure HMS Revenue Platform

export const NAMED_PROCEDURES = [
  { name: "2D Echocardiography & Color Doppler", department: "Cardiology", avgPrice: 3200, category: "Diagnostic Procedure" },
  { name: "Coronary Angiography (CAG)", department: "Cardiology", avgPrice: 14500, category: "Interventional Procedure" },
  { name: "Laparoscopic Cholecystectomy", department: "General Surgery", avgPrice: 38000, category: "Surgical Procedure" },
  { name: "Endoscopic Gastroscopy", department: "General Medicine", avgPrice: 4800, category: "Diagnostic Procedure" },
  { name: "Hemodialysis Session (High-Flux)", department: "General Medicine", avgPrice: 2400, category: "Therapeutic Procedure" },
  { name: "Knee Joint Infiltration & PRP Therapy", department: "Orthopedics", avgPrice: 5500, category: "Therapeutic Procedure" },
  { name: "Skin Lesion Excision & Biopsy", department: "Dermatology", avgPrice: 2800, category: "Minor Procedure" },
  { name: "Wound Debridement & Suturing", department: "General Surgery", avgPrice: 1800, category: "Minor Procedure" }
];

export const NAMED_MEDICATIONS = [
  { name: "Augmentin 625mg (Amox/Clav)", category: "Antibiotics & Anti-infectives", code: "AB", unitMRP: 220, wholesaleCost: 145, marginPct: 34 },
  { name: "Lipitor 20mg (Atorvastatin)", category: "Cardiovascular & Antihypertensives", code: "CV", unitMRP: 185, wholesaleCost: 128, marginPct: 31 },
  { name: "Telmisartan 40mg + Amlodipine 5mg", category: "Cardiovascular & Antihypertensives", code: "CV", unitMRP: 160, wholesaleCost: 112, marginPct: 30 },
  { name: "Paracetamol 1000mg IV Infusion", category: "Analgesics & Anti-inflammatory", code: "PA", unitMRP: 280, wholesaleCost: 180, marginPct: 36 },
  { name: "Pantoprazole 40mg IV Injection", category: "Gastrointestinal & Acid Reflux", code: "GI", unitMRP: 140, wholesaleCost: 88, marginPct: 37 },
  { name: "Metformin 500mg SR (Glucophage)", category: "Endocrinology & Diabetes", code: "ED", unitMRP: 95, wholesaleCost: 62, marginPct: 35 },
  { name: "Azithromycin 500mg Tablets", category: "Antibiotics & Anti-infectives", code: "AB", unitMRP: 155, wholesaleCost: 102, marginPct: 34 },
  { name: "Vitamin D3 60,000 IU Oral Solution", category: "Vitamins, Minerals & Supplements", code: "VM", unitMRP: 120, wholesaleCost: 65, marginPct: 46 }
];

export const NAMED_PACKAGES = [
  { name: "Master Executive Health Checkup", price: 6500, code: "PKG-EXE", description: "Comprehensive 48-parameter executive screening" },
  { name: "Comprehensive Cardiac Wellness Package", price: 8200, code: "PKG-CARD", description: "TMT, Echo, Lipid profile, and specialist consult" },
  { name: "Diabetic Annual Care Package", price: 4200, code: "PKG-DIAB", description: "HbA1c, Fundus exam, microalbumin & dietetics" },
  { name: "Well-Woman Preventive Screening", price: 5400, code: "PKG-WOMAN", description: "Mammogram/USG, Pap smear & hormonal panel" },
  { name: "Senior Citizen Full-Body Health Panel", price: 7800, code: "PKG-SNR", description: "Bone density, renal panel & geriatric consultation" }
];

export function calculateCommercialAnalytics(encounters = []) {
  if (!encounters || encounters.length === 0) {
    return {
      topDoctors: [],
      topLabTests: [],
      topMedications: [],
      topProcedures: [],
      topPackages: [],
      topDepartments: [],
      pareto: { topDoctorsPct: 0, topProductsPct: 0 }
    };
  }

  // 1. TOP PERFORMING DOCTORS (COMMERCIAL REVENUE LEADERBOARD)
  const doctorMap = {};
  encounters.forEach((e) => {
    const docName = e.doctorName;
    if (!doctorMap[docName]) {
      doctorMap[docName] = {
        name: docName,
        id: e.doctorId,
        department: e.department,
        facility: e.facility,
        invoicedRevenue: 0,
        realizedCollections: 0,
        outstandingArrears: 0,
        consultBillings: 0,
        procedureBillings: 0,
        labOrderYield: 0,
        pharmacyYield: 0,
        transactionCount: 0,
        completedConsults: 0,
        proceduresCount: 0,
        labOrdersCount: 0,
        rxCount: 0
      };
    }

    const d = doctorMap[docName];
    d.invoicedRevenue += e.totalNet || 0;
    d.realizedCollections += e.collected || 0;
    d.outstandingArrears += e.outstanding || 0;
    d.consultBillings += e.consultNet || 0;
    d.procedureBillings += e.procNet || 0;
    d.labOrderYield += e.labNet || 0;
    d.pharmacyYield += e.pharmNet || 0;
    d.transactionCount += 1;
    if (e.consultStatus === "Completed") d.completedConsults += 1;
    if (e.hasProcedure && e.procStatus === "Completed") d.proceduresCount += 1;
    if (e.hasLab && e.labStatus === "Completed") d.labOrdersCount += 1;
    if (e.hasRx && e.pharmStatus === "Dispensed") d.rxCount += 1;
  });

  const totalHospitalNet = encounters.reduce((s, e) => s + e.totalNet, 0);

  const topDoctors = Object.values(doctorMap)
    .map((d) => {
      const realizationRate = d.invoicedRevenue > 0 ? Math.round((d.realizedCollections / d.invoicedRevenue) * 100) : 0;
      const shareOfHospital = totalHospitalNet > 0 ? Math.round((d.invoicedRevenue / totalHospitalNet) * 100) : 0;
      const avgTicket = d.transactionCount > 0 ? Math.round(d.invoicedRevenue / d.transactionCount) : 0;
      const ecosystemValue = d.consultBillings + d.procedureBillings + d.labOrderYield + d.pharmacyYield;

      let tier = "Core Contributor";
      if (d.invoicedRevenue > 90000) tier = "Elite Revenue Leader";
      else if (d.invoicedRevenue > 75000) tier = "High Performer";

      return {
        ...d,
        realizationRate,
        shareOfHospital,
        avgTicket,
        ecosystemValue,
        tier
      };
    })
    .sort((a, b) => b.invoicedRevenue - a.invoicedRevenue)
    .map((d, index) => ({ ...d, rank: index + 1 }));

  // 2. TOP LAB TESTS SOLD (COMMERCIAL LAB CATALOG)
  const labTestMap = {};
  encounters.forEach((e) => {
    if (e.hasLab && e.labTests && Array.isArray(e.labTests)) {
      e.labTests.forEach((t) => {
        if (!labTestMap[t.name]) {
          labTestMap[t.name] = {
            name: t.name,
            code: t.code || "LAB",
            category: t.category || "General Lab",
            basePrice: t.basePrice || 500,
            unitsSold: 0,
            revenueGenerated: 0
          };
        }
        labTestMap[t.name].unitsSold += 1;
        // In settled state or requisition state
        const testRev = e.labStatus === "Completed" ? (t.basePrice || 500) : Math.round((t.basePrice || 500) * 0.8);
        labTestMap[t.name].revenueGenerated += testRev;
      });
    }
  });

  const totalLabRev = Object.values(labTestMap).reduce((s, t) => s + t.revenueGenerated, 0);
  const topLabTests = Object.values(labTestMap)
    .map((t) => ({
      ...t,
      sharePct: totalLabRev > 0 ? Math.round((t.revenueGenerated / totalLabRev) * 100) : 0,
      avgPrice: t.unitsSold > 0 ? Math.round(t.revenueGenerated / t.unitsSold) : t.basePrice
    }))
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
    .map((t, index) => ({ ...t, rank: index + 1 }));

  // 3. TOP PHARMACY MEDICATIONS SOLD
  const totalPharmNet = encounters.reduce((s, e) => s + (e.pharmNet || 0), 0);
  const topMedications = NAMED_MEDICATIONS.map((med, idx) => {
    // Deterministic share based on idx
    const factor = [0.22, 0.18, 0.15, 0.14, 0.11, 0.08, 0.07, 0.05][idx] || 0.05;
    const revenue = Math.round(totalPharmNet * factor);
    const units = Math.max(12, Math.round(revenue / med.unitMRP));
    const cogs = Math.round(units * med.wholesaleCost);
    const grossProfit = Math.max(0, revenue - cogs);
    const marginPct = revenue > 0 ? Math.round((grossProfit / revenue) * 100) : med.marginPct;

    return {
      name: med.name,
      category: med.category,
      code: med.code,
      unitMRP: med.unitMRP,
      unitsSold: units,
      revenueGenerated: revenue,
      cogs,
      grossProfit,
      marginPct,
      sharePct: Math.round(factor * 100)
    };
  })
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
    .map((m, index) => ({ ...m, rank: index + 1 }));

  // 4. TOP PROCEDURES & TREATMENTS SOLD
  const totalProcNet = encounters.reduce((s, e) => s + (e.procNet || 0), 0);
  const topProcedures = NAMED_PROCEDURES.map((proc, idx) => {
    const factor = [0.28, 0.22, 0.18, 0.12, 0.09, 0.05, 0.03, 0.03][idx] || 0.05;
    const revenue = Math.round(totalProcNet * factor);
    const count = Math.max(2, Math.round(revenue / proc.avgPrice));

    return {
      name: proc.name,
      department: proc.department,
      category: proc.category,
      avgPrice: proc.avgPrice,
      volumeCompleted: count,
      revenueGenerated: revenue,
      sharePct: Math.round(factor * 100)
    };
  })
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
    .map((p, index) => ({ ...p, rank: index + 1 }));

  // 5. TOP HEALTH PACKAGES SOLD
  const totalPkgNet = encounters.filter(e => e.invoiceType === "PACKAGE").reduce((s, e) => s + e.totalNet, 0) || 38904;
  const topPackages = NAMED_PACKAGES.map((pkg, idx) => {
    const factor = [0.35, 0.28, 0.16, 0.12, 0.09][idx] || 0.1;
    const revenue = Math.round(totalPkgNet * factor);
    const units = Math.max(1, Math.round(revenue / pkg.price));

    return {
      name: pkg.name,
      code: pkg.code,
      description: pkg.description,
      price: pkg.price,
      unitsSold: units,
      revenueGenerated: revenue,
      sharePct: Math.round(factor * 100)
    };
  })
    .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
    .map((pkg, index) => ({ ...pkg, rank: index + 1 }));

  // 6. TOP PERFORMING DEPARTMENTS
  const deptMap = {};
  encounters.forEach((e) => {
    const dept = e.department;
    if (!deptMap[dept]) {
      deptMap[dept] = {
        name: dept,
        revenue: 0,
        collected: 0,
        outstanding: 0,
        encountersCount: 0
      };
    }
    deptMap[dept].revenue += e.totalNet || 0;
    deptMap[dept].collected += e.collected || 0;
    deptMap[dept].outstanding += e.outstanding || 0;
    deptMap[dept].encountersCount += 1;
  });

  const topDepartments = Object.values(deptMap)
    .map((d) => ({
      ...d,
      sharePct: totalHospitalNet > 0 ? Math.round((d.revenue / totalHospitalNet) * 100) : 0,
      recoveryRate: d.revenue > 0 ? Math.round((d.collected / d.revenue) * 100) : 0,
      avgTicket: d.encountersCount > 0 ? Math.round(d.revenue / d.encountersCount) : 0
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((d, index) => ({ ...d, rank: index + 1 }));

  // Pareto Concentration (Top 2 Doctors share)
  const top2DocsRev = topDoctors.slice(0, 2).reduce((s, d) => s + d.invoicedRevenue, 0);
  const topDoctorsParetoPct = totalHospitalNet > 0 ? Math.round((top2DocsRev / totalHospitalNet) * 100) : 0;

  return {
    topDoctors,
    topLabTests,
    topMedications,
    topProcedures,
    topPackages,
    topDepartments,
    pareto: {
      topDoctorsParetoPct,
      top2DocsRev,
      totalHospitalNet
    }
  };
}
