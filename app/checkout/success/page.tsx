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
        {/* Success animation */}
        <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/5">
          <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <Badge variant="success" className="mb-4 text-sm px-4 py-1">Payment Confirmed</Badge>
        <h1 className="text-3xl font-extrabold text-white mb-2">You&apos;re going!</h1>
        <p className="text-white/50 mb-6 leading-relaxed">
          Your tickets are confirmed. Check your email for your digital tickets and QR codes.
        </p>

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
            View My Tickets & QR Codes
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
