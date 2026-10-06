import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { listCategoriesForSelect } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { ProductForm } from "../product-form";

export const metadata: Metadata = {
  title: "New product — Admin",
};

export default async function NewProductPage() {
  await requireAdmin("/admin/products/new");
  const categories = await listCategoriesForSelect();

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>New product</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          Add a piece to the catalogue.
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
          Fields marked required must be filled. The piece publishes to the
          storefront as soon as you save.
        </p>
      </section>

      {categories.length === 0 ? (
        <div className="hairline-t pt-8 flex flex-col gap-5 max-w-xl">
          <p className="text-sm text-stone-600 leading-relaxed">
            No categories exist yet. A product must belong to a category — add
            one first.
          </p>
          <div>
            <Button
              as={Link}
              href="/admin/categories"
              variant="secondary"
              size="md"
            >
              Open categories
            </Button>
          </div>
        </div>
      ) : (
        <ProductForm categories={categories} />
      )}
    </div>
  );
}
