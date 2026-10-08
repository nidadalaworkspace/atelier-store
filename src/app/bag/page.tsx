import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { requireSession } from "@/lib/session";
import { getBag } from "@/lib/cart";
import type { BagLine } from "@/lib/cart-types";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/cn";
import { BagLineControls } from "./bag-line-controls";
import { CheckoutButton } from "./checkout-button";
import { CheckoutCancelledNotice } from "./checkout-cancelled-notice";
import { EmptyBag } from "./empty-bag";

export const metadata: Metadata = {
  title: "Your bag — Atelier",
};

export default async function BagPage({
  searchParams,
}: PageProps<"/bag">) {
  await requireSession("/bag");
  const params = await searchParams;
  const cancelled = readFlag(params.checkout) === "cancelled";
  const bag = await getBag();
  const items = bag?.items ?? [];
  const needsAttention = items.filter((l) => l.availability !== "ok").length;

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "The bag" }]}
      />
      <article className="pt-6 md:pt-10 pb-20 md:pb-28">
        <Container width="wide">
          <div className="mb-10 md:mb-14 flex items-baseline justify-between gap-6">
            <div>
              <Eyebrow>The bag</Eyebrow>
              <h1 className="display-md mt-3">Your selection</h1>
            </div>
            {items.length > 0 && (
              <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                {bag!.itemCount} {bag!.itemCount === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>

          {cancelled && <CheckoutCancelledNotice />}

          {items.length === 0 ? (
            <EmptyBag />
          ) : (
            <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <ul className="hairline-t">
                {items.map((line) => (
                  <li
                    key={line.id}
                    className={cn(
                      "hairline-b py-6 md:py-8 grid grid-cols-[88px_1fr_auto] gap-5 md:gap-8 md:grid-cols-[120px_1fr_auto]",
                      line.availability === "unavailable" && "opacity-70",
                    )}
                  >
                    <Link
                      href={`/products/${line.slug}`}
                      className="relative aspect-[4/5] bg-stone-50 overflow-hidden"
                    >
                      {line.imageUrl && (
                        <Image
                          src={line.imageUrl}
                          alt={line.name}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="min-w-0 flex flex-col gap-2">
                      <Eyebrow>{line.category}</Eyebrow>
                      <Link
                        href={`/products/${line.slug}`}
                        className="text-base md:text-lg text-ink hover:text-ink-soft transition-colors"
                      >
                        {line.name}
                      </Link>
                      {line.size && (
                        <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                          Size · {line.size}
                        </p>
                      )}
                      {line.madeToOrder && (
                        <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                          Made to order
                        </p>
                      )}
                      {line.availability !== "ok" && (
                        <LineStockBadge line={line} />
                      )}
                      <p className="mt-1 text-sm text-stone-600 tabular-nums">
                        {formatCents(line.unitCents)} each
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between gap-4">
                      <p className="text-base md:text-lg tabular-nums">
                        {formatCents(line.lineCents)}
                      </p>
                      <BagLineControls line={line} />
                    </div>
                  </li>
                ))}
              </ul>

              <aside className="lg:sticky lg:top-28 hairline-t pt-6">
                <Eyebrow>Summary</Eyebrow>
                {needsAttention > 0 && (
                  <p
                    role="status"
                    className="mt-4 text-xs text-warning leading-relaxed"
                  >
                    {needsAttention === 1 ? "1 piece needs" : `${needsAttention} pieces need`}
                    {" "}review before checkout.
                  </p>
                )}
                <dl className="mt-5 flex flex-col gap-3 text-sm">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-stone-600">Subtotal</dt>
                    <dd className="text-base tabular-nums">
                      {formatCents(bag!.subtotalCents)}
                    </dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-stone-600">Shipping</dt>
                    <dd className="text-stone-600">
                      Calculated at checkout
                    </dd>
                  </div>
                </dl>
                <div className="mt-6 hairline-t pt-6 flex items-baseline justify-between gap-4">
                  <span className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
                    Estimated total
                  </span>
                  <span className="text-xl tabular-nums">
                    {formatCents(bag!.subtotalCents)}
                  </span>
                </div>
                <div className="mt-8">
                  <CheckoutButton disabled={needsAttention > 0} />
                </div>
                <p className="mt-4 text-[0.6875rem] tracking-widest uppercase text-stone-500 text-center">
                  Complimentary signature-packaged delivery, worldwide.
                </p>
                <div className="mt-6 text-center">
                  <Link
                    href="/new-arrivals"
                    className="text-[0.6875rem] tracking-widest uppercase link text-stone-600 hover:text-ink"
                  >
                    Continue shopping
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </Container>
      </article>
    </main>
  );
}

function readFlag(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === "string" ? raw : null;
}

function LineStockBadge({ line }: { line: BagLine }) {
  if (line.availability === "ok") return null;
  if (line.availability === "unavailable") {
    return (
      <span className="stock-pill">
        <span className="dot bg-danger" aria-hidden />
        <span className="text-danger">Currently unavailable</span>
      </span>
    );
  }
  return (
    <span className="stock-pill">
      <span className="dot bg-warning" aria-hidden />
      <span className="text-warning">
        Only {line.availableNow ?? 0} available
      </span>
    </span>
  );
}
