import type { Metadata } from "next";
import Link from "next/link";
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
        <header className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <Link href="/" className="text-xl font-bold text-slate-900">
                Census Income Predictor
              </Link>
              <nav className="flex gap-6 text-sm font-medium text-slate-600">
                <Link href="/" className="hover:text-slate-900 transition-colors">
                  Home
                </Link>
                <Link href="/predict" className="hover:text-slate-900 transition-colors">
                  Predict
                </Link>
                <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                  Dashboard
                </Link>
                <Link href="/about" className="hover:text-slate-900 transition-colors">
                  About
                </Link>
              </nav>
            </div>
          </div>
        </header>
        <main className="flex-1">{children}</main>
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
