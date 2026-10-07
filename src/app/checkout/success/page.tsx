import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { requireSession } from "@/lib/session";
import { PendingOrder } from "./pending-order";

export const metadata: Metadata = {
  title: "Thank you — Atelier",
};

// The webhook is the only writer. This page just reads whatever row exists —
// a browser hitting /checkout/success never flips an order to paid on its own.
// Order details are PII (email, shipping address, items, totals), so we gate
// on a signed-in session AND verify the row belongs to the requesting user
// before rendering anything beyond the generic "payment received" view.
export default async function CheckoutSuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const params = await searchParams;
  const raw = params.session_id;
  const sessionId = typeof raw === "string" ? raw : null;

  if (!sessionId) {
    return <MissingSession />;
  }

  // Preserve the full return path so the user lands back on their receipt
  // after signing in, not just on a bare /checkout/success with no id.
  const session = await requireSession(
    `/checkout/success?session_id=${encodeURIComponent(sessionId)}`,
  );

  const order = await db.query.orders.findFirst({
    where: eq(orders.stripeCheckoutSessionId, sessionId),
    with: { items: true },
  });

  // No row yet — the webhook may still be in-flight. Fall back to the pending
  // poll view, which only reveals confirmation state (not order contents).
  if (!order) {
    return <PendingOrder sessionId={sessionId} />;
  }

  // Row exists but belongs to someone else. Do not leak email / shipping /
  // items / totals. Show the same neutral "payment received" shape we show
  // while waiting, without any order lookup.
  if (order.userId !== session.user.id) {
    return <PendingOrder sessionId={sessionId} />;
  }

  const shippingLines = [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingPostalCode].filter(Boolean).join(" "),
    [order.shippingState, order.shippingCountry].filter(Boolean).join(", "),
  ].filter((line): line is string => Boolean(line));

  return (
    <main className="flex-1">
      <article className="pt-10 md:pt-16 pb-20 md:pb-28">
        <Container width="wide">
          <header className="max-w-xl">
            <Eyebrow>Confirmation</Eyebrow>
            <h1 className="display-md mt-3">Thank you — your order is placed.</h1>
            <p className="mt-5 text-stone-600 leading-relaxed">
              A receipt is on its way to{" "}
              <span className="text-ink">{order.email}</span>. Each piece is prepared
              and dispatched by hand; we&apos;ll be in touch once yours is on its way.
            </p>
          </header>

          <div className="mt-12 md:mt-16 grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
            <section>
              <Eyebrow>Your pieces</Eyebrow>
              <ul className="hairline-t mt-4">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="hairline-b py-6 md:py-8 grid grid-cols-[88px_1fr_auto] gap-5 md:gap-8 md:grid-cols-[120px_1fr_auto]"
                  >
                    <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex flex-col gap-2">
                      <p className="text-base md:text-lg text-ink">
                        {item.productName}
                      </p>
                      {item.size && (
                        <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                          Size · {item.size}
                        </p>
                      )}
                      <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                        Quantity · {item.quantity}
                      </p>
                      <p className="mt-1 text-sm text-stone-600 tabular-nums">
                        {formatCents(item.unitAmountCents)} each
                      </p>
                    </div>
                    <p className="text-base md:text-lg tabular-nums">
                      {formatCents(item.amountCents)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <aside className="lg:sticky lg:top-28 hairline-t pt-6 flex flex-col gap-8">
              <div>
                <Eyebrow>Summary</Eyebrow>
                <dl className="mt-5 flex flex-col gap-3 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-stone-600">Subtotal</dt>
                    <dd className="tabular-nums">
                      {formatCents(order.amountSubtotalCents)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-stone-600">Shipping</dt>
                    <dd className="tabular-nums">
                      {order.amountShippingCents > 0
                        ? formatCents(order.amountShippingCents)
                        : "Complimentary"}
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 hairline-t pt-6 flex items-baseline justify-between gap-4">
                  <span className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                    Total paid
                  </span>
                  <span className="text-xl tabular-nums">
                    {formatCents(order.amountTotalCents)}
                  </span>
                </div>
              </div>

              {shippingLines.length > 0 && (
                <div>
                  <Eyebrow>Shipping to</Eyebrow>
                  <address className="mt-4 not-italic text-sm text-stone-700 leading-relaxed">
                    {shippingLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </div>
              )}

              <div>
                <Eyebrow>Reference</Eyebrow>
                <p className="mt-3 text-xs tracking-wide text-stone-600 font-mono break-all">
                  {order.id}
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-14 text-center">
            <Button as={Link} href="/new-arrivals" variant="secondary" size="lg">
              Continue exploring
            </Button>
          </div>
        </Container>
      </article>
    </main>
  );
}

function MissingSession() {
  return (
    <main className="flex-1">
      <article className="pt-20 md:pt-28 pb-20 md:pb-28">
        <Container width="wide">
          <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
            <Eyebrow>Checkout</Eyebrow>
            <h1 className="display-md">No checkout session found.</h1>
            <p className="text-stone-600 leading-relaxed">
              This page expects a Stripe session reference. Head back to the bag
              to begin again.
            </p>
            <Button as={Link} href="/bag" variant="secondary" size="lg">
              Return to the bag
            </Button>
          </div>
        </Container>
      </article>
    </main>
  );
}
