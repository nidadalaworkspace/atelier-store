import type { ProductDetail } from "@/lib/products";
import { stockState, stockCopy, stockTone } from "@/lib/stock";
import { currency } from "@/lib/format";
import { Eyebrow } from "@/components/ui/eyebrow";
import { AddToBagForm } from "@/components/site/add-to-bag-form";
import { WishlistButton } from "@/components/site/wishlist-button";
import { cn } from "@/lib/cn";

export function ProductInfo({ product }: { product: ProductDetail }) {
  const state = stockState(product);

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
          {currency(product.price)}
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

      {/* Sizes + CTA */}
      <AddToBagForm
        productId={product.id}
        slug={product.slug}
        madeToOrder={product.madeToOrder}
        stockQuantity={product.stockQuantity}
        sizes={product.sizes}
      />

      <WishlistButton
        productId={product.id}
        redirectTo={`/products/${product.slug}`}
        className="self-center -mt-2"
      />

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
