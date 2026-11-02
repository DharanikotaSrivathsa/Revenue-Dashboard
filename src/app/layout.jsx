import { Inter } from "next/font/google";
import "./globals.css";

// Inter is used on the analytics pages (.ov-root) with tabular figures for money and counts (.font-data)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  title: "Doccure HMS | Doctor Performance & Multi-Entity Hospital Intelligence",
  description: "Enterprise clinical governance, physician scorecards, department analytics, lab operations, and pharmacy revenue intelligence system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  );
}
