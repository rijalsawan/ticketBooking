"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EVENT_CONFIG } from "@/lib/config";
import { formatPrice, availabilityLabel, seatsRemaining } from "@/lib/utils";
import {
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  FireworkBurst,
  SparkleCluster,
  Mandala,
  Lantern,
} from "@/components/ui/Icons";

interface HeroProps {
  totalTickets: number;
  soldTickets: number;
  eventDate?: string;
  doorsOpen?: string;
  venue?: string;
  price?: number; // cents
}

/* Floating particle rendered on canvas */
function useParticles(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; r: number; dx: number; dy: number; o: number;
      color: string;
    }
    const colors = [
      "255,191,36",   // amber
      "249,115,22",   // orange
      "220,38,38",    // red
      "255,255,255",  // white
    ];
    const particles: Particle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.offsetWidth,
      y: Math.random() * canvas.offsetHeight,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > canvas.offsetWidth) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.offsetHeight) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.o})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}

export default function Hero({ totalTickets, soldTickets, eventDate, doorsOpen, venue, price }: HeroProps) {
  const remaining = seatsRemaining(totalTickets, soldTickets);
  const availability = availabilityLabel(totalTickets, soldTickets);
  const soldOut = remaining === 0;
  const almostSold = remaining <= 20 && remaining > 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useParticles(canvasRef);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]"
      aria-label="Hero section"
    >
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-linear-to-br from-red-600/30 via-orange-500/20 to-transparent blur-[120px] animate-drift" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-linear-to-tr from-amber-500/20 via-red-700/15 to-transparent blur-[120px] animate-drift-reverse" />
        <div className="absolute top-[30%] left-[40%] w-[40vw] h-[40vw] rounded-full bg-linear-to-r from-orange-600/10 to-red-900/10 blur-[100px] animate-pulse-slow" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 z-1 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Decorative celebration SVGs */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        {/* Firework bursts */}
        <div className="absolute top-[10%] left-[8%] animate-firework">
          <FireworkBurst className="w-28 h-28 opacity-40" />
        </div>
        <div className="absolute top-[15%] right-[12%] animate-firework-delay">
          <FireworkBurst className="w-20 h-20 opacity-30" />
        </div>
        <div className="absolute bottom-[25%] right-[8%] animate-firework">
          <FireworkBurst className="w-24 h-24 opacity-25" />
        </div>

        {/* Sparkle clusters */}
        <div className="absolute top-[20%] left-[30%] animate-float">
          <SparkleCluster className="w-14 h-14 opacity-50" />
        </div>
        <div className="absolute bottom-[30%] left-[15%] animate-float-delay">
          <SparkleCluster className="w-10 h-10 opacity-40" />
        </div>

        {/* Mandala pattern */}
        <div className="absolute top-[5%] right-[5%] animate-drift hidden lg:block">
          <Mandala className="w-40 h-40" />
        </div>
        <div className="absolute bottom-[10%] left-[3%] animate-drift-reverse hidden lg:block">
          <Mandala className="w-32 h-32" />
        </div>

        {/* Floating lanterns */}
        <div className="absolute top-[25%] right-[25%] animate-float hidden sm:block">
          <Lantern className="w-8 h-12 opacity-40" />
        </div>
        <div className="absolute top-[35%] left-[12%] animate-float-delay hidden sm:block">
          <Lantern className="w-6 h-10 opacity-30" />
        </div>
      </div>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-2 w-full h-full pointer-events-none"
      />

      {/* Radial vignette */}
      <div className="absolute inset-0 z-3 bg-[radial-gradient(ellipse_at_center,transparent_0%,#050505_75%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 py-32 text-center">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 bg-white/4 backdrop-blur-sm mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-white/60 text-[13px] font-medium tracking-wide">
            Tickets Available Now
          </span>
        </div>

        {/* Nepali greeting with animated glow */}
        <p
          className={`text-amber-400/80 text-base sm:text-lg font-medium mb-4 tracking-wide text-glow transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          lang="ne"
        >
          नयाँ वर्षको शुभकामना!
        </p>

        {/* Main title with animated gradient text */}
        <h1
          className={`transition-all duration-1000 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[0.95]">
            Nepali New Year
          </span>
          <span className="block mt-2 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] gradient-text-animated">
            बैशाख १, २०८३
          </span>
        </h1>

        {/* Location */}
        <p
          className={`mt-6 text-lg sm:text-xl text-white/40 font-light tracking-wide transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Winnipeg, Manitoba, Canada
        </p>

        {/* Info pills — with SVG icons instead of emojis */}
        <div
          className={`flex flex-wrap justify-center gap-3 mt-8 mb-10 transition-all duration-700 delay-400 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {[
            { icon: <CalendarIcon className="w-4 h-4 text-amber-400/70" />, text: eventDate ?? EVENT_CONFIG.date },
            { icon: <ClockIcon className="w-4 h-4 text-amber-400/70" />, text: `Doors ${doorsOpen ?? EVENT_CONFIG.doorsOpen}` },
            { icon: <LocationIcon className="w-4 h-4 text-amber-400/70" />, text: venue ?? EVENT_CONFIG.venue },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/8 bg-white/3 backdrop-blur-sm text-white/50 text-sm"
            >
              {icon}
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Price + availability */}
        <div
          className={`flex flex-col items-center gap-3 mb-10 transition-all duration-700 delay-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
              {formatPrice(price ?? EVENT_CONFIG.ticketPrice * 100)}
            </span>
            <span className="text-lg text-white/30 font-light">/ person</span>
          </div>
          <p className="text-white/25 text-sm">
            + 5% GST · Includes entry · Bar available on-site
          </p>
          {almostSold && (
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm animate-pulse">
              <span className="w-2 h-2 bg-amber-400 rounded-full" />
              {availability}
            </div>
          )}
          {soldOut && (
            <div className="px-5 py-2 rounded-full bg-white/6 border border-white/8 text-white/50 font-semibold text-sm">
              Sold Out
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div
          className={`flex flex-wrap justify-center gap-4 transition-all duration-700 delay-600 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {!soldOut ? (
            <Link
              href="/checkout"
              className="group relative overflow-hidden bg-linear-to-r from-amber-500 via-orange-500 to-red-600 text-white font-bold text-lg px-10 py-4 rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-[1.03] inline-flex items-center gap-2"
            >
              <span className="relative z-10">Get Tickets</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="absolute inset-0 bg-linear-to-r from-amber-400 via-orange-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ) : (
            <span className="bg-white/6 border border-white/10 text-white/40 font-bold text-lg px-10 py-4 rounded-full cursor-not-allowed inline-block">
              Sold Out
            </span>
          )}
          <a
            href="#about"
            className="border border-white/12 text-white/60 hover:text-white hover:border-white/25 hover:bg-white/4 font-semibold text-lg px-8 py-4 rounded-full transition-all duration-300 inline-block"
          >
            Learn More
          </a>
        </div>

        
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-6 h-10 rounded-full border-2 border-white/15 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 bg-white/40 rounded-full animate-scroll-dot" />
        </div>
      </div>

      {/* Bottom gradient fade to dark background (seamless) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-[#080808] to-transparent z-5" />
    </section>
  );
}