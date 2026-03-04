"use client";

import Link from "next/link";
import { EVENT_CONFIG } from "@/lib/config";
import { useEffect, useRef } from "react";
import {
  CalendarIcon,
  ClockIcon,
  PartyIcon,
  MoonIcon,
  LocationIcon,
  MapIcon,
  DollarIcon,
  DrinkIcon,
  MusicIcon,
  FoodIcon,
  DanceIcon,
  GamepadIcon,
  DressIcon,
  SparkleCluster,
} from "@/components/ui/Icons";

function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

/* Map config highlights to proper SVG icons */
const highlightIcons = [
  <MusicIcon key="music" className="w-5 h-5" />,
  <FoodIcon key="food" className="w-5 h-5" />,
  <DanceIcon key="dance" className="w-5 h-5" />,
  <GamepadIcon key="game" className="w-5 h-5" />,
  <DrinkIcon key="drink" className="w-5 h-5" />,
  <DressIcon key="dress" className="w-5 h-5" />,
];

/* Strip leading emoji from highlight strings */
function stripEmoji(str: string) {
  return str.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F]+\s*/u, "");
}

interface EventDetailsProps {
  eventDate?: string;
  doorsOpen?: string;
  endTime?: string;
  venue?: string;
  address?: string;
  price?: number; // cents
  highlights?: string[];
}

export default function EventDetails({ eventDate, doorsOpen, endTime, venue, address, price, highlights }: EventDetailsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useReveal(sectionRef);

  const infoItems = [
    { icon: <CalendarIcon className="w-5 h-5 text-amber-400" />, label: "Date", value: eventDate ?? EVENT_CONFIG.date },
    { icon: <ClockIcon className="w-5 h-5 text-amber-400" />, label: "Doors Open", value: doorsOpen ?? EVENT_CONFIG.doorsOpen },
    
    { icon: <MoonIcon className="w-5 h-5 text-amber-400" />, label: "Ends", value: endTime ?? EVENT_CONFIG.endTime },
    { icon: <LocationIcon className="w-5 h-5 text-amber-400" />, label: "Venue", value: venue ?? EVENT_CONFIG.venue },
    { icon: <MapIcon className="w-5 h-5 text-amber-400" />, label: "Address", value: address ?? EVENT_CONFIG.address },
    { icon: <DollarIcon className="w-5 h-5 text-amber-400" />, label: "Admission", value: `$${price != null ? (price / 100).toFixed(0) : EVENT_CONFIG.ticketPrice} CAD (+5% GST)` },
    { icon: <DrinkIcon className="w-5 h-5 text-amber-400" />, label: "Bar", value: "On-site · pay as you go (negotiated prices)" },
  ];

  return (
    <section
      id="about"
      ref={sectionRef}
      className="reveal-up py-20 sm:py-28 bg-[#080808] scroll-mt-20 relative overflow-hidden"
    >
      {/* Subtle decorative sparkle */}
      <div className="absolute top-12 right-10 pointer-events-none opacity-30 hidden lg:block">
        <SparkleCluster className="w-16 h-16" />
      </div>

      {/* Section divider */}
      <div className="section-divider mb-20" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span className="text-amber-400 text-[12px] font-semibold tracking-wider uppercase">
              About the Event
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Celebrate the Nepali New Year
            <br />
            <span className="gradient-text-animated">with Your Community</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — description + info */}
          <div>
            <p className="text-white/50 text-base sm:text-lg leading-relaxed mb-5">
              Join the Winnipeg Nepali community for a joyful celebration of{" "}
              <strong className="text-white/80">Nepali New Year 2082 BS (Nava Varsha)</strong>. This is a casual,
              vibrant evening filled with culture, good food, live music, and the warmth
              of our community — a perfect break from the daily routine to reconnect and celebrate.
            </p>
            <p className="text-white/40 text-base leading-relaxed mb-10">
              Whether you&apos;re a longtime member of the Nepali diaspora or a newcomer to Winnipeg,
              everyone is welcome to experience the festival spirit of Baisakh.
            </p>

            {/* Info grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {infoItems.map(({ icon, label, value }) => (
                <div
                  key={label}
                  className="group flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/6 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all duration-300"
                >
                  <span className="shrink-0 mt-0.5 group-hover:scale-110 transition-transform duration-300" aria-hidden>
                    {icon}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold text-white/30 uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="block text-sm text-white/60 font-medium mt-0.5 leading-snug">
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — highlights card */}
          <div className="relative" id="highlights">
            <div className="relative bg-linear-to-br from-[#111111] via-[#0e0e0e] to-[#0a0a0a] rounded-3xl p-8 sm:p-10 text-white shadow-2xl overflow-hidden border border-white/5">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-linear-to-bl from-amber-500/15 to-transparent rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-red-600/10 to-transparent rounded-full blur-3xl" />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/4 border border-white/6 mb-6">
                  <svg className="w-3 h-3 text-amber-400" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
                    What&apos;s Included
                  </span>
                </div>

                <ul className="space-y-4">
                  {(highlights ?? EVENT_CONFIG.highlights).map((h, i) => (
                    <li key={h} className="flex items-start gap-3 group">
                      <span className="shrink-0 mt-0.5 text-amber-400/70 group-hover:text-amber-400 group-hover:scale-110 transition-all duration-300">
                        {highlightIcons[i] ?? <MusicIcon className="w-5 h-5" />}
                      </span>
                      <span className="text-white/60 text-[15px] leading-relaxed group-hover:text-white/85 transition-colors duration-300">
                        {stripEmoji(h)}
                      </span>
                    </li>
                  ))}
                </ul>

                
              </div>
            </div>

            
          </div>
        </div>

        
      </div>
    </section>
  );
}
