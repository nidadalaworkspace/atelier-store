// Catalogue display uses whole-pound rounding; bag/receipts render exact.
// Keep these two formatters in one place so money never varies by surface.

const wholePound = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const exactPound = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function currency(dollars: number): string {
  return wholePound.format(dollars);
}

export function formatCents(cents: number): string {
  return exactPound.format(cents / 100);
}
