import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Admin top bar */}
      <div className="bg-[#0e0e0e] text-white px-4 py-3 flex items-center justify-between text-sm border-b border-white/6">
        <div className="flex items-center gap-3">
          <span className="font-bold text-amber-400">Admin Panel</span>
          <span className="text-white/20 hidden sm:block">|</span>
          <span className="text-white/40 hidden sm:block">Nepali New Year 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/30 text-xs">{session.user.email}</span>
          <Link href="/" className="text-white/40 hover:text-white transition-colors text-xs">
            ← View Site
          </Link>
        </div>
      </div>

      {/* Admin nav */}
      <div className="bg-[#0a0a0a] border-b border-white/6">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 py-2 text-sm overflow-x-auto">
          {[
            { href: "/admin", label: "Dashboard" },
            { href: "/admin/orders", label: "Orders" },
            { href: "/admin/tickets", label: "Tickets" },
            { href: "/admin/verify", label: "Verify" },
            { href: "/admin/settings", label: "Settings" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-2 rounded-lg font-medium text-white/50 hover:bg-white/5 hover:text-amber-400 transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Page content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}
