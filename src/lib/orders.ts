import "server-only";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import type Stripe from "stripe";
import { db } from "@/db";
import {
  carts,
  cartItems,
  orders,
  orderItems,
  products,
} from "@/db/schema";
import { stripe } from "@/lib/stripe";

export type OrderStatus = "paid" | "processing" | "failed";

export type OrderSummary = {
  id: string;
  createdAt: Date;
  status: OrderStatus;
  currency: string;
  amountTotalCents: number;
  itemCount: number;
  previewImageUrl: string | null;
};

export type OrderDetailItem = {
  id: string;
  productSlug: string;
  productName: string;
  size: string | null;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
  imageUrl: string | null;
};

export type OrderDetail = {
  id: string;
  createdAt: Date;
  status: OrderStatus;
  email: string;
  currency: string;
  amountSubtotalCents: number;
  amountShippingCents: number;
  amountTotalCents: number;
  shippingName: string | null;
  shippingLine1: string | null;
  shippingLine2: string | null;
  shippingCity: string | null;
  shippingPostalCode: string | null;
  shippingState: string | null;
  shippingCountry: string | null;
  items: OrderDetailItem[];
};

// List a user's orders newest-first for the account history view.
// Each row carries the first item's image as a visual anchor and a count so
// the list can read as "N pieces" without a second query.
export async function listUserOrders(userId: string): Promise<OrderSummary[]> {
  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    orderBy: [desc(orders.createdAt)],
    with: {
      items: {
        columns: { id: true, quantity: true, imageUrl: true },
        // Stable id order so the preview image doesn't flicker between renders;
        // Drizzle's relational findMany returns an undefined order without this.
        orderBy: (item, { asc }) => asc(item.id),
      },
    },
  });

  return rows.map((row) => {
    const itemCount = row.items.reduce((sum, item) => sum + item.quantity, 0);
    const previewImageUrl =
      row.items.find((item) => item.imageUrl)?.imageUrl ?? null;
    return {
      id: row.id,
      createdAt: row.createdAt,
      status: row.status as OrderStatus,
      currency: row.currency,
      amountTotalCents: row.amountTotalCents,
      itemCount,
      previewImageUrl,
    };
  });
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Load the order written for a given Stripe Checkout Session, scoped to the
// requesting user. The success page uses this: it must not render order PII
// (email, shipping, totals) for a session that belongs to someone else. The
// three return states let the caller distinguish:
//   null                — no row yet; webhook probably still in flight → pending
//   { kind: "foreign" } — row exists but belongs to another user → generic view
//   { kind: "owned", order } — the signed-in user's own receipt → full view
export type OrderBySessionResult =
  | null
  | { kind: "foreign" }
  | { kind: "owned"; order: OrderDetail };

export async function getOrderBySessionIdForUser(
  sessionId: string,
  userId: string,
): Promise<OrderBySessionResult> {
  const row = await db.query.orders.findFirst({
    where: eq(orders.stripeCheckoutSessionId, sessionId),
    with: {
      items: {
        orderBy: (item, { asc }) => asc(item.id),
      },
    },
  });
  if (!row) return null;
  if (row.userId !== userId) return { kind: "foreign" };
  return {
    kind: "owned",
    order: {
      id: row.id,
      createdAt: row.createdAt,
      status: row.status as OrderStatus,
      email: row.email,
      currency: row.currency,
      amountSubtotalCents: row.amountSubtotalCents,
      amountShippingCents: row.amountShippingCents,
      amountTotalCents: row.amountTotalCents,
      shippingName: row.shippingName,
      shippingLine1: row.shippingLine1,
      shippingLine2: row.shippingLine2,
      shippingCity: row.shippingCity,
      shippingPostalCode: row.shippingPostalCode,
      shippingState: row.shippingState,
      shippingCountry: row.shippingCountry,
      items: row.items.map((item) => ({
        id: item.id,
        productSlug: item.productSlug,
        productName: item.productName,
        size: item.size,
        quantity: item.quantity,
        unitAmountCents: item.unitAmountCents,
        amountCents: item.amountCents,
        imageUrl: item.imageUrl,
      })),
    },
  };
}

