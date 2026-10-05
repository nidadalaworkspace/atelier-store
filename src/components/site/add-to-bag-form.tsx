"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { addToBagAction } from "@/app/bag/actions";
import type { CartActionResult } from "@/lib/cart-types";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";

type Props = {
  productId: string;
  slug: string;
  madeToOrder: boolean;
  stockQuantity: number;
  sizes?: string[];
};

export function AddToBagForm({
  productId,
  slug,
  madeToOrder,
  stockQuantity,
  sizes,
}: Props) {
  const soldOut = !madeToOrder && stockQuantity <= 0;
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    undefined,
  );
  const [state, formAction] = useActionState<
    CartActionResult | undefined,
    FormData
  >(addToBagAction, undefined);

  const needsSize = Boolean(sizes && sizes.length > 0);
  const canSubmit = !soldOut && (!needsSize || !!selectedSize);

  const errorMessage =
    state && !state.ok ? errorCopy(state) : null;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="quantity" value="1" />
      <input type="hidden" name="redirectTo" value={`/products/${slug}`} />
      {selectedSize && (
        <input type="hidden" name="size" value={selectedSize} />
      )}

      {sizes && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <Eyebrow>Size</Eyebrow>
            <a
              href="#size-guide"
              className="text-[0.6875rem] tracking-widest uppercase link"
            >
              Size guide
            </a>
          </div>
          <div
            className="grid grid-cols-5 gap-2"
            role="radiogroup"
            aria-label="Size"
          >
            {sizes.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-11 border text-sm transition-colors",
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-hairline hover:border-ink",
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <SubmitButton
        soldOut={soldOut}
        madeToOrder={madeToOrder}
        canSubmit={canSubmit}
        needsSize={needsSize}
        hasSize={!!selectedSize}
      />

      {state?.ok && (
        <p
          role="status"
          className="text-[0.6875rem] tracking-widest uppercase text-success text-center"
        >
          Added to the bag
        </p>
      )}
      {errorMessage && (
        <p
          role="alert"
          className="text-[0.6875rem] tracking-widest uppercase text-danger text-center"
        >
          {errorMessage}
        </p>
      )}
    </form>
  );
}

function SubmitButton({
  soldOut,
  madeToOrder,
  canSubmit,
  needsSize,
  hasSize,
}: {
  soldOut: boolean;
  madeToOrder: boolean;
  canSubmit: boolean;
  needsSize: boolean;
  hasSize: boolean;
}) {
  const { pending } = useFormStatus();

  const label = pending
    ? "Adding…"
    : soldOut
      ? "Join the waitlist"
      : needsSize && !hasSize
        ? "Select a size"
        : madeToOrder
          ? "Order to make"
          : "Add to bag";

  return (
    <Button
      type="submit"
      variant="primary"
      size="lg"
      disabled={!canSubmit || pending}
      className="w-full"
    >
      {label}
    </Button>
  );
}

function errorCopy(result: Exclude<CartActionResult, { ok: true }>): string {
  switch (result.error) {
    case "exceeds-stock":
      return `Only ${result.available ?? 0} available`;
    case "out-of-stock":
      return "Currently unavailable";
    case "not-found":
      return "This piece is no longer available";
    case "unauthenticated":
      return "Please sign in to save pieces to your bag";
    case "invalid-input":
      return "Something went wrong — try again";
  }
}
