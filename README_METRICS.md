# Doccure HMS Analytics: Metrics & Terms Guide

This guide explains every page, parameter and term in the dashboard: what it measures, how it is calculated, and where the number comes from. For installing and running the project, see [README.md](README.md).

---

## 1. How the data works

- The dashboard runs on **sample (mock) data** generated in [src/data/mockData.js](src/data/mockData.js). It is not connected to a live hospital system yet.
- The sample has **192 encounters**: 6 doctors × 32 visits, all in **October 2026**, across **3 facilities** and **5 departments**.
- An **encounter** is one outpatient (OPD) visit. Each encounter can carry a consultation, a lab order, a pharmacy prescription and a procedure, each with its own money fields.
- Some figures are **derived** because the sample data does not carry them (marked *derived* below). They are produced from a stable hash of the encounter id, so they never change between page loads. When real data is connected, those are the parts to replace.

### Where the code lives

| What | File |
|---|---|
| Sample data generator | `src/data/mockData.js` |
| Revenue, leaderboard and product analytics | `src/data/commercialAnalytics.js` |
| Doctor non-revenue metrics | `src/data/nonRevenueCalculations.js` |
| Labs calculations | `src/data/labAnalytics.js` |
| Pharmacy calculations | `src/data/pharmacyAnalytics.js` |
| Labs tabs | `src/components/labs/` |
| Pharmacy tabs | `src/components/pharmacy/` |

---

## 2. Pages in the sidebar

| Page | Purpose |
|---|---|
| **Overview** | Hospital-wide revenue, collections and top performers |
| **Doctor Performance** | Revenue per doctor, product attribution, ranking matrix, and non-revenue care metrics |
| **Department Performance** | Revenue and collection by specialty |
| **Labs Performance** | Laboratory revenue, orders, quality and HMS integration (4 tabs) |
| **Pharmacy Performance** | Pharmacy sales, medicines, profit and channels (4 tabs) |

### Global filters (search console)

Every page uses the same filters. Nothing is shown until **Search Analytics & Show Data** is clicked.

| Filter | Meaning |
|---|---|
| From / To date | Visit date range |
| Hospital Branch | Facility: Central Hospital, North Clinic, South Clinic |
| Specialty Department | General Medicine, Cardiology, Orthopedics, Gynecology, Dermatology |
| Attending Clinician | One of the 6 doctors |
| Payment Channel | How the patient paid: UPI, Card, Cash, Insurance, Bank transfer |
| Keyword / Payment status | Free-text search and Paid / Partial / Unpaid |

---

## 3. Core money terms (used everywhere)

| Term | Meaning |
|---|---|
| **Gross** | Value at list price before any discount, refund or return |
| **MRP** | Maximum Retail Price, the standard catalogue price of a test or medicine |
| **Discount** | Reduction given to the patient. Lab discounts split into *pack discounts* (pre-configured offers) and *cashier / manual concessions* |
| **Refund** (labs) / **Return** (pharmacy) | Money given back for a cancelled or returned item |
| **Net** | Gross − discounts − refunds/returns |
| **Total Net / Invoiced Revenue** | Consultation + Lab + Pharmacy + Procedure net for an encounter |
| **Collected / Realized** | Money actually received |
| **Outstanding / Arrears** | Net minus collected: billed but not yet paid |
| **Payment status** | **Paid** (fully collected), **Partial** (some collected), **Unpaid** (none collected) |
| **GST** | Goods and Services Tax. Pharmacy prices are GST-inclusive at 12% |
| **COGS** | Cost of Goods Sold: what the pharmacy paid for the medicines it sold |
| **OPD / IPD / ER / OT** | Outpatient, Inpatient, Emergency, Operation Theatre |
| **HMS** | Hospital Management System, the system that sends orders to the lab |

---

## 4. Overview page

| Parameter | Meaning |
|---|---|
| **Total Net Billed** | Sum of Total Net across all encounters in the filter |
| **Settled Realized** | Sum of collected amounts |
| **Outstanding Arrears** | Sum of outstanding amounts |
| **Settlement Health** | Share of billed revenue that has been collected (cash rate) |
| **Hospital Revenue Streams** | Revenue split by invoice type (below) |
| **Settlement Mode breakdown** | Revenue by payment channel |
| **Top Products & Services Sold** | Leaderboards for lab tests, medications, procedures and health packages |

**Invoice types.** Each encounter is assigned one type. The first rule that matches wins:

