import { z } from "zod";

// ── Auth schemas ──────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// ── Checkout schemas ──────────────────────────────────────────────────────────
export const checkoutSchema = z.object({
  quantity: z.number().int().min(1, "Select at least 1 ticket").max(10, "Max 10 tickets per order"),
});

// ── Admin schemas ─────────────────────────────────────────────────────────────
export const updateEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  shortDesc: z.string().min(10),
  venue: z.string().min(3),
  address: z.string().min(5),
  price: z.number().int().positive(),
  totalTickets: z.number().int().positive(),
  isActive: z.boolean(),
});

export const refundSchema = z.object({
  orderId: z.string(),
  amount: z.number().int().positive().optional(), // partial refund in cents
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
