import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems, products } from "@/db/schema";
import { getSession } from "@/lib/session";
import type { WishlistActionResult } from "@/lib/wishlist-types";
import type { Product } from "@/lib/products";

async function requireUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}

export async function getWishlist(): Promise<Product[]> {
  const userId = await requireUserId();
  if (!userId) return [];

  const rows = await db.query.wishlistItems.findMany({
    where: eq(wishlistItems.userId, userId),
    orderBy: (w, { desc }) => desc(w.createdAt),
    with: {
      product: {
        with: {
          category: true,
          images: {
            where: (image, { eq: eqOp }) => eqOp(image.position, 0),
            limit: 1,
          },
        },
      },
    },
  });

  return rows.map((row) => ({
    id: row.product.id,
    slug: row.product.slug,
    name: row.product.name,
    category: row.product.category.name,
    categorySlug: row.product.category.slug,
    price: row.product.priceCents / 100,
    imageUrl: row.product.images[0]?.url ?? "",
    isNew: row.product.isNew,
    stockQuantity: row.product.stockQuantity,
    madeToOrder: row.product.madeToOrder,
  }));
}

export async function getWishlistProductIds(): Promise<string[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId));
  return rows.map((r) => r.productId);
}

export async function addToWishlist(
  productId: string,
): Promise<WishlistActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "unauthenticated" };
  if (!productId) return { ok: false, error: "invalid-input" };

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true },
  });
  if (!product) return { ok: false, error: "not-found" };

  await db
    .insert(wishlistItems)
    .values({ userId, productId })
    .onConflictDoNothing({
      target: [wishlistItems.userId, wishlistItems.productId],
    });

  return { ok: true, inWishlist: true };
}

export async function removeFromWishlist(
  productId: string,
): Promise<WishlistActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "unauthenticated" };
  if (!productId) return { ok: false, error: "invalid-input" };

  await db
    .delete(wishlistItems)
    .where(
      and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId),
      ),
    );

  return { ok: true, inWishlist: false };
}

export async function toggleWishlist(
  productId: string,
): Promise<WishlistActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "unauthenticated" };
  if (!productId) return { ok: false, error: "invalid-input" };

  const existing = await db.query.wishlistItems.findFirst({
    where: and(
      eq(wishlistItems.userId, userId),
      eq(wishlistItems.productId, productId),
    ),
    columns: { id: true },
  });

  if (existing) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing.id));
    return { ok: true, inWishlist: false };
  }

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true },
  });
  if (!product) return { ok: false, error: "not-found" };

  await db.insert(wishlistItems).values({ userId, productId });
  return { ok: true, inWishlist: true };
}
