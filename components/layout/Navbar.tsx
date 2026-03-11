"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EVENT_CONFIG } from "@/lib/config";

const links = [
  { href: "/checkout", label: "Buy Tickets" },
  { href: "/tickets", label: "My Tickets" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock body scroll when sidebar is open */
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/80 backdrop-blur-md border-b border-border"
            : "bg-transparent",
        )}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            New&nbsp;Year&nbsp;2083
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "nav-underline px-3 py-1.5 rounded-md text-sm transition-colors",
                  pathname === l.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger — 3 bars morphing to X */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sm:hidden relative w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <span className="block relative w-[18px] h-[14px]">
              <span
                className={cn(
                  "absolute left-0 h-[1.5px] w-full bg-current transition-all duration-300 ease-out",
                  sidebarOpen ? "top-[6px] rotate-45" : "top-0 rotate-0",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-[6px] h-[1.5px] w-full bg-current transition-all duration-200 ease-out",
                  sidebarOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 h-[1.5px] w-full bg-current transition-all duration-300 ease-out",
                  sidebarOpen ? "top-[6px] -rotate-45" : "top-[12px] rotate-0",
                )}
              />
            </span>
          </button>
        </div>
      </header>

      {/* ── Mobile sidebar overlay + panel ─────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] sm:hidden" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            style={{ animation: "fade-in-overlay 0.25s ease-out" }}
            onClick={closeSidebar}
            aria-hidden="true"
          />

          {/* Panel */}
          <aside
            className="absolute top-0 right-0 bottom-0 w-[280px] max-w-[80vw] bg-card border-l border-border flex flex-col"
            style={{ animation: "slide-in-right 0.3s ease-out" }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-5 h-14 border-b border-border">
              <span className="text-xs text-muted-foreground font-medium tracking-widest uppercase">Menu</span>
              <button
                onClick={closeSidebar}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
              <Link
                href="/"
                onClick={closeSidebar}
                className={cn(
                  "px-3 py-2.5 rounded-md text-sm transition-colors",
                  pathname === "/"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                )}
                style={{ animation: "slide-up 0.3s ease-out 0.05s both" }}
              >
                Home
              </Link>
              {links.map((l, i) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeSidebar}
                  className={cn(
                    "px-3 py-2.5 rounded-md text-sm transition-colors",
                    pathname === l.href
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                  style={{ animation: `slide-up 0.3s ease-out ${0.1 + i * 0.05}s both` }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Event info at bottom */}
            <div className="border-t border-border px-5 py-4">
              <p className="text-xs text-muted-foreground">{EVENT_CONFIG.date}</p>
              <p className="text-xs text-muted-foreground mt-1">{EVENT_CONFIG.venue}</p>
              <p className="text-xs text-accent mt-1">{EVENT_CONFIG.nepaliDate}</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

