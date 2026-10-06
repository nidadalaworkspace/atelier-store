import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/format";
import { listUserOrders, type OrderStatus } from "@/lib/orders";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your orders — Atelier",
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

export default async function AccountOrdersPage() {
  const session = await requireSession("/account/orders");
  const orders = await listUserOrders(session.user.id);

  if (orders.length === 0) {
    return (
      <div className="flex flex-col gap-10 max-w-2xl">
        <section>
          <Eyebrow>Order history</Eyebrow>
          <h2 className="display-md mt-3">No orders yet.</h2>
          <p className="mt-5 text-stone-600 leading-relaxed">
            Pieces you order from the atelier will appear here, with their
            receipts and dispatch details.
          </p>
          <div className="mt-8">
            <Button as={Link} href="/new-arrivals" variant="secondary">
              Browse new arrivals
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Order history</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          {orders.length === 1 ? "1 order" : `${orders.length} orders`}
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed">
          Each order below records the pieces, status and total at the moment
          they were placed.
        </p>

        <ul className="mt-10 hairline-t">
          {orders.map((order) => (
            <li
              key={order.id}
              className="hairline-b py-6 md:py-8 grid grid-cols-[72px_1fr] gap-5 md:grid-cols-[96px_1fr_auto] md:gap-8 md:items-center"
            >
              <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
                {order.previewImageUrl && (
                  <Image
                    src={order.previewImageUrl}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 flex flex-col gap-2">
                <Eyebrow>
                  {orderDateFormatter.format(order.createdAt)}
                </Eyebrow>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-base md:text-lg text-ink hover:text-ink-soft transition-colors"
                >
                  Order{" "}
                  <span className="font-mono text-sm text-stone-600">
                    #{order.id.slice(0, 8)}
                  </span>
                </Link>
                <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                  {order.itemCount}{" "}
                  {order.itemCount === 1 ? "piece" : "pieces"}
                </p>
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

              <div className="col-span-2 md:col-span-1 flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3">
                <p className="text-base md:text-lg tabular-nums">
                  {formatCents(order.amountTotalCents)}
                </p>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="text-[0.6875rem] tracking-widest uppercase link text-stone-600 hover:text-ink"
                >
                  View order
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
