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
  ticketType: z.enum(["INDIVIDUAL", "GROUP"]).default("INDIVIDUAL"),
  groupMembers: z.array(z.object({ name: z.string().min(1, "Name required") })).optional(),
  discountCode: z.string().optional(),
});

// ── Admin schemas ─────────────────────────────────────────────────────────────
export const updateEventSchema = z.object({
  title: z.string().min(3),
  shortDesc: z.string().min(5).optional(),
  description: z.string().min(10),
  venue: z.string().min(3),
  address: z.string().min(5),
  date: z.string(),          // ISO UTC string e.g. "2026-04-13T00:00:00.000Z"
  doorsOpen: z.string().optional(), // ISO UTC string, optional
  endTime: z.string().optional(),   // ISO UTC string, optional
  price: z.number().int().positive(),
  totalTickets: z.number().int().positive(),
  isActive: z.boolean(),
  showAvailability: z.boolean().optional(),
  highlights: z.array(z.string()),
});

export const createDiscountCodeSchema = z.object({
  code: z
    .string()
    .length(4, "Code must be exactly 4 characters")
    .regex(/^[A-Z0-9]+$/, "Only uppercase letters and numbers"),
  description: z.string().min(1, "Description required"),
  value: z.number().int().min(1).max(100),
  minGroupSize: z.number().int().min(1).max(10).default(1),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const refundSchema = z.object({
  orderId: z.string(),
  amount: z.number().int().positive().optional(), // partial refund in cents
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateDiscountCodeInput = z.infer<typeof createDiscountCodeSchema>;
export type RefundInput = z.infer<typeof refundSchema>;