// Load one order, scoped to the owning user — a wrong id or another user's id
// resolves to null so the route can 404 without leaking which case it was.
export async function getUserOrder(
  userId: string,
  orderId: string,
): Promise<OrderDetail | null> {
  if (!uuidPattern.test(orderId)) return null;
  const row = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.userId, userId)),
    with: { items: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    createdAt: row.createdAt,
    status: row.status as OrderStatus,
    email: row.email,
    currency: row.currency,
    amountSubtotalCents: row.amountSubtotalCents,
    amountShippingCents: row.amountShippingCents,
    amountTotalCents: row.amountTotalCents,
    shippingName: row.shippingName,
    shippingLine1: row.shippingLine1,
    shippingLine2: row.shippingLine2,
    shippingCity: row.shippingCity,
    shippingPostalCode: row.shippingPostalCode,
    shippingState: row.shippingState,
    shippingCountry: row.shippingCountry,
    items: row.items.map((item) => ({
      id: item.id,
      productSlug: item.productSlug,
      productName: item.productName,
      size: item.size,
      quantity: item.quantity,
      unitAmountCents: item.unitAmountCents,
      amountCents: item.amountCents,
      imageUrl: item.imageUrl,
    })),
  };
}

type ItemRow = {
  orderId: string;
  productId: string | null;
  productSlug: string;
  productName: string;
  size: string | null;
  quantity: number;
  unitAmountCents: number;
  amountCents: number;
  imageUrl: string | null;
};

// The webhook is the single writer of orders. This function is idempotent through
// the orders.stripe_checkout_session_id UNIQUE constraint — the pre-check SELECT
// is only a fast path. Stripe retries on non-2xx, and the handler is also allowed
// to redeliver, so the UNIQUE violation path must succeed quietly.
export async function fulfillCheckoutSession(sessionId: string): Promise<void> {
  const existing = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId))
    .limit(1);
  if (existing[0]) return;

  const session = await stripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items.data.price.product", "payment_intent"],
  });

  // The webhook route already filters, but double-guard — never write an order
  // from a session whose payment hasn't actually cleared.
  if (session.payment_status === "unpaid") return;

  const userId = session.metadata?.userId ?? session.client_reference_id;
  if (!userId) {
    throw new Error(
      `fulfillCheckoutSession: session ${sessionId} has no userId in metadata or client_reference_id`,
    );
  }

  const lineItems = session.line_items?.data ?? [];
  if (lineItems.length === 0) {
    throw new Error(`fulfillCheckoutSession: session ${sessionId} has no line items`);
  }

  const orderId = crypto.randomUUID();
  const itemRows: ItemRow[] = lineItems.map((li) => {
    const product = resolveProduct(li.price?.product);
    const meta = product?.metadata ?? {};
    const productId = typeof meta.productId === "string" ? meta.productId : null;
    const sizeMeta = typeof meta.size === "string" && meta.size.length > 0 ? meta.size : null;
    const slug = typeof meta.slug === "string" ? meta.slug : "";
    return {
      orderId,
      productId,
      productSlug: slug,
      productName: product?.name ?? li.description ?? "",
      size: sizeMeta,
      quantity: li.quantity ?? 1,
      unitAmountCents: li.price?.unit_amount ?? 0,
      amountCents: li.amount_total,
      imageUrl: product?.images?.[0] ?? null,
    };
  });

  // Look up madeToOrder for every item that still points at a catalogue row,
  // so stock decrements skip MTO pieces and avoid updating a vanished product.
  const productIds = itemRows
    .map((i) => i.productId)
    .filter((id): id is string => id !== null);
  const productRows = productIds.length
    ? await db
        .select({
          id: products.id,
          madeToOrder: products.madeToOrder,
        })
        .from(products)
        .where(inArray(products.id, productIds))
    : [];
  const productFlags = new Map(productRows.map((p) => [p.id, p.madeToOrder]));

  const cart = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .limit(1);
  const cartId = cart[0]?.id ?? null;

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : (session.payment_intent?.id ?? null);

  const shipping = session.collected_information?.shipping_details ?? null;
  const email =
    session.customer_details?.email ?? session.customer_email ?? "";

  // Derive from Stripe's own signal rather than hard-coding "paid". The
  // webhook route already short-circuits `payment_status === "unpaid"` before
  // we get here, so in practice we only see `paid` (card-like) or
  // `no_payment_required` (zero-amount sessions). Both are terminal success
  // states on the session, so both become "paid"; any future async-settlement
  // outcome that reaches us will land here instead of being silently stamped.
  const orderStatus: OrderStatus = deriveOrderStatus(session.payment_status);

  const statements: unknown[] = [
    db.insert(orders).values({
      id: orderId,
      userId,
      stripeCheckoutSessionId: session.id,
      stripePaymentIntentId: paymentIntentId,
      status: orderStatus,
      email,
      currency: session.currency ?? "gbp",
      amountSubtotalCents: session.amount_subtotal ?? 0,
      amountShippingCents: session.shipping_cost?.amount_total ?? 0,
      amountTotalCents: session.amount_total ?? 0,
      shippingName: shipping?.name ?? null,
      shippingLine1: shipping?.address?.line1 ?? null,
      shippingLine2: shipping?.address?.line2 ?? null,
      shippingCity: shipping?.address?.city ?? null,
      shippingPostalCode: shipping?.address?.postal_code ?? null,
      shippingState: shipping?.address?.state ?? null,
      shippingCountry: shipping?.address?.country ?? null,
    }),
    db.insert(orderItems).values(itemRows),
  ];

  for (const item of itemRows) {
    if (!item.productId) continue;
    const madeToOrder = productFlags.get(item.productId);
    if (madeToOrder !== false) continue; // undefined = product deleted; true = MTO
    statements.push(
      db
        .update(products)
        .set({
          stockQuantity: sql`greatest(${products.stockQuantity} - ${item.quantity}, 0)`,
        })
        .where(eq(products.id, item.productId)),
    );
  }

  if (cartId) {
    statements.push(db.delete(cartItems).where(eq(cartItems.cartId, cartId)));
  }

  try {
    await db.batch(
      statements as unknown as Parameters<typeof db.batch>[0],
    );
  } catch (err) {
    if (isUniqueViolation(err, "orders_stripe_checkout_session_id_unique")) {
      // Stripe redelivered between our SELECT and INSERT. The row is there.
      return;
    }
    throw err;
  }
}

