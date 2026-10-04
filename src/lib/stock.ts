export type StockState =
  | "in-stock"
  | "low-stock"
  | "made-to-order"
  | "out-of-stock";

type StockInput = {
  stockQuantity: number;
  madeToOrder: boolean;
};

export function stockState(p: StockInput): StockState {
  if (p.madeToOrder) return "made-to-order";
  if (p.stockQuantity <= 0) return "out-of-stock";
  if (p.stockQuantity <= 3) return "low-stock";
  return "in-stock";
}

const copyByState: Record<StockState, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock — few remaining",
  "made-to-order": "Made to order · 4–6 weeks",
  "out-of-stock": "Currently unavailable",
};

export function stockCopy(state: StockState): string {
  return copyByState[state];
}

const toneByState: Record<StockState, string> = {
  "in-stock": "bg-success",
  "low-stock": "bg-warning",
  "made-to-order": "bg-stone-400",
  "out-of-stock": "bg-danger",
};

export function stockTone(state: StockState): string {
  return toneByState[state];
}
