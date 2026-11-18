"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavigationLinks from "./NavigationLinks";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [navigationOpen, setNavigationOpen] = useState(false);

  function closeNavigation() {
    if (dialogRef.current?.open) dialogRef.current.close();
  }

  useEffect(() => {
    // Layouts persist across Next navigation, including browser back/forward.
    if (dialogRef.current?.open) dialogRef.current.close();
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    function onResize() {
      if (desktop.matches && dialogRef.current?.open) dialogRef.current.close();
    }
    desktop.addEventListener("change", onResize);
    return () => desktop.removeEventListener("change", onResize);
  }, []);

  useEffect(() => {
    if (!navigationOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [navigationOpen]);

  return (
    <div className="flex flex-1 flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3 focus:text-blue-800 focus:outline focus:outline-2"
      >
        Skip to main content
      </a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="min-w-0 truncate text-base font-bold text-slate-900 sm:text-xl">
            Census Income Predictor
          </Link>
          {home && (
            <nav aria-label="Primary navigation" className="hidden shrink-0 items-center gap-1 lg:flex">
              <NavigationLinks pathname={pathname} />
            </nav>
          )}
          <button
            type="button"
            aria-label="Open navigation"
            aria-controls="mobile-navigation"
            aria-expanded={navigationOpen}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 lg:hidden"
            onClick={() => {
              if (dialogRef.current && !dialogRef.current.open) {
                dialogRef.current.showModal();
                setNavigationOpen(true);
              }
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-screen-2xl flex-1">
        {!home && (
          <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
            <nav aria-label="Sidebar navigation" className="sticky top-4 space-y-1">
              <NavigationLinks pathname={pathname} />
            </nav>
          </aside>
        )}
        <main id="main-content" tabIndex={-1} className="w-full min-w-0 flex-1">
          {children}
        </main>
      </div>
      <dialog
        ref={dialogRef}
        id="mobile-navigation"
        aria-labelledby="mobile-navigation-title"
        className="fixed bottom-auto left-0 right-auto top-0 m-0 h-dvh max-h-none w-80 max-w-[calc(100vw-2rem)] rounded-r-xl border-0 bg-white p-0 text-slate-900 shadow-xl backdrop:bg-slate-950/40"
        onClose={() => setNavigationOpen(false)}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled])'
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeNavigation();
        }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4">
          <h2 id="mobile-navigation-title" className="text-lg font-semibold">Navigation</h2>
          <button
            type="button"
            aria-label="Close navigation"
            className="min-h-11 rounded-lg border border-slate-300 px-3 text-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
            onClick={closeNavigation}
            autoFocus
          >
            Close
          </button>
        </div>
        <nav aria-label="Mobile navigation" className="space-y-1 p-4">
          <NavigationLinks pathname={pathname} onNavigate={closeNavigation} />
        </nav>
        <p className="border-t border-slate-200 p-4 text-sm text-slate-500">
          Educational demo. Not for real-world decisions.
        </p>
      </dialog>
    </div>
  );
}
