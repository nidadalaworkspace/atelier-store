"use client";

import { useActionState, useEffect, useOptimistic, useState, useTransition } from "react";
import { toggleWishlistAction } from "@/app/wishlist/actions";
import type { WishlistActionResult } from "@/lib/wishlist-types";
import { cn } from "@/lib/cn";

type Variant = "inline" | "icon" | "overlay";

type Props = {
  productId: string;
  redirectTo: string;
  /** If known at render (e.g. on the wishlist page), skip the mount fetch. */
  initialInWishlist?: boolean;
  variant?: Variant;
  className?: string;
};

export function WishlistButton({
  productId,
  redirectTo,
  initialInWishlist,
  variant = "inline",
  className,
}: Props) {
  const [fetchedState, setFetchedState] = useState<boolean | undefined>(
    initialInWishlist,
  );
  const [isPending, startTransition] = useTransition();

  const [actionResult, dispatch] = useActionState<
    WishlistActionResult | undefined,
    FormData
  >(toggleWishlistAction, undefined);

  // Server-action result is the most recent truth; otherwise use whatever
  // the mount-fetch learned; otherwise unknown → hollow.
  const serverState = actionResult?.ok
    ? actionResult.inWishlist
    : (fetchedState ?? false);

  const [optimisticState, setOptimistic] = useOptimistic(serverState);

  // Hydrate the known server state once if the caller didn't pass it in.
  useEffect(() => {
    if (initialInWishlist !== undefined) return;
    const ctrl = new AbortController();
    fetch("/api/wishlist/ids", {
      credentials: "same-origin",
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : { ids: [] }))
      .then((d: { ids: string[] }) => setFetchedState(d.ids.includes(productId)))
      .catch(() => {
        /* heart stays hollow */
      });
    return () => ctrl.abort();
  }, [productId, initialInWishlist]);

  function submit() {
    const fd = new FormData();
    fd.set("productId", productId);
    fd.set("redirectTo", redirectTo);
    startTransition(() => {
      setOptimistic(!optimisticState);
      dispatch(fd);
    });
  }

  const active = optimisticState;
  const label = active ? "Remove from wishlist" : "Add to wishlist";

  if (variant === "overlay") {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={submit}
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center h-9 w-9 rounded-full bg-paper/90 backdrop-blur border border-hairline shadow-sm transition-colors hover:bg-paper disabled:opacity-50",
          className,
        )}
      >
        <HeartIcon filled={active} />
      </button>
    );
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={submit}
        disabled={isPending}
        className={cn(
          "inline-flex items-center justify-center p-1 text-ink hover:text-ink-soft transition-colors disabled:opacity-50",
          className,
        )}
      >
        <HeartIcon filled={active} />
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={submit}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-2 text-[0.6875rem] tracking-widest uppercase link disabled:opacity-50",
        className,
      )}
    >
      <HeartIcon filled={active} />
      <span>{active ? "Saved to wishlist" : "Add to wishlist"}</span>
    </button>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill={filled ? "currentColor" : "none"}
      aria-hidden
    >
      <path
        d="M9 15.5s-5.5-3.3-5.5-7.2A2.8 2.8 0 0 1 9 6.2a2.8 2.8 0 0 1 5.5 2.1C14.5 12.2 9 15.5 9 15.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}