function deriveOrderStatus(
  paymentStatus: Stripe.Checkout.Session["payment_status"],
): OrderStatus {
  switch (paymentStatus) {
    case "paid":
    case "no_payment_required":
      return "paid";
    default:
      // The webhook filters `unpaid` out before calling, so this branch is
      // only reachable if Stripe adds a new payment_status enum value. Treat
      // it as paid to preserve current behaviour rather than silently drop
      // the fulfilment on the floor — but warn loudly so a new enum shows up
      // in logs instead of silently being stamped as "paid".
      console.warn(
        `[fulfillCheckoutSession] unknown Stripe payment_status "${paymentStatus}" — defaulting to "paid"`,
      );
      return "paid";
  }
}

function resolveProduct(
  price: Stripe.Price["product"] | undefined,
): Stripe.Product | null {
  if (!price) return null;
  if (typeof price === "string") return null;
  if (price.deleted) return null;
  return price;
}

function isUniqueViolation(err: unknown, constraint: string): boolean {
  if (!err || typeof err !== "object") return false;
  const anyErr = err as {
    code?: string;
    constraint?: string;
    message?: string;
    detail?: string;
  };
  // SQLSTATE 23505 is the authoritative unique-violation signal. Everything
  // else is a shape probe: Drizzle may change the constraint name it uses, and
  // the error object's `message`/`detail` wording varies by driver, so we
  // accept any of three fingerprints as long as 23505 is set.
  if (anyErr.code !== "23505") return false;
  if (anyErr.constraint === constraint) return true;
  const column = "stripe_checkout_session_id";
  if (typeof anyErr.detail === "string" && anyErr.detail.includes(column)) {
    return true;
  }
  if (typeof anyErr.message === "string") {
    if (anyErr.message.includes(constraint)) return true;
    if (anyErr.message.includes(column)) return true;
  }
  return false;
}

// Mark an existing order row as failed when Stripe tells us an async payment
// method (bank debit, redirect, etc.) ultimately didn't clear. We only ever
// insert orders on success, so a missing row is the common case — treat it as
// a no-op rather than back-filling a failed order from thin air.
export async function markCheckoutSessionFailed(
  sessionId: string,
): Promise<void> {
  await db
    .update(orders)
    .set({ status: "failed" })
    .where(eq(orders.stripeCheckoutSessionId, sessionId));
}
