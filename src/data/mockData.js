// Mock Clinical and Financial Dataset for Healthcare Enterprise

export const DOCTORS = [
  { id: "DOC-1", name: "Dr. Asha Rao", dept: "General Medicine", facility: "Central Hospital", experience: "14 yrs", opdRoom: "Room 102" },
  { id: "DOC-2", name: "Dr. Rahul Varma", dept: "Cardiology", facility: "Central Hospital", experience: "18 yrs", opdRoom: "Room 205" },
  { id: "DOC-3", name: "Dr. Meera Nair", dept: "Orthopedics", facility: "North Clinic", experience: "11 yrs", opdRoom: "Room 108" },
  { id: "DOC-4", name: "Dr. Kiran Reddy", dept: "Gynecology", facility: "South Clinic", experience: "15 yrs", opdRoom: "Room 301" },
  { id: "DOC-5", name: "Dr. Priya Shah", dept: "Dermatology", facility: "North Clinic", experience: "9 yrs", opdRoom: "Room 104" },
  { id: "DOC-6", name: "Dr. Vivek Kumar", dept: "General Medicine", facility: "South Clinic", experience: "12 yrs", opdRoom: "Room 110" }
];

export const FACILITIES = ["Central Hospital", "North Clinic", "South Clinic"];

export const DEPARTMENTS = [
  { name: "General Medicine", head: "Dr. Asha Rao", bedCapacity: 60, opdCount: 4 },
  { name: "Cardiology", head: "Dr. Rahul Varma", bedCapacity: 45, opdCount: 3 },
  { name: "Orthopedics", head: "Dr. Meera Nair", bedCapacity: 35, opdCount: 2 },
  { name: "Gynecology", head: "Dr. Kiran Reddy", bedCapacity: 40, opdCount: 2 },
  { name: "Dermatology", head: "Dr. Priya Shah", bedCapacity: 10, opdCount: 2 }
];
export const SPECIALITIES = DEPARTMENTS;

export const LAB_TEST_TYPES = [
  { code: "L01", name: "Complete Blood Count (CBC)", category: "Hematology", basePrice: 450, avgTurnaroundMins: 45 },
  { code: "L02", name: "Comprehensive Metabolic Panel", category: "Biochemistry", basePrice: 1200, avgTurnaroundMins: 90 },
  { code: "L03", name: "Lipid Profile & Atherogenic Index", category: "Biochemistry", basePrice: 950, avgTurnaroundMins: 60 },
  { code: "L04", name: "12-Lead Electrocardiogram (ECG)", category: "Cardiology Lab", basePrice: 650, avgTurnaroundMins: 30 },
  { code: "L05", name: "Digital Chest X-Ray (PA)", category: "Radiology", basePrice: 850, avgTurnaroundMins: 40 },
  { code: "L06", name: "HbA1c Glycated Hemoglobin", category: "Biochemistry", basePrice: 750, avgTurnaroundMins: 60 },
  { code: "L07", name: "Thyroid Profile (TSH, T3, T4)", category: "Endocrinology", basePrice: 1100, avgTurnaroundMins: 120 },
  { code: "L08", name: "Abdominal & Pelvic Ultrasound", category: "Radiology", basePrice: 2200, avgTurnaroundMins: 75 }
];

export const DRUG_CATEGORIES = [
  { name: "Cardiovascular & Antihypertensives", code: "CV", marginPct: 28 },
  { name: "Antibiotics & Anti-infectives", code: "AB", marginPct: 32 },
  { name: "Analgesics & Anti-inflammatory", code: "PA", marginPct: 35 },
  { name: "Dermatological & Topical Agents", code: "DM", marginPct: 40 },
  { name: "Vitamins, Minerals & Supplements", code: "VM", marginPct: 45 }
];

export const PATIENTS_LIST = Array.from({ length: 90 }, (_, i) => ({
  id: "PT" + (1001 + i),
  name: ["Ananya Sharma", "Rohit Kapoor", "Sana Mirza", "Arjun Patel", "Divya Raghavan", "Manoj Tiwari", "Neha Verma", "Karthik Ganesan"][i % 8],
  age: 24 + ((i * 7) % 52),
  gender: i % 2 === 0 ? "Female" : "Male",
  phone: "+91 98450 " + String(10000 + (i * 387)).slice(-5),
  fresh: i % 3 === 0
}));

// Deterministic Pseudo-Random Generator with a fixed seed
function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    return (s = (s * 16807) % 2147483647) / 2147483647;
  };
}

