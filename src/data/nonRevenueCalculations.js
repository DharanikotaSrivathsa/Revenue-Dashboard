/**
 * Non-Revenue Doctor Performance Metrics & Operational Care Calculations
 * 
 * Strict Scope Restriction:
 * 1. Patient Volume (Visits, Unique patients by ID, New, Returning, Avg patients/day)
 * 2. Follow-up Care (Follow-ups completed ONLY)
 * 3. Clinical Workflow (Prescriptions written, Lab orders, Procedures completed, Referrals made - NO revenue, NO imaging)
 * 4. Continuity of Care (Patient retention rate, Repeat-visit rate, Same-doctor continuity rate)
 * 5. Hospital Operations (OPD-to-IPD conversion rate, Admissions initiated by doctor - NO discharge delay)
 */

import { DOCTORS } from "./mockData.js";

/**
 * Calculates all 5 non-revenue performance categories for a given set of encounters.
 * Handles zero denominators safely and avoids dividing by zero.
 */
export function calculateNonRevenueMetrics(encounters = []) {
  // 1. Patient Volume
  // Qualifying completed visits
  const completedVisits = encounters.filter(e => e.consultStatus === "Completed");
  const totalPatientVisits = completedVisits.length;

  // Unique patients counted strictly using patientId (not name)
  const uniquePatientIds = new Set(completedVisits.map(e => e.patientId));
  const uniquePatients = uniquePatientIds.size;

  // New vs Returning based on lifetime historical record
  const newPatients = completedVisits.filter(e => e.isNewPatient).length;
  const returningPatients = completedVisits.filter(e => e.isReturningPatient).length;

  // Average patients per day:
  // Denominator: Number of distinct calendar dates with active clinical consultations
  const operationalDates = new Set(completedVisits.map(e => e.date));
  const operationalDays = operationalDates.size;
  const avgPatientsPerDay = operationalDays > 0 ? (totalPatientVisits / operationalDays) : 0;

  // 2. Follow-up Care (Follow-ups completed ONLY)
  // Count follow-up consultations that have actually been completed.
  // Exclude scheduled, pending, cancelled, or no-show. Deduplicated per encounter.
  const followUpsCompleted = encounters.filter(e => e.followUpCompleted).length;

  // 3. Clinical Workflow
  // Prescriptions written: Count of prescription orders created by the doctor (deduplicated per encounter)
  const prescriptionsWritten = encounters.filter(e => e.hasRx && e.rxOrderId).length;

  // Lab investigation orders: Count of lab investigation orders attributed to originating doctor (deduplicated per encounter)
  const labInvestigationOrders = encounters.filter(e => e.hasLab && e.labOrderId).length;

  // Procedures performed: Procedures actually completed/performed (status === "Completed")
  const proceduresPerformed = encounters.filter(e => e.procedureCompleted === 1).length;

  // Referrals made: Referrals initiated by doctor to other specialties/departments
  const referralsMade = encounters.filter(e => e.hasReferral && e.referralId).length;

  // 4. Continuity of Care
  // Care coordination & continuity indicators (not clinical outcome measures)
  
  // A. Repeat-visit rate:
  // Denominator: Unique patients in the active filter selection
  // Numerator: Unique patients who had >= 2 completed visits in the active filter selection
  const patientVisitCounts = new Map();
  completedVisits.forEach(e => {
    patientVisitCounts.set(e.patientId, (patientVisitCounts.get(e.patientId) || 0) + 1);
  });
  const patientsWithMultipleVisits = Array.from(patientVisitCounts.values()).filter(c => c >= 2).length;
  const repeatVisitRate = uniquePatients > 0 
    ? Math.round((patientsWithMultipleVisits / uniquePatients) * 1000) / 10 
    : 0;

  // B. Patient retention rate:
  // Percentage of eligible unique patients who return for a subsequent visit within the 30-day window
  // Denominator: Eligible unique patients
  // Numerator: Patients returning for at least one subsequent visit
  const retainedPatients = Array.from(patientVisitCounts.values()).filter(c => c >= 2).length;
  const patientRetentionRate = uniquePatients > 0 
    ? Math.round((retainedPatients / uniquePatients) * 1000) / 10 
    : 0;

  // C. Same-doctor continuity rate:
  // Percentage of eligible returning patients who revisit the same doctor
  // Denominator: Total returning patient encounters in the filtered scope
  // Numerator: Returning patient encounters where previous doctor === current doctor
  const returningEncounters = completedVisits.filter(e => e.isReturningPatient);
  const sameDoctorVisits = returningEncounters.filter(e => e.sameDoctorRevisit).length;
  const sameDoctorContinuityRate = returningEncounters.length > 0 
    ? Math.round((sameDoctorVisits / returningEncounters.length) * 1000) / 10 
    : 0;

  // 5. Hospital Operations
  // Inpatient admissions initiated or referred for admission by the selected doctor
  // Exclude discharge delays
  const admissionsInitiated = encounters.filter(e => e.admissionsInitiated === 1).length;

  // OPD-to-IPD conversion rate:
  // Denominator: Total completed eligible OPD visits
  // Numerator: Inpatient admissions initiated from OPD
  const opdToIpdConversionRate = totalPatientVisits > 0 
    ? Math.round((admissionsInitiated / totalPatientVisits) * 1000) / 10 
    : 0;

  return {
    // 1. Patient Volume
    totalPatientVisits,
    uniquePatients,
    newPatients,
    returningPatients,
    operationalDays,
    avgPatientsPerDay: Number(avgPatientsPerDay.toFixed(2)),

    // 2. Follow-up Care
    followUpsCompleted,

    // 3. Clinical Workflow
    prescriptionsWritten,
    labInvestigationOrders,
    proceduresPerformed,
    referralsMade,

    // 4. Continuity of Care
    patientRetentionRate,
    repeatVisitRate,
    sameDoctorContinuityRate,
    returningEncountersCount: returningEncounters.length,
    sameDoctorVisitsCount: sameDoctorVisits,
    multiVisitPatientsCount: patientsWithMultipleVisits,

    // 5. Hospital Operations
    admissionsInitiated,
    opdToIpdConversionRate
  };
}

/**
 * Calculates doctor-by-doctor non-revenue performance metrics for comparative matrix and charts.
 */
export function calculateDoctorNonRevenueMetrics(encounters = []) {
  return DOCTORS.map(doc => {
    const docEncounters = encounters.filter(e => e.doctorName === doc.name);
    const metrics = calculateNonRevenueMetrics(docEncounters);

    return {
      doctorId: doc.id,
      doctorName: doc.name,
      department: doc.dept,
      facility: doc.facility,
      experience: doc.experience,
      opdRoom: doc.opdRoom,
      totalEncounters: docEncounters.length,
      ...metrics
    };
  }).filter(d => d.totalEncounters > 0);
}
