import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { currency } from "@/lib/format";
import { stockState, stockCopy, stockTone } from "@/lib/stock";
import { cn } from "@/lib/cn";

type Props = {
  product: Product;
  sizes?: string;
  priority?: boolean;
};

export function ProductCard({ product, sizes, priority }: Props) {
  const state = stockState(product);
  const showBadge = state !== "in-stock";
  const soldOut = state === "out-of-stock";

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-stone-50">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority={priority}
          sizes={
            sizes ?? "(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 96vw"
          }
          className={cn(
            "object-cover transition-[transform,filter] duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]",
            soldOut && "grayscale opacity-80",
          )}
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-paper/90 text-ink text-[0.625rem] tracking-widest uppercase px-2.5 py-1">
            New
          </span>
        )}
        {showBadge && (
          <span className="stock-pill absolute top-3 right-3 bg-paper/90 px-2.5 py-1">
            <span aria-hidden className={cn("dot", stockTone(state))} />
            <span>{cardCopy(state)}</span>
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
            {product.category}
          </p>
          <h3
            className={cn(
              "mt-1.5 text-sm md:text-[0.9375rem] leading-snug truncate",
              soldOut ? "text-stone-600" : "text-ink",
            )}
          >
            {product.name}
          </h3>
        </div>
        <div
          className={cn(
            "text-sm md:text-[0.9375rem] tabular-nums whitespace-nowrap",
            soldOut ? "text-stone-600" : "text-ink",
          )}
        >
          {currency(product.price)}
        </div>
      </div>
    </Link>
  );
}

// Card badges stay terse — the long-form copy belongs on the PDP pill.
function cardCopy(state: ReturnType<typeof stockState>): string {
  switch (state) {
    case "low-stock":
      return "Few left";
    case "out-of-stock":
      return "Sold out";
    case "made-to-order":
      return "Made to order";
    default:
      return stockCopy(state);
  }
}
