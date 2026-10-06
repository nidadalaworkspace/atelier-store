import "server-only";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories, orders, products } from "@/db/schema";

export type AdminOverview = {
  products: number;
  categories: number;
  outOfStock: number;
  orders: number;
};

// Four small counts the admin landing shows. Issued in parallel; each is a
// single scalar aggregate so round-trip cost is minimal.
export async function getAdminOverview(): Promise<AdminOverview> {
  const [productCount, categoryCount, outOfStockCount, orderCount] =
    await Promise.all([
      db.select({ v: count() }).from(products),
      db.select({ v: count() }).from(categories),
      db
        .select({ v: count() })
        .from(products)
        .where(and(eq(products.stockQuantity, 0), eq(products.madeToOrder, false))),
      db.select({ v: count() }).from(orders),
    ]);

  return {
    products: productCount[0]?.v ?? 0,
    categories: categoryCount[0]?.v ?? 0,
    outOfStock: outOfStockCount[0]?.v ?? 0,
    orders: orderCount[0]?.v ?? 0,
  };
}
