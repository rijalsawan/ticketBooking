"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import { usePathname } from "next/navigation";

/* ── SVG icon components ─────────────────────────────────────────────────── */

function HomeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}

function InfoIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function SparklesIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z" />
    </svg>
  );
}

function HelpIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}

function TicketIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </svg>
  );
}

function UserIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function LogOutIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ShieldIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

/* ── NavItem ─────────────────────────────────────────────────────────────── */

interface NavItemProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  accent?: boolean;
  className?: string;
}

function NavItem({ href, onClick, icon, label, active, accent, className = "" }: NavItemProps) {
  const base = `group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 outline-none ${className}`;

  const style = accent
    ? "bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-600/20 hover:shadow-orange-600/35 hover:scale-105 active:scale-95"
    : active
      ? "bg-white/10 text-white"
      : "text-white/40 hover:text-white hover:bg-white/8 active:scale-95";

  const inner = (
    <>
      {icon}
      {/* Tooltip */}
      <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md text-[11px] font-medium text-white/80 whitespace-nowrap opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150">
        {label}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${base} ${style}`}>
        {inner}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${base} ${style}`}>
      {inner}
    </button>
  );
}

/* ── Navbar ──────────────────────────────────────────────────────────────── */

export default function Navbar() {
  const { data: session } = useSession();
  const { open: openAuthModal } = useAuthModal();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/6 shadow-2xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Left — Navigation icons */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          <NavItem href="/" icon={<HomeIcon />} label="Home" active={isHome} />

          {isHome && (
            <>
              <NavItem href="/#about" icon={<InfoIcon />} label="About" />
              <NavItem href="/#highlights" icon={<SparklesIcon />} label="Highlights" />
              
            </>
          )}

          {session?.user?.role === "ADMIN" && (
            <NavItem
              href="/admin"
              icon={<ShieldIcon />}
              label="Admin"
              active={pathname.startsWith("/admin")}
            />
          )}
        </nav>

        {/* Right — Auth + Get Tickets */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {session ? (
            <>
              <NavItem
                href="/tickets"
                icon={<TicketIcon />}
                label="My Tickets"
                active={pathname === "/tickets"}
              />
              <NavItem
                onClick={() => signOut({ callbackUrl: "/" })}
                icon={<LogOutIcon />}
                label="Sign Out"
              />
            </>
          ) : (
            <NavItem
              onClick={() => openAuthModal("signin")}
              icon={<UserIcon />}
              label="Sign In"
            />
          )}

          {/* Get Tickets CTA */}
          <NavItem
            href="/checkout"
            icon={<TicketIcon className="w-[18px] h-[18px]" />}
            label="Get Tickets"
            accent
            active={pathname === "/checkout"}
          />
        </div>
      </div>
    </header>
  );
}
