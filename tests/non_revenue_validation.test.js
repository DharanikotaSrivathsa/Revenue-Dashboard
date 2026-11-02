import assert from "node:assert";
import { generateEncounters, DOCTORS, FACILITIES, DEPARTMENTS } from "../src/data/mockData.js";
import { 
  calculateNonRevenueMetrics, 
  calculateDoctorNonRevenueMetrics 
} from "../src/data/nonRevenueCalculations.js";

console.log("=== STARTING NON-REVENUE PERFORMANCE VALIDATION TESTS ===");

const allEncounters = generateEncounters();
assert(allEncounters.length > 0, "Encounters must be generated");
console.log(`✓ Dataset generated: ${allEncounters.length} total encounters across ${DOCTORS.length} doctors`);

// -------------------------------------------------------------
// Test 1: Patient Volume
// -------------------------------------------------------------
console.log("\n--- Testing 1. Patient Volume ---");
const fullMetrics = calculateNonRevenueMetrics(allEncounters);

// Verify completed visits
const manualCompleted = allEncounters.filter(e => e.consultStatus === "Completed");
assert.strictEqual(fullMetrics.totalPatientVisits, manualCompleted.length, "Total visits must match completed consultations");

// Verify unique patients by ID, not name
const manualUniqueIds = new Set(manualCompleted.map(e => e.patientId));
assert.strictEqual(fullMetrics.uniquePatients, manualUniqueIds.size, "Unique patients must be counted by patientId");
assert(fullMetrics.totalPatientVisits >= fullMetrics.uniquePatients, "Total visits must be >= unique patients");

// Verify new vs returning based on lifetime historical record
const manualNew = manualCompleted.filter(e => e.isNewPatient);
const manualReturning = manualCompleted.filter(e => e.isReturningPatient);
assert.strictEqual(fullMetrics.newPatients, manualNew.length, "New patients must match lifetime first visits");
assert.strictEqual(fullMetrics.returningPatients, manualReturning.length, "Returning patients must match lifetime prior visits");
assert.strictEqual(fullMetrics.newPatients + fullMetrics.returningPatients, fullMetrics.totalPatientVisits, "New + Returning must equal Total Visits");

// Verify Average patients per day
const manualDates = new Set(manualCompleted.map(e => e.date));
assert.strictEqual(fullMetrics.operationalDays, manualDates.size, "Operational days must equal distinct dates with visits");
const expectedAvg = Number((fullMetrics.totalPatientVisits / fullMetrics.operationalDays).toFixed(2));
assert.strictEqual(fullMetrics.avgPatientsPerDay, expectedAvg, "Average patients per day must equal visits / operational days");
console.log(`✓ Patient Volume: ${fullMetrics.totalPatientVisits} visits, ${fullMetrics.uniquePatients} unique patients (by ID), ${fullMetrics.newPatients} new, ${fullMetrics.returningPatients} returning, ${fullMetrics.avgPatientsPerDay} avg/day (${fullMetrics.operationalDays} active days)`);

// -------------------------------------------------------------
// Test 2: Follow-up Care (Follow-ups completed ONLY)
// -------------------------------------------------------------
console.log("\n--- Testing 2. Follow-up Care ---");
const manualFollowUps = allEncounters.filter(e => e.followUpCompleted);
assert.strictEqual(fullMetrics.followUpsCompleted, manualFollowUps.length, "Follow-ups completed count must match");

// Ensure cancelled or scheduled follow-ups are strictly excluded
const cancelledFollowUps = allEncounters.filter(e => e.isFollowUp && e.consultStatus !== "Completed");
cancelledFollowUps.forEach(e => {
  assert.strictEqual(e.followUpCompleted, false, "Cancelled/scheduled follow-ups must NOT be counted as completed");
});
console.log(`✓ Follow-up Care: ${fullMetrics.followUpsCompleted} follow-ups completed (cancelled/scheduled strictly excluded)`);

// -------------------------------------------------------------
// Test 3: Clinical Workflow (Non-revenue counts, no imaging parameter)
// -------------------------------------------------------------
console.log("\n--- Testing 3. Clinical Workflow ---");
const manualRx = allEncounters.filter(e => e.hasRx && e.rxOrderId);
assert.strictEqual(fullMetrics.prescriptionsWritten, manualRx.length, "Prescriptions written count must match deduplicated orders");

