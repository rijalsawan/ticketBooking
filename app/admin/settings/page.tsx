import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG } from "@/lib/config";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin – Settings" };

async function getEvent() {
  return prisma.event.findUnique({ where: { slug: EVENT_CONFIG.slug } });
}

export default async function AdminSettingsPage() {
  const event = await getEvent();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
        <p className="text-white/40 text-sm">Manage event settings and configuration.</p>
      </div>

      {/* Event info (read-only – update via DB/seed for now) */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-6 space-y-4">
        <h2 className="font-semibold text-white text-lg">Current Event</h2>

        {event ? (
          <div className="space-y-3 text-sm">
            {[
              { label: "Title", value: event.title },
              { label: "Date", value: formatDate(event.date) },
              { label: "Venue", value: event.venue },
              { label: "Address", value: event.address },
              { label: "Price", value: `$${(event.price / 100).toFixed(2)} CAD` },
              { label: "Total Capacity", value: event.totalTickets },
              { label: "Tickets Sold", value: event.soldTickets },
              { label: "Active", value: event.isActive ? "Yes" : "No" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between border-b border-white/4 pb-2">
                <span className="text-white/40 font-medium">{label}</span>
                <span className="text-white">{String(value)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Event not found in database. Run the seed: <code className="bg-white/5 px-2 py-0.5 rounded text-xs">npx prisma db seed</code></p>
        )}

        <div className="pt-2 text-xs text-white/40 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
          <strong>Tip:</strong> To update event details, edit <code>lib/config.ts</code> and re-run 
          <code className="mx-1">npx prisma db seed</code>, or modify via Prisma Studio 
          (<code>npx prisma studio</code>).
        </div>
      </div>

      {/* Environment status */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-6 space-y-4">
        <h2 className="font-semibold text-white text-lg">Environment Status</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: "Database", key: "DATABASE_URL" },
            { label: "Stripe Secret", key: "STRIPE_SECRET_KEY" },
            { label: "Stripe Webhook", key: "STRIPE_WEBHOOK_SECRET" },
            { label: "NextAuth Secret", key: "NEXTAUTH_SECRET" },
            { label: "SMTP Host", key: "SMTP_HOST" },
          ].map(({ label, key }) => {
            const set = !!process.env[key];
            return (
              <div key={key} className="flex justify-between items-center border-b border-white/4 pb-2">
                <span className="text-white/40">{label}</span>
                <span className={set ? "text-green-400 font-semibold text-xs" : "text-red-400 text-xs font-semibold"}>
                  {set ? "✓ Configured" : "✗ Missing"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
