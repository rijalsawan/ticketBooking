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
    <div className="min-h-screen bg-background">
      {/* Admin top bar */}
      <div className="bg-card px-4 py-3 flex items-center justify-between text-sm border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-bold text-accent">Admin Panel</span>
          <span className="text-border hidden sm:block">|</span>
          <span className="text-muted-foreground hidden sm:block">Nepali New Year 2026</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-xs">{session.user.email}</span>
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors text-xs">
            ← View Site
          </Link>
        </div>
      </div>

      {/* Admin nav */}
      <div className="bg-background border-b border-border">
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
              className="px-4 py-2 rounded-md font-medium text-muted-foreground hover:bg-secondary hover:text-accent transition-colors whitespace-nowrap"
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
