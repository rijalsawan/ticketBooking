"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
  const { data: session, status } = useSession();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(2);
  const [ticketType, setTicketType] = useState<TicketType>("INDIVIDUAL");
  const [groupMembers, setGroupMembers] = useState<string[]>(["", ""]);
  const [discountInput, setDiscountInput] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");

  // Keep groupMembers array in sync with qty (only relevant for GROUP)
  useEffect(() => {
    setGroupMembers((prev) => {
      const next = Array.from({ length: qty }, (_, i) => prev[i] ?? "");
      // Pre-fill first slot with logged-in user's name
      if (session?.user?.name && !next[0]) next[0] = session.user.name;
      return next;
    });
  }, [qty, session?.user?.name]);

  // Pre-fill name when session loads
  useEffect(() => {
    if (session?.user?.name) {
      setGroupMembers((prev) => {
        if (!prev[0]) {
          const next = [...prev];
          next[0] = session.user!.name!;
          return next;
        }
        return prev;
      });
    }
  }, [session?.user?.name]);

  const effectiveQty = ticketType === "INDIVIDUAL" ? 1 : qty;
  const { subtotal, discountAmount, tax, total } = calculateOrderTotals(
    pricePerTicket,
    effectiveQty,
    appliedDiscount?.value ?? 0,
  );

  // Loading skeleton
  if (status === "loading") {
    return (
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-6 sm:p-8 animate-pulse space-y-5">
        <div className="h-6 w-32 bg-white/5 rounded-lg" />
        <div className="h-10 bg-white/5 rounded-xl" />
        <div className="h-24 bg-white/5 rounded-xl" />
        <div className="h-12 bg-white/5 rounded-xl" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/?auth=signin&callbackUrl=/checkout");
    return null;
  }

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
    // Validate group members
    if (ticketType === "GROUP") {
      const empty = groupMembers.some((n) => !n.trim());
      if (empty) {
        toast.error("Please enter a name for every group member.");
        return;
      }
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
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Checkout failed. Please try again.");
        return;
      }

      if (json.url) window.location.href = json.url;
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  const isGroup = ticketType === "GROUP";
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="bg-white/[0.03] rounded-2xl shadow border border-white/6 p-6 sm:p-8 space-y-6">
      <h2 className="text-xl font-bold text-white">Hi, {firstName}!</h2>

      {/* ── Ticket type toggle ──────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Ticket type</p>
        <div className="flex gap-2">
          {(["INDIVIDUAL", "GROUP"] as TicketType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTicketType(t);
                if (t === "GROUP") setQty((q) => Math.max(2, q));
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                ticketType === t
                  ? "bg-amber-500 border-amber-500 text-black"
                  : "bg-white/5 border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              {t === "INDIVIDUAL" ? "🎫 Individual" : "👥 Group (1 QR)"}
            </button>
          ))}
        </div>
        {isGroup && (
          <p className="text-xs text-amber-400/70 mt-1.5">
            One shared QR code for the whole group – everyone enters together.
          </p>
        )}
      </div>

      {/* ── Quantity (group only) ─────────────────────────────── */}
      {isGroup && (
        <div>
          <label className="text-sm font-medium text-white/60 mb-2 block">Group size</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(2, q - 1))}
              disabled={qty <= 2}
              className="w-10 h-10 rounded-full border-2 border-amber-500/40 text-amber-400 font-bold text-xl flex items-center justify-center hover:bg-amber-500/10 disabled:opacity-30"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="text-2xl font-bold text-white w-8 text-center">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(maxQuantity, q + 1))}
              disabled={qty >= maxQuantity}
              className="w-10 h-10 rounded-full border-2 border-amber-500/40 text-amber-400 font-bold text-xl flex items-center justify-center hover:bg-amber-500/10 disabled:opacity-30"
              aria-label="Increase"
            >
              +
            </button>
            <span className="text-sm text-white/40">(max {maxQuantity})</span>
          </div>
        </div>
      )}

      {/* ── Group member names ───────────────────────────────────── */}
      {isGroup && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/60">Group member names</p>
          {groupMembers.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-white/30 w-5 text-right flex-shrink-0">{i + 1}</span>
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

      {/* ── Discount code ───────────────────────────────────────── */}
      <div>
        <p className="text-sm font-medium text-white/60 mb-2">Discount code</p>
        {appliedDiscount ? (
          <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
            <div>
              <span className="text-green-400 font-mono font-bold tracking-widest">{appliedDiscount.code}</span>
              <span className="text-green-400/70 text-xs ml-2">
                −{appliedDiscount.value}% · {appliedDiscount.description}
              </span>
            </div>
            <button
              type="button"
              onClick={removeDiscount}
              className="text-xs text-white/30 hover:text-red-400 transition-colors"
            >
              ✕ Remove
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
              variant="ghost"
              className="flex-shrink-0"
            >
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* ── Order summary ────────────────────────────────────────── */}
      <div className="bg-white/[0.02] rounded-xl p-4 text-sm space-y-1.5 border border-white/6">
        <div className="flex justify-between text-white/50">
          <span>
            {effectiveQty} ticket{effectiveQty > 1 ? "s" : ""} × {formatPrice(pricePerTicket)}
          </span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-400 text-xs">
            <span>Discount ({appliedDiscount?.code} −{appliedDiscount?.value}%)</span>
            <span>−{formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-white/30 text-xs">
          <span>GST (5%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/6">
          <span>Total</span>
          <span className="text-amber-400">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Security note */}
      <p className="text-xs text-white/30 flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Secured by Stripe. We never store card details.
      </p>

      <Button onClick={handleSubmit} loading={loading} size="lg" className="w-full">
        {loading ? "Redirecting to payment…" : `Pay ${formatPrice(total)} Securely`}
      </Button>
    </div>
  );
}