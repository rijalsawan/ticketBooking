"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { formatPrice, calculateOrderTotals } from "@/lib/utils";

interface Props {
  eventId: string;
  pricePerTicket: number;
  maxQuantity: number;
}

export default function CheckoutForm({ eventId, pricePerTicket, maxQuantity }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [qty, setQty] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { quantity: 1 },
  });

  const quantity = watch("quantity") ?? 1;
  const { subtotal, tax, total } = calculateOrderTotals(pricePerTicket, quantity);

  // While session is resolving, show a blank skeleton so the form never flashes
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

  // Middleware handles the redirect — this is a safety net for edge cases
  if (status === "unauthenticated") {
    router.replace("/?auth=signin&callbackUrl=/checkout");
    return null;
  }

  const onSubmit = async (data: CheckoutInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, quantity: data.quantity }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Checkout failed. Please try again.");
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.03] rounded-2xl shadow border border-white/6 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-white mb-6">
        {session ? `Hi, ${session.user.name?.split(" ")[0]}!` : "Loading"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Quantity picker */}
        <div>
          <label className="text-sm font-medium text-white/60 mb-2 block">
            Number of tickets <span className="text-red-400" aria-hidden>*</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="w-10 h-10 rounded-full border-2 border-amber-500/40 text-amber-400 font-bold text-xl flex items-center justify-center hover:bg-amber-500/10 disabled:opacity-30"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              
            </button>
            <input
              type="hidden"
              value={qty}
              {...register("quantity", { valueAsNumber: true })}
            />
            <span className="text-2xl font-bold text-white w-8 text-center">{qty}</span>
            <button
              type="button"
              className="w-10 h-10 rounded-full border-2 border-amber-500/40 text-amber-400 font-bold text-xl flex items-center justify-center hover:bg-amber-500/10 disabled:opacity-30"
              onClick={() => setQty((q) => Math.min(maxQuantity, q + 1))}
              disabled={qty >= maxQuantity}
              aria-label="Increase quantity"
            >
              +
            </button>
            <span className="text-sm text-white/40">
              (up to {maxQuantity} per order)
            </span>
          </div>
          {errors.quantity && (
            <p className="text-xs text-red-400 mt-1">{errors.quantity.message}</p>
          )}
        </div>

        {/* Order total preview */}
        <div className="bg-white/[0.02] rounded-xl p-4 text-sm space-y-1.5 border border-white/6">
          <div className="flex justify-between text-white/50">
            <span>{qty}  {formatPrice(pricePerTicket)}</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
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

        <Button type="submit" loading={loading} size="lg" className="w-full">
          {loading ? "Redirecting to payment" : `Pay ${formatPrice(total)} Securely`}
        </Button>
      </form>
    </div>
  );
}