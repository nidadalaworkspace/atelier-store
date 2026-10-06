"use server";

import { redirect } from "next/navigation";
import type Stripe from "stripe";
import { getBag } from "@/lib/cart";
import { requireSession } from "@/lib/session";
import { appUrl, stripe } from "@/lib/stripe";

export type CheckoutActionResult =
  | { ok: false; error: "empty-bag" | "stock-changed" | "session-failed" }
  | { ok: true }; // never actually returned — the server action redirects

// Allowed shipping countries. Stripe's `allowed_countries` enum has no wildcard,
// so this is the explicit set the atelier ships to. Extend as the merchant onboards
// new markets.
const SHIPPING_COUNTRIES = [
  "GB", "US", "CA", "AU", "NZ", "IE", "FR", "DE", "ES", "IT",
  "NL", "BE", "LU", "DK", "SE", "NO", "FI", "AT", "PT", "GR",
  "CH", "PL", "CZ", "HU", "RO", "HR", "SI", "SK", "EE", "LV",
  "LT", "IS", "MT", "CY", "JP", "SG", "HK", "KR", "TW", "AE",
  "SA", "IL", "ZA", "MX", "BR", "AR", "CL", "CO", "PE",
] as const satisfies readonly Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];

export async function startCheckout(): Promise<CheckoutActionResult> {
  const session = await requireSession("/bag");

  // Trusted source of truth. getBag reads live prices from products.priceCents
  // and derives per-line availability from stock_quantity + made_to_order; the
  // browser does not supply either number.
  const bag = await getBag();
  if (!bag || bag.items.length === 0) {
    return { ok: false, error: "empty-bag" };
  }

  const stockOk = bag.items.every((line) => line.availability === "ok");
  if (!stockOk) {
    return { ok: false, error: "stock-changed" };
  }

  const base = appUrl();
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = bag.items.map(
    (line) => ({
      quantity: line.quantity,
      price_data: {
        currency: "gbp",
        unit_amount: line.unitCents,
        product_data: {
          name: line.size ? `${line.name} — Size ${line.size}` : line.name,
          images: line.imageUrl ? [absolutize(base, line.imageUrl)] : undefined,
          metadata: {
            productId: line.productId,
            slug: line.slug,
            size: line.size ?? "",
          },
        },
      },
    }),
  );

  let checkout: Stripe.Checkout.Session;
  try {
    checkout = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        cartId: bag.id,
      },
      shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
      success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/bag?checkout=cancelled`,
    });
  } catch (err) {
    console.error("[startCheckout] Stripe session create failed", err);
    return { ok: false, error: "session-failed" };
  }

  if (!checkout.url) {
    return { ok: false, error: "session-failed" };
  }

  redirect(checkout.url);
}

function absolutize(base: string, maybeRelative: string): string {
  if (/^https?:\/\//i.test(maybeRelative)) return maybeRelative;
  return `${base}${maybeRelative.startsWith("/") ? "" : "/"}${maybeRelative}`;
}
