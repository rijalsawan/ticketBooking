"use client";

import Link from "next/link";
import { EVENT_CONFIG } from "@/lib/config";
import { formatPrice, seatsRemaining } from "@/lib/utils";
import { useMemo } from "react";

interface HeroProps {
  totalTickets: number;
  soldTickets: number;
  eventDate?: string;
  doorsOpen?: string;
  venue?: string;
  price?: number;
}

/* Deterministic pseudo-random using a simple seed — avoids hydration mismatches */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function Hero({ totalTickets, soldTickets, eventDate, doorsOpen, venue, price }: HeroProps) {
  const remaining = seatsRemaining(totalTickets, soldTickets);
  const soldOut = remaining === 0;
  const almostSold = remaining <= 20 && remaining > 0;

  /* Generate star positions once — deterministic so server & client match */
  const stars = useMemo(() => {
    const rand = seededRandom(2083);
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      size: 1 + rand() * 2,
      duration: 3 + rand() * 5,
      delay: rand() * 5,
      opacity: 0.2 + rand() * 0.5,
    }));
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden" aria-label="Hero">
      {/* ── Star field ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              opacity: s.opacity,
              animation: `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Ambient glow blobs ─────────────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Warm accent glow — upper right */}
        <div
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full opacity-[0.06]"
          style={{
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            animation: "float-slow 8s ease-in-out infinite",
          }}
        />
        {/* Cool subtle glow — lower left */}
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{
            background: "radial-gradient(circle, #a1a1aa 0%, transparent 70%)",
            animation: "float-slower 10s ease-in-out infinite",
          }}
        />
        {/* Small accent dot — center left */}
        <div
          className="absolute top-1/3 left-[15%] w-[200px] h-[200px] rounded-full opacity-[0.05]"
          style={{
            background: "radial-gradient(circle, var(--accent) 0%, transparent 70%)",
            animation: "float-slower 12s ease-in-out 2s infinite",
          }}
        />
      </div>

      {/* ── Content ────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto text-center py-32">
        {/* Nepali greeting */}
        <p className="hero-enter hero-delay-1 text-accent text-sm font-medium tracking-widest uppercase" lang="ne">
          नयाँ वर्षको शुभकामना
        </p>

        {/* Title */}
        <h1 className="hero-enter hero-delay-2 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mt-4">
          Nepali New Year
        </h1>
        <p className="hero-enter hero-delay-3 text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-muted-foreground leading-[1.1] mt-2">
          बैशाख १, २०८३
        </p>

        {/* Accent rule */}
        <div className="hero-enter hero-delay-4 flex items-center justify-center gap-3 mt-6">
          <span className="block h-px w-12 bg-accent/30" />
          <span className="block w-1 h-1 rounded-full bg-accent" />
          <span className="block h-px w-12 bg-accent/30" />
        </div>

        {/* Location */}
        <p className="hero-enter hero-delay-4 mt-4 text-muted-foreground text-sm">
          Winnipeg, Manitoba
        </p>

        {/* Info row */}
        <div className="hero-enter hero-delay-5 flex flex-wrap justify-center gap-x-2 gap-y-2 mt-5 text-sm text-muted-foreground">
          <span>{eventDate ?? EVENT_CONFIG.date}</span>
          <span className="text-accent/50">&#9670;</span>
          <span>Doors {doorsOpen ?? EVENT_CONFIG.doorsOpen}</span>
          <span className="text-accent/50">&#9670;</span>
          <span>{venue ?? EVENT_CONFIG.venue}</span>
        </div>

        {/* Price + availability */}
        <div className="hero-enter hero-delay-6 mt-8 flex flex-col items-center gap-2">
          <span className="text-4xl font-bold text-foreground">
            {formatPrice(price ?? EVENT_CONFIG.ticketPrice * 100)}
          </span>
          <span className="text-sm text-muted-foreground">per person · + 5% GST</span>
          {almostSold && (
            <span className="pulse-soft text-sm text-accent font-medium mt-1">
              Only {remaining} tickets left
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="hero-enter hero-delay-7 flex flex-wrap justify-center gap-3 mt-10">
          {!soldOut ? (
            <Link
              href="/checkout"
              className="group relative inline-flex items-center justify-center bg-accent text-accent-foreground font-medium px-7 py-3 rounded-md text-sm transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              Get Tickets
              <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          ) : (
            <span className="inline-flex items-center justify-center bg-secondary text-muted-foreground font-medium px-7 py-3 rounded-md text-sm cursor-not-allowed">
              Sold Out
            </span>
          )}
          <a
            href="#about"
            className="inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 font-medium px-7 py-3 rounded-md text-sm transition-all"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* ── Bottom fade to background ──────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, var(--background), transparent)" }}
        aria-hidden="true"
      />
    </section>
  );
}

