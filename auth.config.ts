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
    // Populate session.user.role from the JWT token so the role is
    // available inside the `authorized` callback below.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: any) {
      if (session.user && token?.role) {
        session.user.role = token.role;
      }
      if (session.user && token?.id) {
        session.user.id = token.id;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isTicketsRoute = nextUrl.pathname.startsWith("/tickets");
      const isCheckoutRoute = nextUrl.pathname.startsWith("/checkout");

      if (!isLoggedIn && (isAdminRoute || isTicketsRoute || isCheckoutRoute)) {
        const loginUrl = new URL("/", nextUrl.origin);
        loginUrl.searchParams.set("auth", "signin");
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (isAdminRoute && (auth?.user as { role?: string })?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", nextUrl.origin));
      }

      return true;
    },
  },
};
