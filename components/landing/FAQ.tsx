"use client";

import { EVENT_CONFIG } from "@/lib/config";
import { ChevronIcon } from "@/components/ui/Icons";
import { useState, useRef, useEffect, useCallback } from "react";

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

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  useRevealChildren(sectionRef);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="px-4 py-20 max-w-3xl mx-auto" ref={sectionRef}>
      <h2 className="reveal text-2xl font-bold text-foreground mb-8">Frequently Asked Questions</h2>

      <div className="space-y-2">
        {EVENT_CONFIG.faq.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`reveal stagger-${Math.min(i + 1, 6)} rounded-md border transition-colors duration-200 ${
                isOpen ? "border-accent/30 bg-card" : "border-border bg-transparent hover:bg-card/50"
              }`}
            >
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-left text-sm font-medium text-foreground transition-colors"
                aria-expanded={isOpen}
              >
                <span>{item.q}</span>
                <ChevronIcon
                  className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Smooth height expand via grid-rows trick */}
              <div className={`accordion-content ${isOpen ? "open" : ""}`}>
                <div>
                  <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

