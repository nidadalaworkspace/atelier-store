import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getAdminProduct, listCategoriesForSelect } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-product-button";

export const metadata: Metadata = {
  title: "Edit product — Admin",
};

export default async function EditProductPage({
  params,
  searchParams,
}: PageProps<"/admin/products/[id]">) {
  await requireAdmin("/admin/products");
  const { id } = await params;
  const query = await searchParams;

  const [product, categories] = await Promise.all([
    getAdminProduct(id),
    listCategoriesForSelect(),
  ]);

  if (!product) notFound();

  const justCreated = query.created === "1";

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Edit product</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">{product.name}</h2>
        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-600 font-mono">
          <span>/{product.slug}</span>
          <span aria-hidden>·</span>
          <Link
            href={`/products/${product.slug}`}
            target="_blank"
            rel="noreferrer"
            className="link hover:text-ink"
          >
            View on storefront ↗
          </Link>
        </p>
        {justCreated && (
          <p
            role="status"
            className="mt-5 text-[0.6875rem] tracking-widest uppercase text-success"
          >
            Product created
          </p>
        )}
      </section>

      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          categoryId: product.categoryId,
          priceCents: product.priceCents,
          stockQuantity: product.stockQuantity,
          madeToOrder: product.madeToOrder,
          isNew: product.isNew,
          description: product.description,
          materials: product.materials,
          care: product.care,
          reference: product.reference,
          sizes: product.sizes,
          details: product.details,
          primaryImage:
            product.images.find((i) => i.position === 0) ?? null,
        }}
        deleteSlot={
          <div className="flex flex-col gap-3 max-w-xl">
            <Eyebrow>Danger zone</Eyebrow>
            <p className="text-sm text-stone-600 leading-relaxed">
              Deleting a product removes it from the catalogue and every active
              bag. Past orders keep their snapshot — the line item&apos;s
              product_id is nulled out, the name, slug and price it was sold at
              are preserved.
            </p>
            <DeleteProductButton
              productId={product.id}
              productName={product.name}
            />
          </div>
        }
      />
    </div>
  );
}