| Type | Rule |
|---|---|
| IPD | The doctor initiated an inpatient admission |
| TREATMENT | A procedure was completed |
| PACKAGE | A prepaid health package was used |
| REGISTRATION | New patient's first visit (every 5th encounter in the sample) |
| SERVICE | Direct OPD service (every 7th encounter in the sample) |
| CONSULTATION | Everything else |

**Note.** The medication, procedure and package leaderboards on the Overview are allocated from fixed shares of the pharmacy, procedure and package totals. They are illustrative. The Labs and Pharmacy pages calculate their breakdowns per encounter instead, so figures can differ between the pages.

---

## 5. Doctor Performance

### 5.1 Commercial (revenue) metrics

| Parameter | Formula / meaning |
|---|---|
| **Invoiced Revenue** | Sum of Total Net for the doctor's encounters |
| **Realized Collections** | Sum of collected |
| **Outstanding Arrears** | Sum of outstanding |
| **Realization Rate** | Realized ÷ Invoiced × 100 |
| **Share of Hospital** | Doctor's invoiced revenue ÷ hospital total |
| **Average Ticket** | Invoiced revenue ÷ number of encounters |
| **Consultation / Procedure Billings** | Consultation net and procedure net |
| **Lab Order Yield / Pharmacy Yield** | Lab net and pharmacy net from the doctor's patients |
| **Ecosystem Value** | Consultation + Procedure + Lab + Pharmacy |
| **Commercial Tier** | **Elite Revenue Leader** above ₹90,000 invoiced, **High Performer** above ₹75,000, otherwise **Core Contributor** |
| **Pareto concentration** | Share of hospital revenue earned by the top 2 doctors |

### 5.2 Three views

- **Commercial Overview**: yield per doctor.
- **Top Products Sold**: lab tests, medications and procedures attributed to each doctor.
- **Commercial Ranking Matrix**: sortable comparison of doctors across the parameters above, with CSV export.

### 5.3 Non-revenue (care quality) metrics

Only **completed consultations** count as visits. Divisions by zero return 0.

| Group | Parameter | Meaning |
|---|---|---|
| Patient Volume | **Total Patient Visits** | Completed consultations |
| | **Unique Patients** | Distinct patient ids (not names) |
| | **New Patients** | Visits by patients with no earlier completed visit |
| | **Returning Patients** | Visits by patients with at least one earlier completed visit |
| | **Avg Patients per Day** | Visits ÷ days that had at least one visit |
| Follow-up Care | **Follow-ups Completed** | Completed follow-up consultations only; scheduled, cancelled and no-show are excluded |
| Clinical Workflow | **Prescriptions Written** | Encounters with a prescription |
| | **Lab Orders** | Encounters with a lab order |
| | **Procedures Performed** | Procedures with status Completed |
| | **Referrals Made** | Referrals to another department |
| Continuity of Care | **Repeat-visit Rate** | Patients with 2 or more completed visits ÷ unique patients |
| | **Patient Retention Rate** | Same formula as repeat-visit rate in the current code (see note) |
| | **Same-doctor Continuity** | Returning-patient visits where the previous doctor was the same ÷ all returning-patient visits |
| Hospital Operations | **Admissions Initiated** | Inpatient admissions started by the doctor |
| | **OPD-to-IPD Conversion** | Admissions initiated ÷ completed OPD visits |

**Note on retention.** The code comment describes a 30-day return window, but the calculation does not apply one. Retention and repeat-visit rate currently give the same number.

---

## 6. Department Performance

Per department (Cardiology, General Medicine, Orthopedics, Gynecology, Dermatology):

| Parameter | Meaning |
|---|---|
| **Revenue** | Sum of Total Net |
| **Collected / Cash Rate** | Collected ÷ revenue |
| **Outstanding** | Billed but unpaid |
| **Revenue Share** | Department revenue ÷ hospital total |
| **Average Ticket** | Revenue ÷ encounters |
| **Stacked yield chart** | Revenue split into OPD, Labs, Pharmacy and Procedures |

---

## 7. Labs Performance

Only encounters with a lab order are included. **Revenue is recognised on completed (settled) orders only.** Pending and cancelled orders add no revenue.

### 7.1 Tab 1: Revenue Performance

