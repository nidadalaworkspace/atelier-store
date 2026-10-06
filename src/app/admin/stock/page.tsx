import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Stock — Admin",
};

export default async function AdminStockPage() {
  await requireAdmin("/admin/stock");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Stock</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          Quantities and made-to-order.
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
          Per-piece stock adjustments and the made-to-order toggle land in the
          next slice.
        </p>
      </section>
    </div>
  );
}
