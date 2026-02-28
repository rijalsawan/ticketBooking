/**
 * Edge-safe auth config — no Prisma, no bcrypt, no Node.js-only imports.
 * Used by middleware to keep the Edge bundle under 1 MB.
 * The full auth.ts extends this with the Prisma adapter and credentials provider.
 */
import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isTicketsRoute = nextUrl.pathname.startsWith("/tickets");

      if (!isLoggedIn && (isAdminRoute || isTicketsRoute)) {
        const loginUrl = new URL("/", nextUrl.origin);
        loginUrl.searchParams.set("auth", "signin");
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isAdminRoute && auth?.user?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", nextUrl.origin));
      }

      return true;
    },
  },
};
