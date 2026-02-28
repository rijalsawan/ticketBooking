import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as NextRequest & { auth: typeof req.auth };

  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isTicketsRoute = nextUrl.pathname.startsWith("/tickets");

  if (!session) {
    const loginUrl = new URL("/", nextUrl.origin);
    loginUrl.searchParams.set("auth", "signin");
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && session.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/tickets/:path*"],
};
