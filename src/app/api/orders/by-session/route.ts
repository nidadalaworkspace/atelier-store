import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

// Thin status probe the /checkout/success pending state polls while it waits
// for the Stripe webhook to write the order row. No Stripe API call here —
// the webhook is the single writer and this endpoint only reflects what has
// already landed in Postgres.

export async function GET(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("id");
  if (!sessionId) {
    return NextResponse.json(
      { status: "pending" as const },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  const row = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripeCheckoutSessionId, sessionId))
    .limit(1);

  return NextResponse.json(
    { status: row[0] ? ("confirmed" as const) : ("pending" as const) },
    { headers: { "cache-control": "private, no-store" } },
  );
}
