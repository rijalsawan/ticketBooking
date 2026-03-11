"use client";

import { QRCodeSVG } from "qrcode.react";

interface TicketCardProps {
  ticket: {
    id: string;
    ticketNumber: string;
    qrCode: string;
    isUsed: boolean;
    holderName?: string | null;
    holderEmail?: string | null;
    ticketType?: string | null;
    groupSize?: number | null;
    groupMembers?: unknown;
  };
  event: {
    title: string;
    date: Date | string;
    doorsOpen?: Date | string | null;
    venue: string;
    address: string;
  };
  orderTotal: number;
  orderQuantity: number;
}

export default function TicketCard({ ticket, event }: TicketCardProps) {
  const isGroup = ticket.ticketType === "GROUP";

  let members: string[] = [];
  if (isGroup && ticket.groupMembers) {
    try {
      const raw = typeof ticket.groupMembers === "string"
        ? JSON.parse(ticket.groupMembers)
        : ticket.groupMembers;
      if (Array.isArray(raw)) {
        members = raw.map((m: unknown) =>
          typeof m === "string" ? m : (m as { name?: string })?.name ?? ""
        ).filter(Boolean);
      }
    } catch { /* ignore */ }
  }

  const formatDate = (d: Date | string) => {
    try { return new Date(d).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", year: "numeric" }); }
    catch { return String(d); }
  };

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden print:border-gray-300 print:bg-white">
      <div className="flex flex-col sm:flex-row">
        {/* Left — event info */}
        <div className="flex-1 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${ticket.isUsed ? "bg-muted-foreground" : "bg-emerald-400"}`} />
              <span className={`text-xs font-medium ${ticket.isUsed ? "text-muted-foreground" : "text-emerald-400"}`}>
                {ticket.isUsed ? "Used" : "Valid"}
              </span>
              {isGroup && (
                <span className="text-xs font-medium bg-accent/10 text-accent px-1.5 py-0.5 rounded-md">
                  Group · {ticket.groupSize ?? (members.length || 1)}
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</span>
          </div>

          <h3 className="text-base font-semibold text-foreground mb-4">{event.title}</h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>{event.venue}</span>
            </div>
            {ticket.holderName && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>{ticket.holderName}</span>
              </div>
            )}
          </div>

          {isGroup && members.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1.5">Group Members</p>
              <div className="flex flex-wrap gap-1.5">
                {members.map((name, i) => (
                  <span key={i} className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded-md">
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border border-dashed">
            <button
              onClick={() => window.print()}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 print:hidden cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print
            </button>
            <span className="text-xs text-muted-foreground/50">Show QR at entrance</span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-border border-dashed" />
        <div className="sm:hidden h-px bg-border border-dashed mx-5" />

        {/* Right — QR */}
        <div className="flex flex-col items-center justify-center p-5 sm:w-48">
          <div className="bg-white p-2.5 rounded-lg">
            <QRCodeSVG
              value={ticket.ticketNumber}
              size={140}
              bgColor="#ffffff"
              fgColor="#111111"
              level="M"
            />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-2 tracking-wider">{ticket.ticketNumber}</p>
          {isGroup && <p className="text-xs text-accent/60 mt-0.5">Group entry</p>}
        </div>
      </div>
    </div>
  );
}

