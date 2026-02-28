import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG } from "@/lib/config";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Admin – Tickets" };

export default async function AdminTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: {
        select: {
          guestName: true,
          guestEmail: true,
          user: { select: { name: true, email: true } },
          status: true,
        },
      },
    },
  });

  const total = tickets.length;
  const used = tickets.filter((t) => t.isUsed).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">All Tickets</h1>
        <p className="text-white/40 text-sm">
          {total} issued · {used} checked in · {total - used} remaining
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Issued", value: total, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Checked In", value: used, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Remaining", value: total - used, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-white/[0.03] rounded-2xl border border-white/6 p-5 text-center">
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <div className={`w-3 h-3 rounded-full ${bg}`} />
            </div>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-white/30 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tickets table */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-xs text-white/40 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Ticket #</th>
                <th className="px-4 py-3 text-left">Holder</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Checked In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {tickets.map((ticket) => {
                const name = ticket.order.user?.name ?? ticket.order.guestName ?? "Guest";
                const email = ticket.order.user?.email ?? ticket.order.guestEmail ?? "—";
                return (
                  <tr key={ticket.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-amber-400 font-semibold text-xs">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{name}</p>
                      <p className="text-xs text-white/30">{email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ticket.order.status === "COMPLETED" ? "success" : "neutral"}>
                        {ticket.order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {ticket.isUsed ? (
                        <span className="text-green-400 font-semibold text-xs">✓ Used</span>
                      ) : (
                        <span className="text-white/30 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-white/30">
                    No tickets issued yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
