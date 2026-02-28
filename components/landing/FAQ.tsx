"use client";

import { EVENT_CONFIG } from "@/lib/config";
import { useEffect, useRef } from "react";

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("revealed");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" ref={sectionRef} className="reveal-up py-20 sm:py-28 bg-[#080808] scroll-mt-20 relative">
      {/* Section divider */}
      <div className="section-divider mb-20" />

      <div className="max-w-3xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 mb-6">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span className="text-amber-400 text-[12px] font-semibold tracking-wider uppercase">
              Got Questions?
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {EVENT_CONFIG.faq.map(({ q, a }, i) => (
            <details
              key={i}
              className="group bg-white/[0.02] border border-white/6 rounded-2xl px-6 py-5 hover:border-amber-500/20 hover:bg-white/[0.04] transition-all duration-300"
            >
              <summary className="cursor-pointer flex justify-between items-center font-semibold text-white/80 text-[15px] list-none">
                {q}
                <svg
                  className="w-5 h-5 text-amber-500 shrink-0 ml-4 transition-transform duration-300 group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="mt-3 text-white/40 text-sm leading-relaxed">{a}</p>
            </details>
          ))}
        </div>

        <p className="text-center text-sm text-white/30 mt-12">
          Still have questions?{" "}
          <a href="mailto:info@nepaliparty.ca" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            Email us
          </a>
        </p>
      </div>
    </section>
  );
}
