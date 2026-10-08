"use client";

import { useActionState, useOptimistic, useTransition } from "react";
import type { BagLine, CartActionResult } from "@/lib/cart-types";
import { removeLineAction, updateQuantityAction } from "./actions";

type Props = {
  line: BagLine;
};

export function BagLineControls({ line }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticQty, setOptimisticQty] = useOptimistic(line.quantity);

  const [updateState, dispatchUpdate] = useActionState<
    CartActionResult | undefined,
    FormData
  >(updateQuantityAction, undefined);

  const [, dispatchRemove] = useActionState<
    CartActionResult | undefined,
    FormData
  >(removeLineAction, undefined);

  function submitQuantity(nextQty: number) {
    if (nextQty < 0) return;
    const fd = new FormData();
    fd.set("lineId", line.id);
    fd.set("quantity", String(nextQty));
    startTransition(() => {
      // Mirror the server's semantics: qty 0 deletes the line, so the display
      // can drop below 1 — pinning at 1 would show stale "1" after a
      // "Remove unavailable" tap until revalidation strips the row.
      setOptimisticQty(nextQty);
      dispatchUpdate(fd);
    });
  }

  function submitRemove() {
    const fd = new FormData();
    fd.set("lineId", line.id);
    startTransition(() => {
      dispatchRemove(fd);
    });
  }

  const atMax =
    !line.madeToOrder &&
    line.availableNow !== null &&
    optimisticQty >= line.availableNow;

  const errorMessage =
    updateState && !updateState.ok ? errorCopy(updateState) : null;

  return (
    <div className="flex flex-col items-end gap-2">
      <div
        className="inline-flex items-center border border-hairline"
        role="group"
        aria-label="Quantity"
      >
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => submitQuantity(optimisticQty - 1)}
          disabled={isPending || optimisticQty <= 1}
          className="h-9 w-9 inline-flex items-center justify-center text-base disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50"
        >
          −
        </button>
        <span
          aria-live="polite"
          className="min-w-8 text-center text-sm tabular-nums"
        >
          {optimisticQty}
        </span>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => submitQuantity(optimisticQty + 1)}
          disabled={isPending || atMax}
          className="h-9 w-9 inline-flex items-center justify-center text-base disabled:opacity-30 disabled:cursor-not-allowed hover:bg-stone-50"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={submitRemove}
        disabled={isPending}
        className="text-[0.6875rem] tracking-widest uppercase link text-stone-600 hover:text-ink disabled:opacity-40"
      >
        Remove
      </button>

      {errorMessage && (
        <p role="alert" className="text-[0.6875rem] tracking-wide text-danger">
          {errorMessage}
        </p>
      )}

      {line.availability !== "ok" && (
        <AvailabilityFix
          line={line}
          isPending={isPending}
          onFix={submitQuantity}
        />
      )}
    </div>
  );
}

function AvailabilityFix({
  line,
  isPending,
  onFix,
}: {
  line: BagLine;
  isPending: boolean;
  onFix: (qty: number) => void;
}) {
  if (line.availability === "unavailable") {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={() => onFix(0)}
        className="text-[0.6875rem] tracking-widest uppercase link text-danger disabled:opacity-40"
      >
        Remove unavailable
      </button>
    );
  }

  const available = line.availableNow ?? 0;
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => onFix(available)}
      className="text-[0.6875rem] tracking-widest uppercase link text-warning disabled:opacity-40"
    >
      Set to {available}
    </button>
  );
}

function errorCopy(result: Exclude<CartActionResult, { ok: true }>): string {
  switch (result.error) {
    case "exceeds-stock":
      return `Only ${result.available ?? 0} available.`;
    case "quantity-limit":
      return `You can add up to ${result.available ?? 0} more of this item.`;
    case "out-of-stock":
      return "No longer available.";
    case "not-found":
      return "This line is no longer in your bag.";
    case "unauthenticated":
      return "Please sign in again.";
    case "invalid-size":
      return "Please select a valid size.";
    case "invalid-input":
      return "Something went wrong — try again.";
  }
}
