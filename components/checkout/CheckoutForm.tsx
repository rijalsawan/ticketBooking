"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { formatPrice, calculateOrderTotals } from "@/lib/utils";

interface Props {
  eventId: string;
  pricePerTicket: number;
  maxQuantity: number;
}

type TicketType = "INDIVIDUAL" | "GROUP";

interface AppliedDiscount {
  code: string;
  value: number;
  description: string;
}

export default function CheckoutForm({ eventId, pricePerTicket, maxQuantity }: Props) {
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(2);
  const [ticketType, setTicketType] = useState<TicketType>("INDIVIDUAL");
  const [groupMembers, setGroupMembers] = useState<string[]>(["", ""]);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Guest fields
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

  // Keep groupMembers array in sync with qty
  useEffect(() => {
    setGroupMembers((prev) => {
      const next = Array.from({ length: qty }, (_, i) => prev[i] ?? "");
      return next;
    });
  }, [qty]);

  const effectiveQty = ticketType === "INDIVIDUAL" ? 1 : qty;
  const { subtotal, discountAmount, tax, total } = calculateOrderTotals(
    pricePerTicket,
    effectiveQty,
    appliedDiscount?.value ?? 0,
  );

  async function applyDiscount() {
    const code = discountInput.trim().toUpperCase();
    if (!code) return;
    setDiscountLoading(true);
    setDiscountError("");
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, quantity: qty }),
      });
      const json = await res.json();
      if (!res.ok) {
        setDiscountError(json.error ?? "Invalid code");
        setAppliedDiscount(null);
        return;
      }
      setAppliedDiscount({ code: json.code, value: json.value, description: json.description });
      toast.success(`${json.value}% discount applied!`);
    } catch {
      setDiscountError("Network error");
    } finally {
      setDiscountLoading(false);
    }
  }

  function removeDiscount() {
    setAppliedDiscount(null);
    setDiscountInput("");
    setDiscountError("");
  }

  async function handleSubmit() {
    if (!guestName.trim()) { toast.error("Please enter your name."); return; }
    if (!guestEmail.trim()) { toast.error("Please enter your email."); return; }
    if (guestEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) { toast.error("Email addresses do not match."); return; }

    if (ticketType === "GROUP") {
      const empty = groupMembers.some((n) => !n.trim());
      if (empty) { toast.error("Please enter a name for every group member."); return; }
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          quantity: effectiveQty,
          ticketType,
          groupMembers: ticketType === "GROUP" ? groupMembers.map((name) => ({ name })) : undefined,
          discountCode: appliedDiscount?.code,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Checkout failed."); return; }
      if (json.url) window.location.href = json.url;
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const isGroup = ticketType === "GROUP";

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-6">
      <h2 className="text-lg font-semibold text-foreground">Your details</h2>

      {/* Guest info */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          required
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          placeholder="John Doe"
        />
        <Input
          label="Email"
          required
          type="email"
          value={guestEmail}
          onChange={(e) => setGuestEmail(e.target.value)}
          placeholder="john@example.com"
        />
        <Input
          label="Confirm email"
          required
          type="email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          placeholder="john@example.com"
          error={confirmEmail && guestEmail.trim().toLowerCase() !== confirmEmail.trim().toLowerCase() ? "Emails do not match" : undefined}
        />
        <Input
          label="Phone"
          type="tel"
          value={guestPhone}
          onChange={(e) => setGuestPhone(e.target.value)}
          placeholder="(optional)"
          className="sm:col-span-2"
        />
      </div>

      {/* Ticket type */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Ticket type</p>
        <div className="flex gap-2">
          {(["INDIVIDUAL", "GROUP"] as TicketType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTicketType(t);
                if (t === "GROUP") setQty((q) => Math.max(2, q));
              }}
              className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                ticketType === t
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent border-border text-muted-foreground hover:border-muted-foreground/40"
              }`}
            >
              {t === "INDIVIDUAL" ? "Individual" : "Group (1 QR)"}
            </button>
          ))}
        </div>
        {isGroup && (
          <p className="text-xs text-muted-foreground mt-1.5">
            One shared QR code for the whole group.
          </p>
        )}
      </div>

      {/* Quantity (group only) */}
      {isGroup && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Group size</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(2, q - 1))}
              disabled={qty <= 2}
              className="w-9 h-9 rounded-md border border-border text-foreground font-bold flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              −
            </button>
            <span className="text-lg font-semibold text-foreground w-6 text-center">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQuantity, q + 1))}
              disabled={qty >= maxQuantity}
              className="w-9 h-9 rounded-md border border-border text-foreground font-bold flex items-center justify-center hover:bg-secondary disabled:opacity-30 transition-colors"
            >
              +
            </button>
            <span className="text-xs text-muted-foreground">(max {maxQuantity})</span>
          </div>
        </div>
      )}

      {/* Group member names */}
      {isGroup && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Group member names</p>
          {groupMembers.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}</span>
              <Input
                value={name}
                onChange={(e) => {
                  const next = [...groupMembers];
                  next[i] = e.target.value;
                  setGroupMembers(next);
                }}
                placeholder={i === 0 ? "Your name" : `Member ${i + 1}`}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Discount code */}
      <div>
        <p className="text-sm font-medium text-foreground mb-2">Discount code</p>
        {appliedDiscount ? (
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-md px-3 py-2">
            <div>
              <span className="text-emerald-400 font-mono font-semibold tracking-widest text-sm">{appliedDiscount.code}</span>
              <span className="text-emerald-400/70 text-xs ml-2">
                −{appliedDiscount.value}% · {appliedDiscount.description}
              </span>
            </div>
            <button
              type="button"
              onClick={removeDiscount}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              value={discountInput}
              onChange={(e) => {
                setDiscountInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
                setDiscountError("");
              }}
              placeholder="ABCD"
              className="flex-1 uppercase font-mono tracking-widest"
              onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
              error={discountError}
            />
            <Button
              type="button"
              onClick={applyDiscount}
              loading={discountLoading}
              disabled={discountInput.length < 3}
              size="sm"
              variant="outline"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Order summary */}
      <div className="rounded-md border border-border p-4 text-sm space-y-1.5">
        <div className="flex justify-between text-muted-foreground">
          <span>
            {effectiveQty} ticket{effectiveQty > 1 ? "s" : ""} &times; {formatPrice(pricePerTicket)}
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-400 text-xs">
            <span>Discount ({appliedDiscount?.code} −{appliedDiscount?.value}%)</span>
            <span>−{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>GST (5%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold text-foreground pt-1.5 border-t border-border">
          <span>Total</span>
          <span className="text-accent">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Security note */}
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe. We never store card details.
      </p>

      <Button onClick={handleSubmit} loading={loading} size="lg" variant="accent" className="w-full">
        {loading ? "Redirecting to payment…" : `Pay ${formatPrice(total)}`}
      </Button>
    </div>
  );
}

