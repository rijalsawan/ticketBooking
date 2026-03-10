import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG } from "@/lib/config";
import EventEditorForm from "@/components/admin/EventEditorForm";
import DiscountCodesManager from "@/components/admin/DiscountCodesManager";

export const metadata: Metadata = { title: "Admin – Settings" };

async function getData() {
  const [event, discountCodes] = await Promise.all([
    prisma.event.findUnique({ where: { slug: EVENT_CONFIG.slug } }),
    prisma.discountCode.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { orders: true } } },
    }),
  ]);
  return { event, discountCodes };
}

export default async function AdminSettingsPage() {
  const { event, discountCodes } = await getData();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Manage event details and discount codes.</p>
      </div>

      {/* Event Editor */}
      {event ? (
        <EventEditorForm
          event={{
            id: event.id,
            title: event.title,
            description: event.description ?? "",
            date: event.date.toISOString(),
            doorsOpen: (event as Record<string, unknown>).doorsOpen as string | null ?? null,
            endTime: (event as Record<string, unknown>).endTime as string | null ?? null,
            venue: event.venue,
            address: event.address,
            price: event.price,
            totalTickets: event.totalTickets,
            isActive: event.isActive,
            highlights: Array.isArray((event as Record<string, unknown>).highlights)
              ? (event as Record<string, unknown>).highlights as string[]
              : [],
          }}
        />
      ) : (
        <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-6 text-sm text-white/40">
          Event not found. Run <code className="bg-white/5 px-1.5 py-0.5 rounded text-xs">npx prisma db seed</code> to initialize it.
        </div>
      )}

      {/* Discount Codes */}
      <DiscountCodesManager
        initialCodes={discountCodes.map((dc) => ({
          id: dc.id,
          code: dc.code,
          description: dc.description,
          value: dc.value,
          minGroupSize: dc.minGroupSize,
          maxUses: dc.maxUses,
          usedCount: dc.usedCount,
          isActive: dc.isActive,
          expiresAt: dc.expiresAt?.toISOString() ?? null,
          _count: dc._count,
        }))}
      />

      {/* Environment Status */}
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
