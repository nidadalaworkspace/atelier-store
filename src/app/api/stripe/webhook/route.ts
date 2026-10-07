import type Stripe from "stripe";
import {
  fulfillCheckoutSession,
  markCheckoutSessionFailed,
} from "@/lib/orders";
import { stripe, webhookSecret } from "@/lib/stripe";

// Signature verification uses the raw request bytes, so Node runtime is required
// — the Edge runtime streams a mangled body that fails Stripe's HMAC check.
export const runtime = "nodejs";

// The success page is a read-only view; this handler is the only path that
// turns a Stripe payment into an order row. If this file does not run, no
// order exists — a browser landing on /checkout/success will never flip state.
export async function POST(request: Request): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("missing stripe-signature header", { status: 400 });
  }

  // Resolve the signing secret before entering the verification try/catch so a
  // missing env surfaces as a 500 instead of a misleading "invalid signature".
  const secret = webhookSecret();
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return new Response("invalid signature", { status: 400 });
  }

  // Scope: our Checkout flow only cares about confirmed payment on a Session.
  //   - `checkout.session.completed` fires immediately for card-like methods.
  //   - `checkout.session.async_payment_succeeded` fires later for delayed
  //     settlement (bank debits, redirects, etc) that Checkout enables via
  //     dynamic payment methods.
  // Both deliver the same Checkout.Session shape, both are dedup'd by the
  // orders.stripe_checkout_session_id UNIQUE constraint inside
  // fulfillCheckoutSession(), so repeat deliveries are safe.
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status === "unpaid") break;
        await fulfillCheckoutSession(session.id);
        break;
      }
      case "checkout.session.async_payment_failed": {
        // Delayed-settlement methods (bank debits, redirects) can land here
        // after the session completed with payment_status=unpaid. We only
        // insert order rows on success, so the common case is "no row yet";
        // markCheckoutSessionFailed is a no-op when nothing matches.
        const session = event.data.object;
        await markCheckoutSessionFailed(session.id);
        break;
      }
      default:
        // Any other event type is outside the current checkout flow — no state
        // update, acknowledge with 200 so Stripe stops retrying it.
        break;
    }
  } catch (err) {
    // Returning a non-2xx tells Stripe to retry. Transient DB or Stripe retrieve
    // failures recover on the next delivery, and the UNIQUE constraint ensures
    // the eventual retry writes exactly one order row for the session.
    console.error(`[stripe webhook] handler failed for ${event.type}`, err);
    return new Response("handler error", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
