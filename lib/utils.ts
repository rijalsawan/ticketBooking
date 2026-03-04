import { type ClassValue, clsx } from "clsx";

/** Merge Tailwind class names safely */
export function cn(...inputs: ClassValue[]) {
  // Simple merge: filter falsy values and join
  return inputs
    .flat()
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Format cents to currency string */
export function formatPrice(cents: number, currency = "CAD"): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Calculate GST (5%) for a price in cents */
export function calculateTax(cents: number): number {
  return Math.round(cents * 0.05);
}

/** Calculate order totals with optional discount */
export function calculateOrderTotals(pricePerTicket: number, quantity: number, discountPercent = 0) {
  const subtotal = pricePerTicket * quantity;
  const discountAmount = discountPercent > 0 ? Math.round(subtotal * discountPercent / 100) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const tax = calculateTax(discountedSubtotal);
  const total = discountedSubtotal + tax;
  return { subtotal, discountAmount, tax, total };
}

/** Generate a human-readable ticket number */
export function generateTicketNumber(index: number): string {
  const padded = String(index).padStart(4, "0");
  return `NNY2026-${padded}`;
}

/** Truncate text to a max length */
export function truncate(str: string, max = 100): string {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

/** Format a date to a readable string (local Winnipeg time — for order timestamps) */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Winnipeg",
  }).format(new Date(date));
}

/** Format an event date in UTC (no tz shift — date was stored as UTC midnight) */
export function formatEventDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

/** Format an event time in UTC (e.g. doors open stored as UTC datetime) */
export function formatEventTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(new Date(date));
}

/** Seats remaining helper */
export function seatsRemaining(total: number, sold: number): number {
  return Math.max(0, total - sold);
}

/** Returns an availability status label */
export function availabilityLabel(total: number, sold: number): string {
  const remaining = seatsRemaining(total, sold);
  if (remaining === 0) return "Sold Out";
  if (remaining <= 10) return `Only ${remaining} left!`;
  return "Available";
}
