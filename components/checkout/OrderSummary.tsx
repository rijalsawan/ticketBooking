import { formatPrice, calculateOrderTotals } from "@/lib/utils";
import { EVENT_CONFIG } from "@/lib/config";

interface Props {
  pricePerTicket: number;
  remaining: number;
}

export default function OrderSummary({ pricePerTicket, remaining }: Props) {
  const { subtotal, tax, total } = calculateOrderTotals(pricePerTicket, 1);

  return (
    <div className="space-y-4 sticky top-20">
      {/* Event card */}
      <div className=" bg-white/[0.03] rounded-2xl border border-white/6 p-5 shadow text-sm space-y-2">
        <p className="text-white text-xs font-semibold uppercase tracking-wider mb-1">
          Event
        </p>
        <h3 className="text-lg font-bold leading-tight mb-3">
          {EVENT_CONFIG.title}
        </h3>
        <div className="space-y-1.5 text-sm ">
          <p>{EVENT_CONFIG.date}</p>
          <p>Doors {EVENT_CONFIG.doorsOpen}</p>
          <p>{EVENT_CONFIG.venue}</p>
          <p>Winnipeg, MB</p>
        </div>
        <div className="border-t border-white/20 mt-4 pt-4 flex justify-between items-center">
          <span className="text-sm ">Per ticket</span>
          <span className="text-2xl font-bold">
            {formatPrice(pricePerTicket)}
          </span>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-5 shadow text-sm space-y-2">
        <h4 className="font-semibold text-white mb-3">Price breakdown (1 ticket)</h4>
        <div className="flex justify-between text-white/50">
          <span>Ticket price</span>
          <span>{formatPrice(pricePerTicket)}</span>
        </div>
        <div className="flex justify-between text-white/30 text-xs">
          <span>GST (5%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-bold text-white pt-2 border-t border-white/6">
          <span>Per ticket (incl. taxes)</span>
          <span className="text-amber-400">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-4 shadow text-sm">
        <div className="flex items-center justify-between">
          <span className="text-white/50">Availability</span>
          <span className={`font-semibold ${remaining <= 10 ? "text-orange-400" : "text-green-400"}`}>
            {remaining <= 10 ? `Only ${remaining} left!` : `${remaining} available`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 bg-white/5 rounded-full h-2 overflow-hidden">
          <div
            className="bg-linear-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(
                100,
                ((EVENT_CONFIG.totalCapacity - remaining) / EVENT_CONFIG.totalCapacity) * 100,
              )}%`,
            }}
          />
        </div>
        <p className="text-xs text-white/30 mt-1">
          {EVENT_CONFIG.totalCapacity - remaining} / {EVENT_CONFIG.totalCapacity} sold
        </p>
      </div>

      {/* What's included */}
      <div className="bg-white/[0.02] rounded-2xl border border-white/6 p-4 text-sm">
        <h4 className="font-semibold text-white/70 mb-2">What&apos;s included</h4>
        <ul className="space-y-1 text-white/40 text-xs">
          <li>&#10003; Entry to the event</li>
          <li>&#10003; Cultural performances</li>
          <li>&#10003; Food access</li>
          <li>&#10003; Digital QR ticket via email</li>
          <li>&#8226; Bar drinks – pay as you go</li>
        </ul>
      </div>
    </div>
  );
}
