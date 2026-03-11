"use client";

import { EVENT_CONFIG } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import { CalendarIcon, ClockIcon, LocationIcon, DollarIcon } from "@/components/ui/Icons";
import Link from "next/link";
import { useEffect, useRef, useCallback } from "react";

interface EventDetailsProps {
  eventDate?: string;
  doorsOpen?: string;
  endTime?: string;
  venue?: string;
  address?: string;
  price?: number;
  highlights?: string[];
}

/** Adds .visible to .reveal children when they enter the viewport */
function useRevealChildren(ref: React.RefObject<HTMLElement | null>) {
  const observed = useRef(false);

  const observe = useCallback(() => {
    const el = ref.current;
    if (!el || observed.current) return;
    observed.current = true;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    el.querySelectorAll(".reveal").forEach((child) => io.observe(child));
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    observe();
  }, [observe]);
}

export default function EventDetails({
  eventDate,
  doorsOpen,
  endTime,
  venue,
  address,
  price,
  highlights,
}: EventDetailsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useRevealChildren(sectionRef);

  const items = [
    { icon: CalendarIcon, label: "Date", value: eventDate ?? EVENT_CONFIG.date },
    { icon: ClockIcon, label: "Doors Open", value: doorsOpen ?? EVENT_CONFIG.doorsOpen },
    { icon: ClockIcon, label: "Ends", value: endTime ?? EVENT_CONFIG.endTime },
    { icon: LocationIcon, label: "Venue", value: venue ?? EVENT_CONFIG.venue },
    { icon: LocationIcon, label: "Address", value: address ?? EVENT_CONFIG.address },
    { icon: DollarIcon, label: "Price", value: `${formatPrice(price ?? EVENT_CONFIG.ticketPrice * 100)} + 5% GST` },
  ];

  const highlightList = highlights ?? EVENT_CONFIG.highlights;

  return (
    <section id="about" className="px-4 py-20 max-w-3xl mx-auto" ref={sectionRef}>
      {/* Section heading */}
      <h2 className="reveal text-2xl font-bold text-foreground mb-8">Event Details</h2>

      {/* Info grid */}
      <div className="grid sm:grid-cols-2 gap-4 mb-12">
        {items.map((item, i) => (
          <div
            key={item.label}
            className={`reveal stagger-${i + 1} flex items-start gap-3 rounded-md border border-border bg-card p-4 transition-all duration-300 hover:scale-[1.02] hover:border-accent/30`}
          >
            <item.icon className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights */}
      <h3 className="reveal text-lg font-semibold text-foreground mb-4">What to Expect</h3>
      <ul className="space-y-2 mb-10">
        {highlightList.map((item, i) => (
          <li
            key={i}
            className={`reveal stagger-${Math.min(i + 1, 6)} flex items-center gap-3 text-sm text-muted-foreground py-1`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
            {item}
          </li>
        ))}
      </ul>

      {/* Map link */}
      <div className="reveal">
        <a
          href={EVENT_CONFIG.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-accent hover:underline transition-colors"
        >
          <LocationIcon className="w-4 h-4" />
          View on Google Maps
        </a>
      </div>

      {/* CTA */}
      <div className="reveal mt-16 text-center">
        <Link
          href="/checkout"
          className="group inline-flex items-center justify-center bg-accent text-accent-foreground font-medium px-6 py-2.5 rounded-md text-sm transition-all hover:bg-accent/90 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        >
          Get Your Tickets
          <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

