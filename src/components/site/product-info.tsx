import type { ProductDetail } from "@/lib/products";
import { stockState, stockCopy, stockTone } from "@/lib/stock";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/cn";

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function ProductInfo({ product }: { product: ProductDetail }) {
  const state = stockState(product);
  const soldOut = state === "out-of-stock";
  const madeToOrder = state === "made-to-order";

  return (
    <div className="lg:sticky lg:top-28 flex flex-col gap-7 lg:gap-8 lg:pl-6 xl:pl-12">
      {/* Category + name */}
      <div>
        <Eyebrow>{product.category}</Eyebrow>
        <h1 className="display-md mt-3">{product.name}</h1>
      </div>

      {/* Price + stock */}
      <div className="flex items-baseline justify-between gap-6 hairline-b pb-5">
        <div className="text-xl md:text-2xl font-light tabular-nums">
          {priceFormatter.format(product.price)}
        </div>
        <div className="stock-pill">
          <span className={cn("dot", stockTone(state))} aria-hidden />
          <span>{stockCopy(state)}</span>
        </div>
      </div>

      {/* Short description */}
      <p className="text-[0.9375rem] md:text-base text-stone-600 leading-relaxed">
        {product.description}
      </p>

      {/* Reference */}
      <div className="text-[0.6875rem] tracking-widest uppercase text-stone-400">
        Ref. {product.reference}
      </div>

      {/* Sizes */}
      {product.sizes && (
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
          <div className="grid grid-cols-5 gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                type="button"
                className="h-11 border border-hairline hover:border-ink text-sm transition-colors"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col gap-3 pt-1">
        <Button
          type="button"
          variant="primary"
          size="lg"
          disabled={soldOut}
          className="w-full"
        >
          {soldOut
            ? "Join the waitlist"
            : madeToOrder
              ? "Order to make"
              : "Add to bag"}
        </Button>
        <button
          type="button"
          className="text-[0.6875rem] tracking-widest uppercase link self-center mt-1"
        >
          Add to wishlist
        </button>
      </div>

      {/* Accordions */}
      <div className="mt-2">
        <details className="accordion" open>
          <summary>Details</summary>
          <div className="accordion-body">
            <ul>
              {product.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </div>
        </details>
        <details className="accordion">
          <summary>Materials &amp; Care</summary>
          <div className="accordion-body">
            <p>{product.materials}</p>
            <p className="mt-2">{product.care}</p>
          </div>
        </details>
        <details className="accordion">
          <summary>Shipping &amp; Returns</summary>
          <div className="accordion-body">
            <p>
              Complimentary signature-packaged delivery, worldwide. Thirty-day
              returns on unworn pieces with original tags.
            </p>
          </div>
        </details>
        <details className="accordion">
          <summary>From the atelier</summary>
          <div className="accordion-body">
            <p>
              Produced in editions no larger than two hundred, by twelve
              artisans in Como. Each piece carries the maker&apos;s mark inside
              the seam.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
