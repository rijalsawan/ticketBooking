/**
 * Custom SVG icons for the Nepali New Year celebration site.
 * Every icon is a hand-crafted SVG — no emojis, no icon library deps.
 */

interface IconProps {
  className?: string;
}

/* ── Event Info Icons ─────────────────────────────────────────────────────── */

export function CalendarIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ClockIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function LocationIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function MapIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  );
}

export function MoonIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function DollarIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

/* ── Celebration / Highlight Icons ────────────────────────────────────────── */

export function MusicIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

export function FoodIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 17h18" />
      <path d="M4 17c0-4.418 3.582-8 8-8s8 3.582 8 8" />
      <line x1="12" y1="3" x2="12" y2="5" />
      <line x1="8" y1="4" x2="9" y2="6" />
      <line x1="16" y1="4" x2="15" y2="6" />
      <path d="M5 20h14" />
    </svg>
  );
}

export function DanceIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v5" />
      <path d="M8 9l4 2 4-2" />
      <path d="M12 11l-4 7" />
      <path d="M12 11l4 7" />
      <path d="M6 22l2-4" />
      <path d="M18 22l-2-4" />
    </svg>
  );
}

export function GamepadIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="4" />
      <line x1="6" y1="10" x2="6" y2="14" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <circle cx="16" cy="10" r="0.75" fill="currentColor" />
      <circle cx="18" cy="12" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function DrinkIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2h8l-1 10a4 4 0 0 1-3 3.88V20h4v2H8v-2h4v-4.12A4 4 0 0 1 9 12L8 2z" />
      <path d="M8 2l14 4" />
    </svg>
  );
}

export function DressIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L9 7h6L12 2z" />
      <path d="M9 7l-3 8h12l-3-8" />
      <path d="M6 15l-2 7h16l-2-7" />
      <line x1="12" y1="7" x2="12" y2="15" />
    </svg>
  );
}

export function PartyIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="2 22 4 2 12 10 20 2 22 22" />
      <line x1="7" y1="10" x2="7" y2="16" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="17" y1="10" x2="17" y2="16" />
    </svg>
  );
}

/* ── Decorative Celebration SVGs (for backgrounds, visual flair) ──────────── */

export function FireworkBurst({ className = "w-24 h-24" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      {/* Center burst */}
      <circle cx="50" cy="50" r="3" fill="url(#fw-grad)" />
      {/* Rays */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x2 = 50 + Math.cos(rad) * 35;
        const y2 = 50 + Math.sin(rad) * 35;
        const mx = 50 + Math.cos(rad) * 18;
        const my = 50 + Math.sin(rad) * 18;
        return (
          <g key={angle}>
            <line x1={mx} y1={my} x2={x2} y2={y2} stroke="url(#fw-grad)" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            <circle cx={x2} cy={y2} r="1.5" fill="url(#fw-grad)" opacity="0.8" />
          </g>
        );
      })}
      {/* Sparkle dots between rays */}
      {[15, 75, 135, 195, 255, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 50 + Math.cos(rad) * 26;
        const y = 50 + Math.sin(rad) * 26;
        return <circle key={angle} cx={x} cy={y} r="1" fill="#fbbf24" opacity="0.5" />;
      })}
      <defs>
        <linearGradient id="fw-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SparkleCluster({ className = "w-16 h-16" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none">
      {/* Large 4-point star */}
      <path d="M30 8 L33 25 L50 28 L33 31 L30 48 L27 31 L10 28 L27 25Z" fill="url(#sparkle-grad)" opacity="0.7" />
      {/* Small stars */}
      <path d="M15 12 L16 16 L20 17 L16 18 L15 22 L14 18 L10 17 L14 16Z" fill="#fbbf24" opacity="0.5" />
      <path d="M45 40 L46 43 L49 44 L46 45 L45 48 L44 45 L41 44 L44 43Z" fill="#f97316" opacity="0.5" />
      <path d="M48 10 L49 13 L52 14 L49 15 L48 18 L47 15 L44 14 L47 13Z" fill="#fbbf24" opacity="0.4" />
      <defs>
        <linearGradient id="sparkle-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Mandala({ className = "w-32 h-32" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" stroke="url(#mandala-grad)" strokeWidth="0.8" opacity="0.15">
      <circle cx="60" cy="60" r="20" />
      <circle cx="60" cy="60" r="35" />
      <circle cx="60" cy="60" r="50" />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x = 60 + Math.cos(rad) * 50;
        const y = 60 + Math.sin(rad) * 50;
        return (
          <g key={angle}>
            <line x1="60" y1="60" x2={x} y2={y} />
            <ellipse
              cx={60 + Math.cos(rad) * 27}
              cy={60 + Math.sin(rad) * 27}
              rx="8"
              ry="4"
              transform={`rotate(${angle}, ${60 + Math.cos(rad) * 27}, ${60 + Math.sin(rad) * 27})`}
            />
          </g>
        );
      })}
      <defs>
        <linearGradient id="mandala-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function ConfettiPiece({ className = "w-3 h-8", color = "#fbbf24" }: IconProps & { color?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 32" fill={color} opacity="0.6">
      <rect x="3" y="0" width="6" height="32" rx="3" />
    </svg>
  );
}

export function Lantern({ className = "w-10 h-14" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 56" fill="none">
      {/* String */}
      <line x1="20" y1="0" x2="20" y2="10" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
      {/* Top hook */}
      <path d="M16 10h8" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      {/* Lantern body */}
      <ellipse cx="20" cy="30" rx="14" ry="18" fill="url(#lantern-grad)" opacity="0.25" />
      <ellipse cx="20" cy="30" rx="14" ry="18" stroke="url(#lantern-grad)" strokeWidth="1" opacity="0.5" />
      {/* Inner glow */}
      <ellipse cx="20" cy="30" rx="6" ry="10" fill="#fbbf24" opacity="0.15" />
      {/* Ribs */}
      <line x1="20" y1="12" x2="20" y2="48" stroke="#f97316" strokeWidth="0.5" opacity="0.3" />
      <path d="M10 15 Q20 30 10 45" stroke="#f97316" strokeWidth="0.5" opacity="0.2" fill="none" />
      <path d="M30 15 Q20 30 30 45" stroke="#f97316" strokeWidth="0.5" opacity="0.2" fill="none" />
      {/* Bottom */}
      <path d="M16 48h8" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="48" x2="20" y2="54" stroke="#fbbf24" strokeWidth="0.8" opacity="0.4" />
      <defs>
        <radialGradient id="lantern-grad" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="70%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#dc2626" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ChevronIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
