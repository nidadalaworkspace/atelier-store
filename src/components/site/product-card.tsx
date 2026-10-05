import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { currency } from "@/lib/format";

type Props = {
  product: Product;
  sizes?: string;
  priority?: boolean;
};

export function ProductCard({ product, sizes, priority }: Props) {
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
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
        />
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-paper/90 text-ink text-[0.625rem] tracking-widest uppercase px-2.5 py-1">
            New
          </span>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600">
            {product.category}
          </p>
          <h3 className="mt-1.5 text-sm md:text-[0.9375rem] text-ink leading-snug truncate">
            {product.name}
          </h3>
        </div>
        <div className="text-sm md:text-[0.9375rem] text-ink tabular-nums whitespace-nowrap">
          {currency(product.price)}
        </div>
      </div>
    </Link>
  );
}
