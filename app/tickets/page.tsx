import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TicketCard from "@/components/tickets/TicketCard";
import Link from "next/link";

export const metadata: Metadata = { title: "My Tickets" };

export default async function TicketsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/tickets");
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id, status: "COMPLETED" },
    include: {
      event: { select: { title: true, date: true, doorsOpen: true, venue: true, address: true } },
      tickets: {
        select: {
          id: true,
          ticketNumber: true,
          qrCode: true,
          isUsed: true,
          holderName: true,
          holderEmail: true,
          ticketType: true,
          groupSize: true,
          groupMembers: true,
        },
      },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-[80vh] bg-[#080808] py-28 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-xs text-white/25 uppercase tracking-widest mb-1.5">Your Wallet</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              My Tickets
            </h1>
            <p className="text-white/35 mt-1 text-sm">
              {session.user.name?.split(" ")[0]}&apos;s event passes
            </p>
          </div>
          <Link
            href="/checkout"
            className="shrink-0 bg-white/[0.06] hover:bg-white/[0.10] text-white/70 hover:text-white text-sm font-medium px-4 py-2 rounded-xl border border-white/[0.06] transition-all"
          >
            + Buy More
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-12 sm:p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1.5">No tickets yet</h2>
            <p className="text-white/30 mb-8 text-sm max-w-xs mx-auto">
              You haven&apos;t purchased any tickets. Grab yours before they sell out.
            </p>
            <Link
              href="/checkout"
              className="bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-medium px-6 py-2.5 rounded-xl border border-white/[0.08] transition-all inline-block"
            >
              Buy Tickets
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) =>
              order.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  event={order.event}
                  orderTotal={order.total}
                  orderQuantity={order.quantity}
                />
              )),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
