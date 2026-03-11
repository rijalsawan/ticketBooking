import Link from "next/link";
import { SITE_CONFIG, EVENT_CONFIG } from "@/lib/config";
import { CalendarIcon, ClockIcon, LocationIcon } from "@/components/ui/Icons";

export default function Footer() {
  return (
    <footer className="relative border-t border-border bg-card">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-accent/20" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-foreground text-sm">Nava Varsha 2083</h3>
            <p className="mt-1 text-xs text-accent font-medium" lang="ne">
              नेपाली नयाँ वर्ष उत्सव
            </p>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              A celebration of Nepali New Year for the Winnipeg community.
            </p>
            <div className="flex gap-3 mt-4">
              {SITE_CONFIG.socialLinks.facebook && (
                <a
                  href={SITE_CONFIG.socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all text-xs"
                >
                  Facebook
                </a>
              )}
              {SITE_CONFIG.socialLinks.instagram && (
                <a
                  href={SITE_CONFIG.socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all text-xs"
                >
                  Instagram
                </a>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div>
            <h4 className="font-medium text-foreground text-sm mb-3">Event Info</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5 text-accent" />
                {EVENT_CONFIG.date}
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <ClockIcon className="w-3.5 h-3.5 text-accent" />
                Doors {EVENT_CONFIG.doorsOpen}
              </li>
              <li className="flex items-center gap-2 text-xs text-muted-foreground">
                <LocationIcon className="w-3.5 h-3.5 text-accent" />
                {EVENT_CONFIG.venue}
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/checkout" className="text-xs text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all inline-block">
                  Buy Tickets
                </Link>
              </li>
              <li>
                <Link href="/tickets" className="text-xs text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all inline-block">
                  My Tickets
                </Link>
              </li>
              <li>
                <a href={`mailto:${SITE_CONFIG.contactEmail}`} className="text-xs text-muted-foreground hover:text-foreground hover:-translate-y-0.5 transition-all inline-block">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {EVENT_CONFIG.address}
          </p>
        </div>
      </div>
    </footer>
  );
}

