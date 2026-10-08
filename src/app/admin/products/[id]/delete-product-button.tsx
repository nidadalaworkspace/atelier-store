"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "../actions";

type Props = {
  productId: string;
  productName: string;
};

// Wraps the destructive form in a two-step dance: a native confirm() dialog
// first, then a `confirm=yes` field the server re-checks. This defends against
// an admin accidentally one-click-deleting a product and against any cross-
// origin POST that lands on the action without the sentinel field.
export function DeleteProductButton({ productId, productName }: Props) {
  const [confirmed, setConfirmed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    const ok = window.confirm(
      `Delete "${productName}"? This removes it from the catalogue and every active bag. Past orders keep their snapshot.`,
    );
    if (!ok) return;
    setConfirmed(true);
    // State update is async; submit on the next microtask once the hidden
    // `confirm` input reflects "yes".
    queueMicrotask(() => formRef.current?.requestSubmit());
  }

  return (
    <form ref={formRef} action={deleteProductAction} className="mt-2">
      <input type="hidden" name="id" value={productId} />
      <input type="hidden" name="confirm" value={confirmed ? "yes" : ""} />
      <DeleteButton onClick={handleClick} />
    </form>
  );
}

function DeleteButton({ onClick }: { onClick: () => void }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={onClick}
    >
      {pending ? "Deleting…" : "Delete product"}
    </Button>
  );
}
