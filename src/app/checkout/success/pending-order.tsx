"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

// Pending state the server page falls back to when the Stripe webhook hasn't
// written an order row yet. The webhook almost always races ahead of the
// browser, so this view is rare — but when it appears, it stays live rather
// than meta-refreshing the whole document.
//
// Poll cadence: 2s for the first ~30s, then back off to 5s. After ~90s we stop
// polling and swap the copy to tell the user we'll email them — delayed
// payment methods (bank debits, redirects) can take real time to settle.
const POLL_FAST_MS = 2_000;
const POLL_SLOW_MS = 5_000;
const BACKOFF_AFTER_MS = 30_000;
const GIVE_UP_AFTER_MS = 90_000;

type Props = { sessionId: string };

export function PendingOrder({ sessionId }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<"settling" | "takingLonger">("settling");

  useEffect(() => {
    const startedAt = Date.now();
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      if (cancelled) return;
      try {
        const res = await fetch(
          `/api/orders/by-session?id=${encodeURIComponent(sessionId)}`,
          { cache: "no-store" },
        );
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as { status: "confirmed" | "pending" };
          if (data.status === "confirmed") {
            router.refresh();
            return;
          }
        }
      } catch {
        // Transient network blips are expected during card-settlement redirects.
        // Fall through and try again on the next tick.
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed >= GIVE_UP_AFTER_MS) {
        setPhase("takingLonger");
        return;
      }
      const next = elapsed > BACKOFF_AFTER_MS ? POLL_SLOW_MS : POLL_FAST_MS;
      timeoutId = setTimeout(poll, next);
    }

    timeoutId = setTimeout(poll, POLL_FAST_MS);
    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [router, sessionId]);

  return (
    <main className="flex-1">
      <article className="pt-20 md:pt-28 pb-20 md:pb-28">
        <Container width="wide">
          <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
            <Eyebrow>Confirmation</Eyebrow>
            <PulseMark />
            {phase === "settling" ? (
              <>
                <h1 className="display-md">Payment received — finalising your order.</h1>
                <p className="text-stone-600 leading-relaxed">
                  We&apos;re writing the details to your account. This usually
                  takes just a moment.
                </p>
                <p
                  role="status"
                  aria-live="polite"
                  className="text-[0.6875rem] tracking-widest uppercase text-stone-500"
                >
                  Awaiting confirmation
                </p>
              </>
            ) : (
              <>
                <h1 className="display-md">We&apos;re still settling your payment.</h1>
                <p className="text-stone-600 leading-relaxed">
                  Some payment methods take a few minutes to clear. You can safely
                  close this window — we&apos;ll email a receipt as soon as it
                  settles, and the order will appear in your account.
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
                  <Button as={Link} href="/account" variant="secondary" size="lg">
                    Go to your account
                  </Button>
                  <button
                    type="button"
                    onClick={() => router.refresh()}
                    className="text-[0.6875rem] tracking-widest uppercase link text-stone-600 hover:text-ink"
                  >
                    Check again
                  </button>
                </div>
              </>
            )}
          </div>
        </Container>
      </article>
    </main>
  );
}

function PulseMark() {
  return (
    <span
      aria-hidden
      className="relative inline-flex h-3 w-3"
    >
      <span className="absolute inline-flex h-full w-full rounded-full bg-ink opacity-40 animate-ping" />
      <span className="relative inline-flex h-3 w-3 rounded-full bg-ink" />
    </span>
  );
}
