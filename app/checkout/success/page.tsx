import Link from "next/link";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Payment Successful" };

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let order = null;
  if (session_id) {
    try {
      order = await prisma.order.findUnique({
        where: { stripeSessionId: session_id },
        include: {
          event: { select: { title: true, date: true, venue: true } },
          tickets: { select: { ticketNumber: true } },
        },
      });
    } catch {
      // Ignore DB errors on success page
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#080808] px-4 py-12">
      <div className="w-full max-w-lg text-center">
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/5">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <Badge variant="success" className="mb-4 text-sm px-4 py-1">Payment Confirmed</Badge>
        <h1 className="text-3xl font-extrabold text-white mb-2">You&apos;re going!</h1>

        {/* Instant ticket access notice */}
        <div className="bg-amber-500/[0.06] border border-amber-500/15 rounded-xl px-4 py-3 mb-3 flex items-start gap-3 text-left">
          <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <div>
            <p className="text-sm text-amber-400 font-medium">Your QR ticket is ready instantly</p>
            <p className="text-xs text-white/35 mt-1">
              Go to &ldquo;View My Tickets&rdquo; below — screenshot or save your QR code and show it at the door.
            </p>
          </div>
        </div>

        {/* ID reminder */}
        <div className="bg-red-500/[0.06] border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-start gap-3 text-left">
          <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" />
          </svg>
          <div>
            <p className="text-sm text-red-400 font-medium">Valid photo ID required at the door</p>
            <p className="text-xs text-white/35 mt-1">
              Every attendee must present a government-issued photo ID (driver&apos;s licence, passport, or provincial ID) alongside their QR ticket to enter.
            </p>
          </div>
        </div>

        {order && (
          <div className="bg-white/[0.03] rounded-2xl border border-white/6 shadow p-6 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Event</span>
              <span className="font-semibold text-white">{order.event.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Tickets</span>
              <span className="font-semibold text-white">{order.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Total Paid</span>
              <span className="font-semibold text-white">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Order ID</span>
              <span className="font-mono text-xs text-white/50">{order.id}</span>
            </div>
            <div className="border-t border-white/6 pt-3">
              <p className="text-xs text-white/40 mb-1">Ticket Numbers:</p>
              <div className="flex flex-wrap gap-2">
                {order.tickets.map((t) => (
                  <span key={t.ticketNumber} className="bg-amber-500/10 text-amber-400 font-mono text-xs px-2 py-1 rounded-lg border border-amber-500/20">
                    {t.ticketNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/tickets"
            className="bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/20"
          >
            View My Tickets
          </Link>
          <Link
            href="/"
            className="border border-white/12 text-white/60 hover:bg-white/5 font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-white/30 mt-6" lang="ne">
          नयाँ वर्षको शुभकामना!
        </p>
      </div>
    </div>
  );
}