| Parameter | Meaning |
|---|---|
| **Gross Revenue** | Total list-price value of settled lab orders |
| **Net Revenue** | Gross − discounts − refunds |
| **Total Discounts** | All discounts on settled orders |
| **Total Refunds** | Refunds on settled orders |
| **Collected Revenue** | Net revenue × the share of the encounter bill that was paid |
| **Outstanding Amount** | Net revenue − collected |
| **Revenue Trend** | Net revenue per day, week or month (toggle) |
| **Revenue by Payment Mode** | Net revenue by the encounter's payment channel |
| **Revenue by Department** | Net revenue by test department (Hematology, Biochemistry, Radiology, Endocrinology, Cardiology Lab) |
| **Revenue by Test** | Net revenue per test; search any test, click to expand |

**Reconciliation waterfall** (top banner): Billed Catalogue MRP → minus Pack Discounts → minus Cashier Additional → equals Checkout Collected → minus Order Refunds → equals **Net Labs Revenue**. In the sample data, 65% of each discount is treated as a pack discount and 35% as a cashier concession.

**Revenue by Test detail** (click a test):

| Field | Meaning |
|---|---|
| **Bought** | Times the test appeared on settled orders |
| **Refunded** | Number of those sales in refunded orders, and the refunded amount |
| **Gross** | Catalogue value of those sales, with the discounts allocated to them |
| **Net revenue** | Gross − discounts − refunds |

When an order has several tests, its net, discount and refund are split between the tests in proportion to their list prices.

**Order sources**

| Source | Meaning |
|---|---|
| **Walk-in Counter** (`MANUAL`) | Patient came directly to the lab reception |
| **Doctor Prescription** (`OPENMRS_ORDER`) | Ordered by a doctor during a consultation |
| **Prepaid Package** (`PACKAGE_PAID`) | Billed ₹0 at the lab; the revenue belongs to the package sale |

**Single tests vs bundled profiles.** A single test is one test billed at its own price. A bundle (profile) is several tests billed at one package price. Revenue is counted once per receipt so a bundle is never counted several times. In the sample data, any order with more than one test is labelled a bundle.

### 7.2 Tab 2: Order & Workflow

| Parameter | Meaning |
|---|---|
| **Total Orders** | All lab orders received |
| **Samples Collected** | Orders whose sample has been taken (Collected, In Progress or Completed) *derived* |
| **Samples Rejected** | Collected samples that were rejected *derived* |
| **Tests Performed** | Number of tests on completed orders |
| **HMS vs Walk-in** | HMS orders are all orders that did not come through the walk-in counter |
| **Order Status Funnel** | Pending → Confirmed → Collected → In Progress → Completed. Each stage counts orders that reached it or went further. Cancelled orders are left out. The percentage beside each stage is stage-to-stage conversion *derived* |
| **Daily Order Trend** | Orders received per day |
| **Department-wise Orders** | Tests ordered per lab department |

Hero rings: **Completion Rate** (completed ÷ non-cancelled orders), **Sample Collection** (collected ÷ non-cancelled orders), **HMS Share** (HMS orders ÷ all orders).

### 7.3 Tab 3: Quality Performance

| Parameter | Meaning |
|---|---|
| **Sample Rejection Rate** | Rejected samples ÷ collected samples |
| **Sample Rejection Reasons** | Hemolyzed, Insufficient volume, Clotted, Wrong container, Mislabelled, Delayed transport *derived* |
| **Abnormal Results** | Tests on completed orders flagged outside the normal range *derived* |
| **Repeat / Retest Count** | Tests that had to be repeated *derived* |
| **Cancelled Orders** | Lab orders that were cancelled |

Hero rings: **Sample Acceptance** (100 − rejection rate), **First-pass Rate** (100 − retests as a share of tests), **Normal Results** (100 − abnormal results as a share of tests).

### 7.4 Tab 4: HMS Integration

| Parameter | Meaning |
|---|---|
| **HMS Orders Received** | Lab orders that came from the hospital system |
| **HMS Orders Confirmed** | HMS orders the lab has moved past Pending (and not cancelled) |
| **Unconverted Encounters** | Completed consultations where **no lab order was created**. A high number can mean tests are not being ordered, orders are lost between systems, or patients skip the lab |
| **Orders by Hospital Location** | HMS orders per facility |
| **Orders by Visit Type** | OPD, IPD or ER. IPD means an admission was initiated, about 10% of the rest are ER *derived* |

Hero rings: **Confirmation Rate** (confirmed ÷ received), **Encounter Conversion** (received ÷ (received + unconverted)), **OPD Share** (OPD orders ÷ HMS orders).

