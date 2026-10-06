import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { listAdminProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/session";
import { stockState } from "@/lib/stock";
import { StockRow } from "./stock-row";

export const metadata: Metadata = {
  title: "Stock — Admin",
};

export default async function AdminStockPage() {
  await requireAdmin("/admin/stock");
  const products = await listAdminProducts();

  const counts = products.reduce(
    (acc, p) => {
      const s = stockState(p);
      if (s === "low-stock") acc.low += 1;
      if (s === "out-of-stock") acc.out += 1;
      if (s === "made-to-order") acc.mto += 1;
      return acc;
    },
    { low: 0, out: 0, mto: 0 },
  );

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Stock</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          {products.length === 0
            ? "No pieces to track yet."
            : "Quantities and made-to-order."}
        </h2>
        {products.length > 0 && (
          <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
            {products.length} {products.length === 1 ? "piece" : "pieces"} ·{" "}
            {counts.low} low · {counts.out} out · {counts.mto} made to order.
            Edits publish to the storefront immediately after save.
          </p>
        )}
      </section>

      {products.length === 0 ? (
        <p className="hairline-t pt-8 text-sm text-stone-600">
          Add a piece under Products to start tracking stock.
        </p>
      ) : (
        <ul className="hairline-t">
          {products.map((product) => (
            <StockRow key={product.id} product={product} />
          ))}
        </ul>
      )}
    </div>
  );
}
