import { calculateOrderTotals, formatPrice, generateTicketNumber, seatsRemaining, availabilityLabel } from "@/lib/utils";

describe("calculateOrderTotals", () => {
  it("should calculate correct totals for 1 ticket at $15", () => {
    const { subtotal, tax, total } = calculateOrderTotals(1500, 1);
    expect(subtotal).toBe(1500);
    expect(tax).toBe(75); // 5% of 1500
    expect(total).toBe(1575);
  });

  it("should calculate correct totals for 4 tickets at $15", () => {
    const { subtotal, tax, total } = calculateOrderTotals(1500, 4);
    expect(subtotal).toBe(6000);
    expect(tax).toBe(300);
    expect(total).toBe(6300);
  });
});

describe("formatPrice", () => {
  it("should format 1500 cents as $15.00 CAD", () => {
    expect(formatPrice(1500)).toContain("15.00");
  });
});

describe("generateTicketNumber", () => {
  it("should generate NNY2026-0001 for index 1", () => {
    expect(generateTicketNumber(1)).toBe("NNY2026-0001");
  });

  it("should pad correctly for index 150", () => {
    expect(generateTicketNumber(150)).toBe("NNY2026-0150");
  });
});

describe("seatsRemaining", () => {
  it("should return correct remaining seats", () => {
    expect(seatsRemaining(200, 50)).toBe(150);
    expect(seatsRemaining(200, 200)).toBe(0);
    expect(seatsRemaining(200, 210)).toBe(0); // can't go below 0
  });
});

describe("availabilityLabel", () => {
  it("should return 'Sold Out' when no tickets remain", () => {
    expect(availabilityLabel(200, 200)).toBe("Sold Out");
  });

  it("should return urgency message when ≤10 remain", () => {
    const label = availabilityLabel(200, 195);
    expect(label).toContain("5");
  });

  it("should return 'Available' when plenty of seats exist", () => {
    expect(availabilityLabel(200, 100)).toBe("Available");
  });
});
