import Link from "next/link";
import { SITE_CONFIG, EVENT_CONFIG } from "@/lib/config";
import {
  CalendarIcon,
  ClockIcon,
  LocationIcon,
  MapIcon,
} from "@/components/ui/Icons";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-[#060606] text-white/50 relative overflow-hidden">
      {/* Subtle top gradient line */}
      <div className="h-px bg-linear-to-r from-transparent via-orange-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 relative">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 via-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/15">
              <span className="text-white font-black text-xs tracking-tighter">NY</span>
            </div>
            <span className="text-white font-bold text-[15px] tracking-tight">
              Nepali New Year Winnipeg
            </span>
          </div>
          <p className="text-sm text-white/30 leading-relaxed mb-5">
            Celebrating the Nepali community in Winnipeg, Manitoba, Canada.
            <br />
            <span lang="ne">नयाँ वर्षको शुभकामना!</span>
          </p>
          {/* Social links */}
          <div className="flex gap-3">
            {[
              { href: SITE_CONFIG.socialLinks.facebook, label: "Facebook", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              { href: SITE_CONFIG.socialLinks.instagram, label: "Instagram", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg> },
              { href: SITE_CONFIG.socialLinks.twitter, label: "X", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
            ].map(({ href, label, icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full bg-white/6 border border-white/6 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all duration-300"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Event */}
        <div>
          <h4 className="text-white/70 font-semibold text-[13px] uppercase tracking-wider mb-5">
            Event Info
          </h4>
          <ul className="text-sm text-white/30 space-y-3">
            <li className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-amber-500/50" /> {EVENT_CONFIG.date}
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-amber-500/50" /> Doors {EVENT_CONFIG.doorsOpen}
            </li>
            <li className="flex items-center gap-2">
              <LocationIcon className="w-4 h-4 text-amber-500/50" /> {EVENT_CONFIG.venue}
            </li>
            <li className="flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-amber-500/50" />
              <a href={EVENT_CONFIG.mapsUrl} target="_blank" rel="noopener noreferrer"
                 className="hover:text-white/60 underline underline-offset-2 decoration-white/10 hover:decoration-white/30 transition-colors">
                Directions
              </a>
            </li>
          </ul>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-white/70 font-semibold text-[13px] uppercase tracking-wider mb-5">
            Quick Links
          </h4>
          <ul className="text-sm text-white/30 space-y-3">
            {[
              { href: "/checkout", label: "Buy Tickets" },
              { href: "/tickets", label: "My Tickets" },
              { href: "/#faq", label: "FAQ" },
            ].map(({ href, label }) => (
              <li key={label}>
                <Link href={href} className="hover:text-white/60 transition-colors duration-300">
                  {label}
                </Link>
              </li>
            ))}
            <li>
              <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="hover:text-white/60 transition-colors duration-300">
                Contact Us
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/6 px-5 py-5 text-center text-[12px] text-white/20">
        © {year} {SITE_CONFIG.name}. All rights reserved. ·{" "}
        <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="hover:text-white/40 transition-colors">
          {SITE_CONFIG.contactEmail}
        </a>
      </div>
    </footer>
  );
}
