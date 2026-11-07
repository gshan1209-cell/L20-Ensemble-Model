import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adult Census Income Predictor",
  description:
    "Predict whether an individual's income exceeds $50K based on census data using machine learning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AppShell>{children}</AppShell>
        <footer className="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
          <p>
            Adult Census Income Predictor &mdash; For educational and portfolio purposes only.
            Not intended for real-world decisions.
          </p>
        </footer>
      </body>
    </html>
  );
}
