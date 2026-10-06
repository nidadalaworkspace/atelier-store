import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatCents } from "@/lib/format";
import { listAdminProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { stockCopy, stockState, stockTone } from "@/lib/stock";

export const metadata: Metadata = {
  title: "Products — Admin",
};

export default async function AdminProductsPage() {
  await requireAdmin("/admin/products");
  const products = await listAdminProducts();

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>Products</Eyebrow>
          <h2 className="mt-3 text-2xl md:text-3xl text-ink">
            {products.length === 0
              ? "No pieces yet."
              : products.length === 1
                ? "1 piece in the catalogue"
                : `${products.length} pieces in the catalogue`}
          </h2>
          <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
            Create, edit and retire pieces. Changes publish to the storefront
            immediately after save.
          </p>
        </div>
        <Button as={Link} href="/admin/products/new" variant="primary" size="md">
          + New product
        </Button>
      </section>

      {products.length === 0 ? (
        <p className="hairline-t pt-8 text-sm text-stone-600">
          Start the catalogue by creating a product.
        </p>
      ) : (
        <ul className="hairline-t">
          {products.map((product) => {
            const state = stockState(product);
            return (
              <li
                key={product.id}
                className="hairline-b py-6 md:py-7 grid grid-cols-[72px_1fr] gap-5 md:grid-cols-[96px_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:gap-8 md:items-center"
              >
                <div className="relative aspect-[4/5] bg-stone-50 overflow-hidden">
                  {product.primaryImage && (
                    <Image
                      src={product.primaryImage.url}
                      alt={product.primaryImage.alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="min-w-0 flex flex-col gap-1.5">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-base md:text-lg text-ink hover:text-ink-soft transition-colors truncate"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600 font-mono">
                    /{product.slug}
                  </p>
                  {product.isNew && (
                    <p className="text-[0.6875rem] tracking-widest uppercase text-accent">
                      New
                    </p>
                  )}
                </div>

                <p className="text-sm text-stone-600 md:text-ink truncate">
                  {product.category.name}
                </p>

                <p className="text-base tabular-nums text-ink">
                  {formatCents(product.priceCents)}
                </p>

                <div className="col-span-2 md:col-span-1 flex items-center justify-between gap-4 md:flex-col md:items-end md:gap-3">
                  <span className="stock-pill">
                    <span
                      aria-hidden
                      className={`dot ${stockTone(state)}`}
                    />
                    <span className="text-ink">{stockCopy(state)}</span>
                  </span>
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-[0.6875rem] tracking-widest uppercase link text-stone-600 hover:text-ink"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