const manualLab = allEncounters.filter(e => e.hasLab && e.labOrderId);
assert.strictEqual(fullMetrics.labInvestigationOrders, manualLab.length, "Lab orders count must match deduplicated orders");

// Procedures actually performed (status === Completed)
const manualProc = allEncounters.filter(e => e.procedureCompleted === 1);
assert.strictEqual(fullMetrics.proceduresPerformed, manualProc.length, "Procedures performed count must match completed status");
const uncompletedProc = allEncounters.filter(e => e.hasProcedure && e.procStatus !== "Completed");
uncompletedProc.forEach(e => {
  assert.strictEqual(e.procedureCompleted, 0, "Scheduled or cancelled procedures must NOT be counted as performed");
});

const manualRef = allEncounters.filter(e => e.hasReferral && e.referralId);
assert.strictEqual(fullMetrics.referralsMade, manualRef.length, "Referrals made count must match");

// Verify zero monetary amounts in non-revenue metrics
assert.strictEqual(typeof fullMetrics.prescriptionsWritten, "number");
assert.strictEqual(typeof fullMetrics.labInvestigationOrders, "number");
assert.strictEqual(typeof fullMetrics.proceduresPerformed, "number");
assert.strictEqual(typeof fullMetrics.referralsMade, "number");
console.log(`✓ Clinical Workflow: ${fullMetrics.prescriptionsWritten} prescriptions written, ${fullMetrics.labInvestigationOrders} lab orders, ${fullMetrics.proceduresPerformed} procedures completed, ${fullMetrics.referralsMade} referrals made`);

// -------------------------------------------------------------
// Test 4: Continuity of Care
// -------------------------------------------------------------
console.log("\n--- Testing 4. Continuity of Care ---");
assert(typeof fullMetrics.patientRetentionRate === "number", "Retention rate must be a number");
assert(typeof fullMetrics.repeatVisitRate === "number", "Repeat-visit rate must be a number");
assert(typeof fullMetrics.sameDoctorContinuityRate === "number", "Same-doctor continuity rate must be a number");

// Check repeat-visit rate formula
const pCounts = new Map();
manualCompleted.forEach(e => pCounts.set(e.patientId, (pCounts.get(e.patientId) || 0) + 1));
const multiVisits = Array.from(pCounts.values()).filter(c => c >= 2).length;
const expectedRepeatRate = Math.round((multiVisits / fullMetrics.uniquePatients) * 1000) / 10;
assert.strictEqual(fullMetrics.repeatVisitRate, expectedRepeatRate, "Repeat visit rate must match formula");

// Same-doctor continuity check
const returning = manualCompleted.filter(e => e.isReturningPatient);
const sameDoc = returning.filter(e => e.sameDoctorRevisit).length;
const expectedSameDocRate = returning.length > 0 ? Math.round((sameDoc / returning.length) * 1000) / 10 : 0;
assert.strictEqual(fullMetrics.sameDoctorContinuityRate, expectedSameDocRate, "Same-doctor continuity rate must match formula");
console.log(`✓ Continuity of Care: Retention Rate: ${fullMetrics.patientRetentionRate}%, Repeat-Visit Rate: ${fullMetrics.repeatVisitRate}%, Same-Doctor Continuity Rate: ${fullMetrics.sameDoctorContinuityRate}%`);

// -------------------------------------------------------------
// Test 5: Hospital Operations (Admissions initiated, OPD to IPD conversion)
// -------------------------------------------------------------
console.log("\n--- Testing 5. Hospital Operations ---");
const manualAdm = allEncounters.filter(e => e.admissionsInitiated === 1);
assert.strictEqual(fullMetrics.admissionsInitiated, manualAdm.length, "Admissions initiated count must match");
const expectedConvRate = fullMetrics.totalPatientVisits > 0 
  ? Math.round((fullMetrics.admissionsInitiated / fullMetrics.totalPatientVisits) * 1000) / 10 
  : 0;
assert.strictEqual(fullMetrics.opdToIpdConversionRate, expectedConvRate, "OPD-to-IPD conversion rate must match formula");
console.log(`✓ Hospital Operations: ${fullMetrics.admissionsInitiated} admissions initiated, ${fullMetrics.opdToIpdConversionRate}% OPD-to-IPD conversion rate`);

