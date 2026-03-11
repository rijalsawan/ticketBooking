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
        <h1 className="text-2xl font-bold text-foreground">All Tickets</h1>
        <p className="text-muted-foreground text-sm">
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
          <div key={label} className="bg-card rounded-md border border-border p-5 text-center">
            <div className={`${bg} w-10 h-10 rounded-md flex items-center justify-center mx-auto mb-2`}>
              <div className={`w-3 h-3 rounded-full ${bg}`} />
            </div>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tickets table */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Ticket #</th>
                <th className="px-4 py-3 text-left">Holder</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Checked In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tickets.map((ticket) => {
                const name = ticket.order.user?.name ?? ticket.order.guestName ?? "Guest";
                const email = ticket.order.user?.email ?? ticket.order.guestEmail ?? "—";
                return (
                  <tr key={ticket.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3 font-mono text-accent font-semibold text-xs">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
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
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-muted-foreground">
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
