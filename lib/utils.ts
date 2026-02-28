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

/** Calculate order totals */
export function calculateOrderTotals(pricePerTicket: number, quantity: number) {
  const subtotal = pricePerTicket * quantity;
  const tax = calculateTax(subtotal);
  const total = subtotal + tax;
  return { subtotal, tax, total };
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

/** Format a date to a readable string */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Winnipeg",
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
