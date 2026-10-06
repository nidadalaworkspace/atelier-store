import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatCents } from "@/lib/format";
import { getUserOrder, type OrderStatus } from "@/lib/orders";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order details — Atelier",
};

const orderDateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const statusCopy: Record<OrderStatus, string> = {
  paid: "Paid",
  processing: "Processing",
  failed: "Payment failed",
};

const statusDotClass: Record<OrderStatus, string> = {
  paid: "bg-ink",
  processing: "bg-warning",
  failed: "bg-danger",
};

const statusTextClass: Record<OrderStatus, string> = {
  paid: "text-ink",
  processing: "text-warning",
  failed: "text-danger",
};

export default async function AccountOrderDetailPage({
  params,
}: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  const session = await requireSession(`/account/orders/${id}`);
  const order = await getUserOrder(session.user.id, id);
  if (!order) notFound();

  const shippingLines = [
    order.shippingName,
    order.shippingLine1,
    order.shippingLine2,
    [order.shippingCity, order.shippingPostalCode].filter(Boolean).join(" "),
    [order.shippingState, order.shippingCountry].filter(Boolean).join(", "),
  ].filter((line): line is string => Boolean(line));

  return (
    <div className="flex flex-col gap-12">
      <header>
        <Link
          href="/account/orders"
          className="text-[0.6875rem] tracking-widest uppercase link text-stone-600 hover:text-ink"
        >
          ← All orders
        </Link>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-3 justify-between">
          <div>
            <Eyebrow>
              Placed {orderDateFormatter.format(order.createdAt)}
            </Eyebrow>
            <h2 className="mt-3 text-2xl md:text-3xl text-ink">
              Order{" "}
              <span className="font-mono text-base text-stone-600">
                #{order.id.slice(0, 8)}
              </span>
            </h2>
          </div>
          <span className="stock-pill">
            <span
              aria-hidden
              className={`dot ${statusDotClass[order.status]}`}
            />
            <span className={statusTextClass[order.status]}>
              {statusCopy[order.status]}
            </span>
          </span>
        </div>
      </header>

      <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <section>
          <Eyebrow>Pieces</Eyebrow>
          <ul className="hairline-t mt-4">
            {order.items.map((item) => {
              const href = item.productSlug ? `/products/${item.productSlug}` : null;
              return (
                <li
                  key={item.id}
                  className="hairline-b py-6 md:py-8 grid grid-cols-[88px_1fr_auto] gap-5 md:gap-8 md:grid-cols-[120px_1fr_auto]"
                >
                  {href ? (
                    <Link
                      href={href}
                      className="relative aspect-[4/5] bg-stone-50 overflow-hidden"
                    >
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                  ) : (
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
                  )}
                  <div className="min-w-0 flex flex-col gap-2">
                    {href ? (
                      <Link
                        href={href}
                        className="text-base md:text-lg text-ink hover:text-ink-soft transition-colors"
                      >
                        {item.productName}
                      </Link>
                    ) : (
                      <p className="text-base md:text-lg text-ink">
                        {item.productName}
                      </p>
                    )}
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
              );
            })}
          </ul>
        </section>

        <aside className="hairline-t pt-6 flex flex-col gap-8">
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
                Total
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
            <Eyebrow>Contact</Eyebrow>
            <p className="mt-3 text-sm text-stone-700 break-all">
              {order.email}
            </p>
          </div>

          <div>
            <Eyebrow>Reference</Eyebrow>
            <p className="mt-3 text-xs tracking-wide text-stone-600 font-mono break-all">
              {order.id}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
