"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { startCheckout, type CheckoutActionResult } from "@/lib/checkout";

export function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const [state, dispatch, isPending] = useActionState<
    CheckoutActionResult | undefined,
    FormData
  >(async () => startCheckout(), undefined);

  // A successful startCheckout never returns — it redirects to Stripe. Anything
  // we receive back is therefore an error (bag emptied in another tab, stock
  // changed, or a Stripe API failure).
  const errorMessage =
    state && !state.ok ? errorCopy(state.error) : null;

  return (
    <form action={dispatch} className="flex flex-col gap-3" aria-busy={isPending}>
      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={disabled || isPending}
        className="w-full"
      >
        {isPending ? "Redirecting to secure checkout…" : "Checkout"}
      </Button>
      {isPending && (
        <p className="text-[0.6875rem] tracking-widest uppercase text-stone-500 text-center">
          Taking you to Stripe
        </p>
      )}
      {errorMessage && !isPending && (
        <p role="alert" className="text-xs text-danger leading-relaxed">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

function errorCopy(error: Exclude<CheckoutActionResult, { ok: true }>["error"]) {
  switch (error) {
    case "empty-bag":
      return "Your bag is empty.";
    case "stock-changed":
      return "A piece in your bag is no longer available at the chosen quantity. Review the items marked above, then try again.";
    case "session-failed":
      return "We couldn't start checkout. Please try again in a moment.";
  }
}
