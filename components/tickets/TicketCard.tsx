"use client";

import { QRCodeSVG } from "qrcode.react";
import { formatDate } from "@/lib/utils";

interface TicketCardProps {
  ticket: {
    id: string;
    ticketNumber: string;
    qrCode: string;
    isUsed: boolean;
    holderName?: string | null;
    holderEmail?: string | null;
  };
  event: {
    title: string;
    date: Date;
    venue: string;
    address: string;
  };
  orderTotal: number;
  orderQuantity: number;
}

export default function TicketCard({ ticket, event }: TicketCardProps) {
  // Keep QR payload simple — just the ticket number.
  // A plain short string produces a sparse, easy-to-scan QR code.
  const qrPayload = ticket.ticketNumber;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="group relative print:shadow-none print:bg-white">
      {/* Main ticket container */}
      <div className="relative bg-[#111] rounded-2xl border border-white/[0.06] overflow-hidden transition-all duration-300 hover:border-white/[0.10] hover:shadow-[0_0_40px_rgba(245,158,11,0.03)]">
        <div className="flex flex-col sm:flex-row">

          {/* Left section - event info */}
          <div className="flex-1 p-5 sm:p-6 sm:pr-8">
            {/* Status + ticket number */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    ticket.isUsed
                      ? "bg-white/20"
                      : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                  }`}
                />
                <span
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    ticket.isUsed ? "text-white/30" : "text-emerald-400"
                  }`}
                >
                  {ticket.isUsed ? "Used" : "Valid"}
                </span>
              </div>
              <span className="text-[11px] font-mono text-white/20 tracking-wider">
                {ticket.ticketNumber}
              </span>
            </div>

            {/* Event title */}
            <h3 className="text-lg font-bold text-white leading-tight mb-5">
              {event.title}
            </h3>

            {/* Info rows */}
            <div className="space-y-3">
              {/* Date */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/25 mb-0.5 uppercase tracking-wide">Date & Time</p>
                  <p className="text-sm text-white/60">{formatDate(event.date)}</p>
                </div>
              </div>

              {/* Venue */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/25 mb-0.5 uppercase tracking-wide">Venue</p>
                  <p className="text-sm text-white/60">{event.venue}</p>
                  <p className="text-xs text-white/25 mt-0.5">{event.address}</p>
                </div>
              </div>

              {/* Holder */}
              {ticket.holderName && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-amber-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-white/25 mb-0.5 uppercase tracking-wide">Attendee</p>
                    <p className="text-sm text-white/60">{ticket.holderName}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 mt-5 pt-4 border-t border-dashed border-white/[0.06]">
              <button
                onClick={handlePrint}
                className="text-xs text-white/25 hover:text-amber-400 transition-colors flex items-center gap-1.5 print:hidden cursor-pointer"
                aria-label="Print or save ticket"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Save PDF
              </button>
              <span className="text-[10px] text-white/15 select-none">Show QR at entrance</span>
            </div>
          </div>

          {/* Perforated divider - desktop (vertical) */}
          <div className="relative hidden sm:flex flex-col items-center">
            <div className="absolute -top-3 w-6 h-6 rounded-full bg-[#080808] border border-white/[0.06] border-t-transparent z-10" />
            <div className="w-px h-full border-l border-dashed border-white/[0.08]" />
            <div className="absolute -bottom-3 w-6 h-6 rounded-full bg-[#080808] border border-white/[0.06] border-b-transparent z-10" />
          </div>

          {/* Perforated divider - mobile (horizontal) */}
          <div className="relative flex sm:hidden items-center mx-5">
            <div className="absolute -left-8 w-6 h-6 rounded-full bg-[#080808] border border-white/[0.06] border-l-transparent z-10" />
            <div className="w-full h-px border-t border-dashed border-white/[0.08]" />
            <div className="absolute -right-8 w-6 h-6 rounded-full bg-[#080808] border border-white/[0.06] border-r-transparent z-10" />
          </div>

          {/* Right section - QR code */}
          <div className="flex flex-col items-center justify-center p-5 sm:pl-8 sm:pr-6 sm:w-52">
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG
                value={qrPayload}
                size={160}
                bgColor="#ffffff"
                fgColor="#111111"
                level="M"
                aria-label={`QR code for ticket ${ticket.ticketNumber}`}
              />
            </div>
            <p className="text-[10px] text-white/20 font-mono mt-2.5 text-center tracking-wider">
              {ticket.ticketNumber}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}