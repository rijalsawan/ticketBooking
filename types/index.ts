import { Role, OrderStatus, PaymentStatus } from "@prisma/client";
import type {} from "next-auth/jwt";

// ── Re-export Prisma enums for use in client components ───────────────────────
export { Role, OrderStatus, PaymentStatus };

// ── Augment NextAuth types ────────────────────────────────────────────────────
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// ── App-level types ───────────────────────────────────────────────────────────
export interface EventWithStats {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDesc: string;
  date: Date;
  doorsOpen: Date;
  endTime: Date;
  venue: string;
  address: string;
  city: string;
  province: string;
  price: number;
  totalTickets: number;
  soldTickets: number;
  isActive: boolean;
}

export interface OrderWithDetails {
  id: string;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  eventId: string;
  quantity: number;
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  stripeSessionId: string | null;
  createdAt: Date;
  event: {
    title: string;
    date: Date;
    venue: string;
  };
  tickets: Array<{
    id: string;
    ticketNumber: string;
    qrCode: string;
    isUsed: boolean;
    holderName: string | null;
  }>;
  payment: {
    status: PaymentStatus;
  } | null;
  user: {
    name: string | null;
    email: string;
  } | null;
}

export interface AdminStats {
  totalRevenue: number;
  ticketsSold: number;
  totalOrders: number;
  recentOrders: OrderWithDetails[];
}
