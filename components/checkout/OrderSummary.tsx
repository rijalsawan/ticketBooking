import { formatPrice, calculateOrderTotals } from "@/lib/utils";
import { EVENT_CONFIG } from "@/lib/config";

interface Props {
  pricePerTicket: number;
  remaining: number;
}

export default function OrderSummary({ pricePerTicket, remaining }: Props) {
  const { tax, total } = calculateOrderTotals(pricePerTicket, 1);
  const soldPercent = Math.min(
    100,
    ((EVENT_CONFIG.totalCapacity - remaining) / EVENT_CONFIG.totalCapacity) * 100,
  );

  return (
    <div className="space-y-4 sticky top-20">
      {/* Event card */}
      <div className="rounded-lg border border-border bg-card p-5 text-sm space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Event</p>
        <h3 className="text-lg font-semibold text-foreground leading-tight">{EVENT_CONFIG.title}</h3>
        <div className="space-y-1 text-muted-foreground text-sm">
          <p>{EVENT_CONFIG.date}</p>
          <p>Doors {EVENT_CONFIG.doorsOpen}</p>
          <p>{EVENT_CONFIG.venue}</p>
          <p>Winnipeg, MB</p>
        </div>
        <div className="border-t border-border mt-4 pt-4 flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Per ticket</span>
          <span className="text-2xl font-bold text-foreground">{formatPrice(pricePerTicket)}</span>
        </div>
      </div>

      {/* Pricing breakdown */}
      <div className="rounded-lg border border-border bg-card p-5 text-sm space-y-2">
        <h4 className="font-semibold text-foreground mb-3">Price breakdown (1 ticket)</h4>
        <div className="flex justify-between text-muted-foreground">
          <span>Ticket price</span>
          <span>{formatPrice(pricePerTicket)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground text-xs">
          <span>GST (5%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-semibold text-foreground pt-2 border-t border-border">
          <span>Per ticket (incl. taxes)</span>
          <span className="text-accent">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Availability */}
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Availability</span>
          <span className={`font-medium ${remaining <= 10 ? "text-amber-400" : "text-emerald-400"}`}>
            {remaining <= 10 ? `Only ${remaining} left` : `${remaining} available`}
          </span>
        </div>
        <div className="mt-2 bg-secondary rounded-md h-1.5 overflow-hidden">
          <div
            className="bg-accent h-1.5 rounded-md transition-all"
            style={{ width: `${soldPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {EVENT_CONFIG.totalCapacity - remaining} / {EVENT_CONFIG.totalCapacity} sold
        </p>
      </div>

      {/* What's included */}
      <div className="rounded-lg border border-border bg-card p-4 text-sm">
        <h4 className="font-medium text-foreground mb-2">What&apos;s included</h4>
        <ul className="space-y-1 text-muted-foreground text-xs">
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

