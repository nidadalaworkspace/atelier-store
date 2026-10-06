"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import type { AdminProductRow } from "@/lib/products";
import { stockCopy, stockState, stockTone } from "@/lib/stock";
import { updateStockAction, type StockRowState } from "./actions";

export function StockRow({ product }: { product: AdminProductRow }) {
  const [state, formAction] = useActionState<StockRowState, FormData>(
    updateStockAction,
    { ok: false },
  );

  // Pending/saved pill reflects the latest server response. We also drive the
  // disabled quantity input off a client flag so toggling MTO is immediate;
  // the server zeros stock regardless, so there's no UI/DB drift risk.
  const [madeToOrder, setMadeToOrder] = useState(product.madeToOrder);
  const [stockQuantity, setStockQuantity] = useState(
    String(product.stockQuantity),
  );

  const liveState = stockState({
    stockQuantity: Number.parseInt(stockQuantity, 10) || 0,
    madeToOrder,
  });

  return (
    <li className="hairline-b py-6 md:py-7 grid grid-cols-[72px_1fr] gap-5 md:grid-cols-[96px_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] md:gap-6 md:items-center">
      <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
        {product.primaryImage && (
          <Image
            src={product.primaryImage.url}
            alt={product.primaryImage.alt}
            fill
            sizes="96px"
            className="object-cover"
          />
        )}
      </div>

      <div className="min-w-0 flex flex-col gap-1.5">
        <Link
          href={`/admin/products/${product.id}`}
          className="text-base md:text-lg text-ink hover:text-ink-soft transition-colors truncate"
        >
          {product.name}
        </Link>
        <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600 font-mono">
          {product.category.name}
        </p>
      </div>

      <span className="stock-pill">
        <span aria-hidden className={`dot ${stockTone(liveState)}`} />
        <span className="text-ink">{stockCopy(liveState)}</span>
      </span>

      <form
        action={formAction}
        className="col-span-2 md:col-span-3 flex flex-wrap items-center gap-3 md:gap-4"
      >
        <input type="hidden" name="id" value={product.id} />

        <label className="flex items-center gap-2">
          <span className="eyebrow">Qty</span>
          <input
            name="stockQuantity"
            type="number"
            inputMode="numeric"
            min={0}
            max={100000}
            step={1}
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            disabled={madeToOrder}
            aria-invalid={Boolean(state.fieldErrors?.stockQuantity)}
            aria-describedby={
              state.fieldErrors?.stockQuantity
                ? `stock-${product.id}-error`
                : undefined
            }
            className="w-24 bg-transparent border-b border-hairline py-1.5 text-base text-ink text-right tabular-nums focus:outline-none focus:border-ink transition-colors aria-[invalid=true]:border-danger disabled:text-stone-400 disabled:border-stone-200"
          />
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="madeToOrder"
            checked={madeToOrder}
            onChange={(e) => setMadeToOrder(e.target.checked)}
            className="h-4 w-4 border-hairline accent-ink"
          />
          <span className="eyebrow">Made to order</span>
        </label>

        <SaveButton />

        <StatusLine state={state} rowId={product.id} />
      </form>
    </li>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" disabled={pending}>
      {pending ? "Saving…" : "Save"}
    </Button>
  );
}

function StatusLine({
  state,
  rowId,
}: {
  state: StockRowState;
  rowId: string;
}) {
  if (state.ok && !state.error) {
    return (
      <p
        role="status"
        className="text-[0.6875rem] tracking-widest uppercase text-success"
      >
        Saved
      </p>
    );
  }
  if (state.fieldErrors?.stockQuantity) {
    return (
      <p
        id={`stock-${rowId}-error`}
        role="alert"
        className="text-xs text-danger"
      >
        {state.fieldErrors.stockQuantity}
      </p>
    );
  }
  if (state.error) {
    return (
      <p role="alert" className="text-xs text-danger">
        {state.error}
      </p>
    );
  }
  return null;
}
