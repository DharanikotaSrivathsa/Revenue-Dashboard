# Doccure Hospital Commercial & Operational Analytics Platform

A high-performance executive analytics dashboard for healthcare systems, built with **Next.js 16 (Turbopack)**, **React 19**, and **Tailwind CSS**.

---

## 🚀 Quick Start on Windows

### Prerequisites
- **Node.js** (v18.x, v20.x, or higher) installed. Download from [https://nodejs.org/](https://nodejs.org/) if you don't have it.

### Option 1: 1-Click Launch (Easiest)
1. Extract the downloaded zip file into any folder (e.g., `C:\Projects\doccure-analytics`).
2. Double-click **`start_windows.bat`**.
3. It will automatically check for Node.js, install dependencies on the first run, launch your browser, and open **`http://localhost:3000`**.

---

### Option 2: Command Line (CMD or PowerShell)
1. Open PowerShell or Command Prompt in the extracted folder:
   ```cmd
   cd path\to\doccure-analytics
   ```
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the development server:
   ```cmd
   npm run dev
   ```
4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

---

## 🛠️ Available NPM Scripts

- `npm run dev` — Starts local development server on `http://localhost:3000` with Turbopack.
- `npm run build` — Compiles optimized production build.
- `npm start` — Runs the compiled production server.
- `npm test` — Executes all 9 test suites validating non-revenue calculations, revenue totals, continuity of care, and doctor performance metrics.

---

## 📊 Modules & Features Included

1. **Executive Revenue Overview** (`/?tab=overview`):
   - Hospital macro financial velocity (Billed Invoices ₹5,03,124, Settled Collections ₹3,37,245, 67% Cash Rate).
   - Revenue & Collection Velocity Trajectory chart.
   - 6 Billing-Engine Stream decomposition (Consultation, Treatment, Inpatient IPD, Registration, Packages, Services).
   - Top Products & Services Sold leaderboard (Labs, Medications, Procedures, Packages).
   - Top Clinician Performers Commercial Leaderboard.
   - Settlement Mode breakdown (UPI, Cards, Cash, Bank, Insurance).

2. **Clinician Commercial Intelligence** (`/?tab=doctors`):
   - 3 sub-views:
     - **Commercial Overview**: Yield by doctor, direct OPD & procedures vs ancillary orders.
     - **Top Products Sold**: Detailed breakdown of lab tests, medications prescribed, and procedures performed per clinician.
     - **Commercial Ranking Matrix**: 12-parameter sorting matrix (Gross billed, cash collections, conversion rate, Rx rate, ticket size) with CSV export.
   - Slide-out **Doctor Drawer** with dedicated commercial performance scorecard.

3. **Department Performance** (`/?tab=departments`):
   - Cardiology, General Medicine, Orthopedics, Dermatology, and Gynecology scorecards.
   - Stacked SVG bar chart analyzing department yield across OPD, Labs, Pharmacy, and Procedures.
   - Specialty revenue contribution share breakdown.

4. **Diagnostics Laboratory** (`/?tab=labs`):
   - Revenue recognition waterfall (Gross MRP ₹1,12,650 -> Package ₹0 / Discounts -> Collected Receipts -> Refunds -> Net Labs Revenue ₹91,010).
   - Turnaround Time (TAT) speedometers with critical panic values.
   - Single tests vs bundled profiles tariff analysis.
   - Disciplines yield (Biochemistry, Hematology, Pathology, Microbiology, Radiology).

5. **Pharmacy Dispensary** (`/?tab=pharmacy`):
   - Sales reconciliation (Gross Sales ₹1,02,400 -> Patient Returns -> Net Realized ₹87,200).
   - Output GST (12%) and Acquisition COGS tracking.
   - True dispensary net margin calculation.
   - Therapeutic formulary distribution.

---

## 📁 Project Structure

```
├── package.json          # Dependencies & npm scripts
├── next.config.mjs       # Next.js Turbopack configuration
├── tailwind.config.js    # Tailwind styling tokens & fonts
├── postcss.config.js     # PostCSS plugins
├── start_windows.bat     # 1-click Windows launcher
├── src/
│   ├── app/              # Next.js App Router (layout.jsx, page.jsx, globals.css)
│   ├── components/       # UI modules & operational views
│   └── data/
│       ├── mockData.js               # Clinical dataset (192 encounters, 6 doctors, 5 departments)
│       ├── commercialAnalytics.js    # Top products, packages & ranking engine
│       └── nonRevenueCalculations.js # Clinical workflow & continuity of care formulas
└── tests/
    └── non_revenue_validation.test.js # 9-suite verification test runner
```
