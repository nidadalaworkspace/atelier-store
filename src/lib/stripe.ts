import "server-only";
import Stripe from "stripe";

let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Add it to .env (restricted rk_test_... key with Checkout + webhook scopes).",
    );
  }
  cached = new Stripe(key);
  return cached;
}

export function webhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is not set. From `stripe listen` output locally, or the endpoint's signing secret in production.",
    );
  }
  return secret;
}

export function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (!url) {
    throw new Error(
      "NEXT_PUBLIC_APP_URL is not set — needed for Stripe success_url / cancel_url.",
    );
  }
  return url.replace(/\/$/, "");
}