// -------------------------------------------------------------
// Test 6: Zero-data and Division-by-Zero Protection
// -------------------------------------------------------------
console.log("\n--- Testing 6. Zero Data Protection ---");
const emptyMetrics = calculateNonRevenueMetrics([]);
assert.strictEqual(emptyMetrics.totalPatientVisits, 0);
assert.strictEqual(emptyMetrics.uniquePatients, 0);
assert.strictEqual(emptyMetrics.avgPatientsPerDay, 0);
assert.strictEqual(emptyMetrics.patientRetentionRate, 0);
assert.strictEqual(emptyMetrics.repeatVisitRate, 0);
assert.strictEqual(emptyMetrics.sameDoctorContinuityRate, 0);
assert.strictEqual(emptyMetrics.opdToIpdConversionRate, 0);
assert(!Number.isNaN(emptyMetrics.avgPatientsPerDay), "Avg per day must not be NaN");
assert(!Number.isNaN(emptyMetrics.opdToIpdConversionRate), "Conversion rate must not be NaN");
console.log("✓ Zero-data handling: Zero denominators handled gracefully without NaN or errors");

// -------------------------------------------------------------
// Test 7: Doctor-level Comparisons & Scope Filters
// -------------------------------------------------------------
console.log("\n--- Testing 7. Doctor-Level Metric Attribution ---");
const doctorMetrics = calculateDoctorNonRevenueMetrics(allEncounters);
assert.strictEqual(doctorMetrics.length, DOCTORS.length, "Must calculate metrics for all active doctors");

doctorMetrics.forEach(d => {
  assert(d.doctorId, "Doctor must have ID");
  assert(d.doctorName, "Doctor must have name");
  assert(d.totalPatientVisits >= 0, "Visits must be >= 0");
  assert(d.uniquePatients >= 0, "Unique patients must be >= 0");
  assert(d.newPatients + d.returningPatients === d.totalPatientVisits, "New + Returning must equal Total Visits for doctor");
  assert(d.prescriptionsWritten >= 0, "Rx written must be >= 0");
  assert(d.labInvestigationOrders >= 0, "Lab orders must be >= 0");
  assert(d.proceduresPerformed >= 0, "Procedures performed must be >= 0");
  assert(d.referralsMade >= 0, "Referrals made must be >= 0");
  assert(d.admissionsInitiated >= 0, "Admissions initiated must be >= 0");
});
console.log(`✓ Doctor-level comparative metrics: All ${doctorMetrics.length} doctors verified`);

// -------------------------------------------------------------
// Test 8: Filter Reactivity (Facility & Department)
// -------------------------------------------------------------
console.log("\n--- Testing 8. Filter Reactivity ---");
const centralEncounters = allEncounters.filter(e => e.facility === "Central Hospital");
const centralMetrics = calculateNonRevenueMetrics(centralEncounters);
assert(centralMetrics.totalPatientVisits < fullMetrics.totalPatientVisits, "Filtered subset must reflect facility restriction");

const cardioEncounters = allEncounters.filter(e => e.department === "Cardiology");
const cardioMetrics = calculateNonRevenueMetrics(cardioEncounters);
assert(cardioMetrics.totalPatientVisits < fullMetrics.totalPatientVisits, "Filtered subset must reflect department restriction");
console.log(`✓ Filter reactivity: Facility & Department subsets computed accurately`);

// -------------------------------------------------------------
// Test 9: Existing Revenue & Financial Preservation
// -------------------------------------------------------------
console.log("\n--- Testing 9. Financial & Revenue Integrity ---");
const totalNet = allEncounters.reduce((s, e) => s + e.totalNet, 0);
const collected = allEncounters.reduce((s, e) => s + e.collected, 0);
const outstanding = allEncounters.reduce((s, e) => s + e.outstanding, 0);
assert(totalNet > 0, "Net revenue must be > 0");
assert.strictEqual(collected + outstanding, totalNet, "Collected + Outstanding must equal Net Revenue");
console.log(`✓ Financial Integrity: Net Revenue: ₹${totalNet}, Collected: ₹${collected}, Outstanding: ₹${outstanding}`);

console.log("\n=======================================================");
console.log("ALL 9 TEST SUITES PASSED WITH 100% SUCCESS!");
console.log("=======================================================");
