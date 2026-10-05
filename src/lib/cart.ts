import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { carts, cartItems, products } from "@/db/schema";
import { getSession } from "@/lib/session";
import type {
  BagLine,
  BagView,
  CartActionResult,
  LineAvailability,
} from "@/lib/cart-types";

type AddInput = {
  productId: string;
  size: string | null;
  quantity: number;
};

type UpdateInput = {
  lineId: string;
  quantity: number;
};

type RemoveInput = {
  lineId: string;
};

async function requireUserId(): Promise<string | null> {
  const session = await getSession();
  return session?.user.id ?? null;
}

async function getOrCreateCart(userId: string): Promise<string> {
  const inserted = await db
    .insert(carts)
    .values({ userId })
    .onConflictDoNothing({ target: carts.userId })
    .returning({ id: carts.id });
  if (inserted[0]) return inserted[0].id;

  const existing = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);
  if (!existing[0]) {
    throw new Error("Cart row vanished between insert and select");
  }
  return existing[0].id;
}

function deriveAvailability(
  madeToOrder: boolean,
  stockQuantity: number,
  quantity: number,
): { availability: LineAvailability; availableNow: number | null } {
  if (madeToOrder) return { availability: "ok", availableNow: null };
  if (stockQuantity <= 0) {
    return { availability: "unavailable", availableNow: 0 };
  }
  if (quantity > stockQuantity) {
    return { availability: "exceeds-stock", availableNow: stockQuantity };
  }
  return { availability: "ok", availableNow: stockQuantity };
}

export async function getBag(): Promise<BagView | null> {
  const userId = await requireUserId();
  if (!userId) return null;

  const cart = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
    with: {
      items: {
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
        orderBy: (line, { asc }) => asc(line.createdAt),
      },
    },
  });

  if (!cart) {
    return { id: "", items: [], subtotalCents: 0, itemCount: 0 };
  }

  const lines: BagLine[] = cart.items.map((line) => {
    const unitCents = line.product.priceCents;
    const lineCents = unitCents * line.quantity;
    const { availability, availableNow } = deriveAvailability(
      line.product.madeToOrder,
      line.product.stockQuantity,
      line.quantity,
    );
    return {
      id: line.id,
      productId: line.product.id,
      slug: line.product.slug,
      name: line.product.name,
      category: line.product.category.name,
      size: line.size,
      quantity: line.quantity,
      unitCents,
      lineCents,
      imageUrl: line.product.images[0]?.url ?? "",
      madeToOrder: line.product.madeToOrder,
      availability,
      availableNow,
    };
  });

  const subtotalCents = lines.reduce((sum, l) => sum + l.lineCents, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { id: cart.id, items: lines, subtotalCents, itemCount };
}

export async function addToBag(input: AddInput): Promise<CartActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "unauthenticated" };

  const { productId, size, quantity } = input;
  if (!productId || !Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "invalid-input" };
  }

  const product = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true, stockQuantity: true, madeToOrder: true },
  });
  if (!product) return { ok: false, error: "not-found" };

  if (!product.madeToOrder && product.stockQuantity <= 0) {
    return { ok: false, error: "out-of-stock", available: 0 };
  }

  const cartId = await getOrCreateCart(userId);

  const existing = await db.query.cartItems.findFirst({
    where: and(
      eq(cartItems.cartId, cartId),
      eq(cartItems.productId, productId),
      size === null ? sql`${cartItems.size} is null` : eq(cartItems.size, size),
    ),
    columns: { id: true, quantity: true },
  });

  const desired = (existing?.quantity ?? 0) + quantity;

  if (!product.madeToOrder && desired > product.stockQuantity) {
    return {
      ok: false,
      error: "exceeds-stock",
      available: product.stockQuantity,
    };
  }

  if (existing) {
    await db
      .update(cartItems)
      .set({ quantity: desired })
      .where(eq(cartItems.id, existing.id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      productId,
      size,
      quantity,
    });
  }

  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, cartId));

  return { ok: true };
}

async function loadLineForUser(lineId: string, userId: string) {
  const line = await db.query.cartItems.findFirst({
    where: eq(cartItems.id, lineId),
    with: {
      cart: { columns: { id: true, userId: true } },
      product: {
        columns: { id: true, stockQuantity: true, madeToOrder: true },
      },
    },
  });
  if (!line) return null;
  if (line.cart.userId !== userId) return null;
  return line;
}

export async function updateQuantity(
  input: UpdateInput,
): Promise<CartActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "unauthenticated" };

  const { lineId, quantity } = input;
  if (!lineId || !Number.isInteger(quantity)) {
    return { ok: false, error: "invalid-input" };
  }

  const line = await loadLineForUser(lineId, userId);
  if (!line) return { ok: false, error: "not-found" };

  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, line.id));
    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, line.cart.id));
    return { ok: true };
  }

  if (!line.product.madeToOrder && quantity > line.product.stockQuantity) {
    return {
      ok: false,
      error: "exceeds-stock",
      available: line.product.stockQuantity,
    };
  }

  await db
    .update(cartItems)
    .set({ quantity })
    .where(eq(cartItems.id, line.id));
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, line.cart.id));

  return { ok: true };
}

export async function removeLine(
  input: RemoveInput,
): Promise<CartActionResult> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: "unauthenticated" };

  const line = await loadLineForUser(input.lineId, userId);
  if (!line) return { ok: false, error: "not-found" };

  await db.delete(cartItems).where(eq(cartItems.id, line.id));
  await db
    .update(carts)
    .set({ updatedAt: new Date() })
    .where(eq(carts.id, line.cart.id));

  return { ok: true };
}