---

## 8. Pharmacy Performance

Only encounters with a prescription are included. A pharmacy **order** is one prescription's sales invoice.

### 8.1 Tab 1: Revenue & Sales

| Parameter | Meaning |
|---|---|
| **Gross Sales** | Total pharmacy sales before returns |
| **Net Sales** | Sales after drug returns, GST-inclusive |
| **Total Drug Returns** | Value of returned medicines |
| **Total Discounts** | Gross − returns − net (price-list discounts plus cashier discounts) |
| **Collected Revenue** | Net sales × the share of the encounter bill that was paid. IPD / OT sales count as fully paid |
| **Outstanding Amount** | Net sales − collected |
| **Sales Trend** | Net sales per day, week or month (toggle) |
| **Sales by Payment Mode** | Net sales by payment channel (pie) |

**Reconciliation strip** (8 steps): Gross Sales → minus Discounts → minus Returns → **Net Sales** → minus GST → **Net Excl. Tax** → minus COGS → **Gross Profit**.

### 8.2 Tab 2: Medicine & Product

| Parameter | Meaning |
|---|---|
| **Total Medicines Sold** | Net units sold: units bought minus units returned |
| **Top 10 Selling Medicines** | Ranked by units sold |
| **Sales by Medicine Category** | Share of units per drug class (pie) |
| **Revenue by Medicine** | Search box plus a ranked list. Pick how many to show (5, 10, 20 or 50); searching shows every match. Click a medicine for **Bought** (units), **Returned** (units and amount), **Gross** (with discounts) and **Net revenue**. Returned units are estimated in proportion to the value returned on the prescription |
| **Revenue by Medicine Category** | Net sales per drug class |

Drug categories: Cardiovascular, Antibiotics, Analgesics, Dermatological, Vitamins. Medicine names, quantities and how an order is split across 1–3 medicines are *derived*, because the sample data stores only a drug category per prescription.

Hero rings: **Top 3 Medicines** (share of net sales), **Leading Category** (largest category's share of net sales), **Net-to-Gross** (net sales ÷ gross sales).

### 8.3 Tab 3: Profit & Margin

| Parameter | Formula |
|---|---|
| **GST Collected** | Net sales × 12 ÷ 112 (GST is already included in the price) |
| **Net Sales Excl. Tax** | Net sales − GST |
| **COGS** | 72% of net sales excl. tax (purchase cost of batches sold) |
| **Gross Profit** | Net sales excl. tax − COGS |
| **Gross Profit Margin** | Gross profit ÷ net sales excl. tax × 100 |
| **Profit by Medicine Category** | Gross profit per drug class |

**Note.** The sample data sets COGS at a fixed 72%, so the margin is always about 28%. With real purchase prices this will vary.

Hero rings: **Gross Margin**, **Cost of Goods** (COGS ÷ net sales excl. tax), **GST Share** (GST ÷ net sales).

### 8.4 Tab 4: Order & Channel

| Parameter | Meaning |
|---|---|
| **Total Pharmacy Orders** | Number of prescriptions invoiced |
| **Orders by Status** | **Dispensed** (fully handed over), **Partial** (part handed over), **Returned** (taken back) |
| **OPD vs Walk-in vs IPD / OT** | Share of orders by channel |
| **Sales by Channel** | Net sales per channel |
| **Average Order Value** | Net sales ÷ number of orders |

**Channels.** **OPD**: prescription from a doctor's outpatient consultation. **Walk-in**: counter sale to a customer, including OTC and outside prescriptions. **IPD / OT**: medicines issued to inpatients and surgery, paid in full at creation and settled in the Accounts service.

Hero rings: **Fully Dispensed**, **Returned Orders**, **OPD Share** (each as a share of all orders).

---

## 9. The ring gauges

The circular gauges on the banners show a percentage of a whole. A full circle is 100%. The gap shows what is missing. Each ring's definition is listed under its tab above.

---

## 10. Known limitations

- All data is sample data. Derived figures (marked *derived*) are simulated and will change once real data is connected.
- The Overview leaderboards for medications, procedures and packages are allocated from fixed shares and do not tie exactly to the Labs and Pharmacy pages.
- Patient retention and repeat-visit rate use the same formula; no 30-day window is applied.
- The Labs sample catalogue has no Vitamin D test, and Microbiology has no tests, so neither appears in Labs charts.