export function generateEncounters() {
  const rng = seededRandom(42);
  const rnd = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const pick = arr => arr[rnd(0, arr.length - 1)];

  const rawEncounters = [];
  let encSeq = 1;

  DOCTORS.forEach((doc) => {
    // 32 encounters per doctor
    for (let i = 0; i < 32; i++) {
      const patient = pick(PATIENTS_LIST);
      const day = rnd(1, 29);
      const date = `2026-10-${String(day).padStart(2, "0")}`;

      const consultStatus = pick(["Completed", "Completed", "Completed", "Cancelled", "No-show"]);
      const consultFee = rnd(500, 1200);
      const consultDiscount = rng() < 0.12 ? rnd(30, 100) : 0;
      const consultRefund = consultStatus === "Cancelled" && rng() < 0.4 ? rnd(100, consultFee) : (rng() < 0.02 ? rnd(100, 250) : 0);
      const consultNet = consultStatus === "Completed" ? Math.max(0, consultFee - consultDiscount - consultRefund) : 0;

      // Lab investigations
      const hasLab = rng() < 0.65;
      const labTests = [];
      let labGross = 0;
      let labDiscount = 0;
      let labRefund = 0;
      let labStatus = "Not ordered";

      if (hasLab) {
        labStatus = pick(["Completed", "Completed", "Pending", "Cancelled"]);
        const testCount = rnd(1, 3);
        for (let t = 0; t < testCount; t++) {
          const test = pick(LAB_TEST_TYPES);
          labTests.push(test);
          labGross += test.basePrice;
        }
        labDiscount = rng() < 0.15 ? rnd(50, 180) : 0;
        labRefund = labStatus === "Cancelled" ? rnd(200, labGross) : (rng() < 0.04 ? rnd(100, Math.floor(labGross * 0.3)) : 0);
      }
      const labNet = labStatus === "Completed" ? Math.max(0, labGross - labDiscount - labRefund) : 0;

      // Production Labs Architecture Dimensions
      const labSource = hasLab ? pick(["OPENMRS_ORDER", "OPENMRS_ORDER", "MANUAL", "PACKAGE_PAID"]) : "N/A";
      const isPackagePaid = labSource === "PACKAGE_PAID";
      const labType = hasLab ? (labTests.length > 1 ? "PROFILE_BUNDLE" : "INDIVIDUAL_TEST") : "N/A";
      const labPackDiscount = labDiscount > 0 ? Math.round(labDiscount * 0.65) : 0;
      const labManualDiscount = Math.max(0, labDiscount - labPackDiscount);
      const labReceiptAmount = labNet; // Receipt is the revenue event

      // Pharmacy Prescriptions
      const hasRx = rng() < 0.70;
      let pharmGross = 0;
      let pharmDiscount = 0;
      let pharmReturn = 0;
      let pharmStatus = "No prescription";
      let drugCategory = null;

      if (hasRx) {
        pharmStatus = pick(["Dispensed", "Dispensed", "Dispensed", "Partial", "Returned"]);
        drugCategory = pick(DRUG_CATEGORIES);
        pharmGross = rnd(300, 2400);
        pharmDiscount = rng() < 0.10 ? rnd(20, 120) : 0;
        pharmReturn = pharmStatus === "Returned" ? rnd(100, Math.floor(pharmGross * 0.4)) : 0;
      }
      const pharmNet = hasRx && pharmStatus !== "Returned" ? Math.max(0, pharmGross - pharmDiscount - pharmReturn) : (pharmStatus === "Returned" ? Math.max(0, pharmGross - pharmReturn) : 0);

      // Production Pharmacy Architecture Dimensions
      const pharmChannel = hasRx ? pick(["OPD", "OPD", "WALK_IN", "IPD_OT"]) : "N/A";
      const pharmPriceListDiscount = pharmDiscount > 0 ? Math.round(pharmDiscount * 0.70) : 0;
      const pharmAdditionalDiscount = Math.max(0, pharmDiscount - pharmPriceListDiscount);
      const pharmTaxRate = 0.12; // 12% standard pharma GST
      const pharmTaxAmount = pharmNet > 0 ? Math.round((pharmNet * 12) / 112) : 0;
      const pharmNetExclTax = Math.max(0, pharmNet - pharmTaxAmount);
      const pharmCOGS = pharmNetExclTax > 0 ? Math.round(pharmNetExclTax * 0.72) : 0; // Batch purchase price
      const pharmGrossProfit = Math.max(0, pharmNetExclTax - pharmCOGS);
      const pharmMarginPct = pharmNetExclTax > 0 ? Math.round((pharmGrossProfit / pharmNetExclTax) * 100) : 0;

      // Clinical Procedures
      const hasProcedure = rng() < 0.35;
      let procGross = 0;
      let procDiscount = 0;
      let procRefund = 0;
      let procStatus = "Not performed";

      if (hasProcedure) {
        procStatus = pick(["Completed", "Completed", "Scheduled", "Cancelled"]);
        procGross = rnd(1200, 5500);
        procDiscount = rng() < 0.10 ? rnd(100, 300) : 0;
        procRefund = procStatus === "Cancelled" ? rnd(500, procGross) : (rng() < 0.03 ? rnd(100, 400) : 0);
      }
      const procNet = procStatus === "Completed" ? Math.max(0, procGross - procDiscount - procRefund) : 0;

      // Referrals made (Clinical Workflow)
      const hasReferral = rng() < 0.28;
      const otherDepts = ["Cardiology", "Orthopedics", "General Medicine", "Gynecology", "Dermatology"].filter(d => d !== doc.dept);
      const referralToDept = hasReferral ? pick(otherDepts) : null;

      // Admissions initiated by doctor (Hospital Operations)
      // Actual inpatient admissions initiated by doctor during OPD consultation
      const admissionInitiated = consultStatus === "Completed" && rng() < 0.14;

      const totalNet = consultNet + labNet + pharmNet + procNet;

      // Payment allocation
      const payRate = totalNet > 0 ? pick([1, 1, 1, 0.75, 0.5, 0]) : 0;
      const collected = Math.round(totalNet * payRate);
      const outstanding = Math.max(0, totalNet - collected);
      const paymentStatus = totalNet === 0 ? "Paid" : (collected === totalNet ? "Paid" : (collected > 0 ? "Partial" : "Unpaid"));
      const payMode = pick(["UPI", "Card", "Cash", "Insurance", "Bank transfer"]);

      rawEncounters.push({
        tempId: encSeq++,
        date,
        day,
        doctorId: doc.id,
        doctorName: doc.name,
        department: doc.dept,
        speciality: doc.dept,
        facility: doc.facility,
        patientId: patient.id,
        patientName: patient.name,
        patientAge: patient.age,
        patientGender: patient.gender,
        patientPhone: patient.phone,
        patientFresh: patient.fresh,
        // Consult
        consultStatus,
        consultFee,
        consultDiscount,
        consultRefund,
        consultNet,
        // Lab
        hasLab,
        labStatus,
        labTests,
        labGross,
        labDiscount,
        labRefund,
        labNet,
        labSource,
        isPackagePaid,
        labType,
        labPackDiscount,
        labManualDiscount,
        labReceiptAmount,
        // Pharmacy
        hasRx,
        pharmStatus,
        drugCategory: drugCategory ? drugCategory.name : null,
        drugCode: drugCategory ? drugCategory.code : null,
        pharmGross,
        pharmDiscount,
        pharmReturn,
        pharmNet,
        pharmChannel,
        pharmPriceListDiscount,
        pharmAdditionalDiscount,
        pharmTaxRate,
        pharmTaxAmount,
        pharmNetExclTax,
        pharmCOGS,
        pharmGrossProfit,
        pharmMarginPct,
        // Procedure
        hasProcedure,
        procStatus,
        procGross,
        procDiscount,
        procRefund,
        procNet,
        // Totals
        totalNet,
        collected,
        outstanding,
        paymentStatus,
        payMode,
        // Non-revenue pre-attributes
        hasReferral,
        referralToDept,
        admissionInitiated
      });
    }
  });

  // Chronological sort across full history to guarantee historical accuracy
  rawEncounters.sort((a, b) => a.date.localeCompare(b.date) || a.tempId - b.tempId);

  // Maintain patient lifetime timeline to accurately tag New vs Returning, Follow-up, and Continuity
  const patientHistory = new Map();
  const encounters = [];

  rawEncounters.forEach((item, index) => {
    const encId = "ENC-" + String(index + 1).padStart(4, "0");
    const history = patientHistory.get(item.patientId) || [];
    const priorCompleted = history.filter(h => h.consultStatus === "Completed");
    
    // New patient: first ever completed visit in the system's history
    // Returning patient: has had 1 or more completed visits prior to this date
    const isReturning = priorCompleted.length > 0;
    const isNew = priorCompleted.length === 0;

    // Follow-up consultation: marked as follow-up consultation
    const isFollowUp = isReturning && (item.tempId % 2 === 0);
    const visitType = isFollowUp ? "Follow-up Consultation" : "Initial Consultation";
    // Count follow-up consultations that have actually been completed
    const followUpCompleted = isFollowUp && item.consultStatus === "Completed";

    // Continuity: Did returning patient revisit the exact same doctor?
    const lastVisit = priorCompleted[priorCompleted.length - 1];
    const sameDoctorRevisit = isReturning && lastVisit ? lastVisit.doctorId === item.doctorId : false;

    // Service line used by the "Service" filter. First rule that matches wins:
    // inpatient admission > completed procedure (operation theatre) > counter/walk-in patient > outpatient.
    const isWalkIn = item.labSource === "MANUAL" || item.pharmChannel === "WALK_IN" || (item.tempId % 6 === 0);
    const serviceType = item.admissionInitiated
      ? "IPD"
      : (item.hasProcedure && item.procStatus === "Completed")
        ? "OT"
        : isWalkIn
          ? "Walk-in"
          : "OPD";

    // Clinical Workflow (Deduplicated identifiers per encounter)
    const rxOrderId = item.hasRx ? "RXO-" + String(index + 1).padStart(4, "0") : null;
    const labOrderId = item.hasLab ? "LBO-" + String(index + 1).padStart(4, "0") : null;
    const procedureCompleted = (item.hasProcedure && item.procStatus === "Completed") ? 1 : 0;
    const referralId = item.hasReferral ? "REF-" + String(index + 1).padStart(4, "0") : null;

    // Hospital Operations (Inpatient admission initiated by originating doctor)
    const admissionId = item.admissionInitiated ? "ADM-" + String(index + 1).padStart(4, "0") : null;

    const enriched = {
      ...item,
      id: encId,
      encounterType: isWalkIn ? "Walk-in" : "OPD",
      visitType: isWalkIn ? "Walk-in Consultation" : visitType,
      isFollowUp,
      followUpCompleted,
      isNewPatient: isNew,
      isReturningPatient: isReturning,
      historicalVisitIndex: priorCompleted.length,
      previousDoctorId: lastVisit ? lastVisit.doctorId : null,
      previousDoctorName: lastVisit ? lastVisit.doctorName : null,
      sameDoctorRevisit,
      // Clinical Workflow
      rxOrderId,
      prescriptionsWritten: rxOrderId ? 1 : 0,
      labOrderId,
      labOrdersCount: labOrderId ? 1 : 0,
      procedureCompleted,
      referralId,
      referralsMade: referralId ? 1 : 0,
      // Production Receipts & Invoices
      labReceiptNo: item.hasLab ? "REC-" + String(1000 + index + 1) : null,
      pharmInvoiceNo: item.hasRx ? "INV-" + String(2000 + index + 1) : null,
      // billing-engine Master Invoice Classification (6 Production Invoice Types)
      invoiceType: item.admissionInitiated 
        ? "IPD" 
        : ((item.hasProcedure && item.procStatus === "Completed") 
            ? "TREATMENT" 
            : (item.isPackagePaid 
                ? "PACKAGE" 
                : (isNew && item.tempId % 5 === 0 
                    ? "REGISTRATION" 
                    : (item.tempId % 7 === 0 ? "SERVICE" : "CONSULTATION")))),
      invoiceCreatedBy: item.admissionInitiated 
        ? "clinsta-IPd" 
        : ((item.hasProcedure && item.procStatus === "Completed") 
            ? "BluadConsultation (TreatmentServiceImpl)" 
            : (item.isPackagePaid 
                ? "billing-engine (Prepaid Package)" 
                : (isNew && item.tempId % 5 === 0 
                    ? "BluadPatientRegistration" 
                    : (item.tempId % 7 === 0 ? "billing-engine (Direct OPD Service)" : "BluadConsultation (ConsultationOrderServiceImpl)")))),
      serviceType,
      // Hospital Operations
      admissionId,
      admissionStatus: item.admissionInitiated ? "Initiated" : "Not Admitted",
      admissionsInitiated: item.admissionInitiated ? 1 : 0
    };

    if (item.consultStatus === "Completed") {
      history.push({
        id: encId,
        date: item.date,
        doctorId: item.doctorId,
        doctorName: item.doctorName,
        consultStatus: item.consultStatus
      });
      patientHistory.set(item.patientId, history);
    }

    encounters.push(enriched);
  });

  return encounters;
}

export const formatMoney = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

export const formatNum = (n) =>
  new Intl.NumberFormat("en-IN").format(n || 0);
