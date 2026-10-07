import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getSession } from "@/lib/session";

// Thin status probe the /checkout/success pending state polls while it waits
// for the Stripe webhook to write the order row. No Stripe API call here —
// the webhook is the single writer and this endpoint only reflects what has
// already landed in Postgres.
//
// Scoped to the signed-in user: anonymous callers and callers whose session
// does not own the row behind this session_id both see {status: "pending"}.
// That keeps the endpoint from acting as an existence oracle for anyone with
// a session id in hand.

export async function GET(request: Request): Promise<Response> {
  const sessionId = new URL(request.url).searchParams.get("id");
  if (!sessionId) {
    return NextResponse.json(
      { status: "pending" as const },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { status: "pending" as const },
      { headers: { "cache-control": "private, no-store" } },
    );
  }

  const row = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      and(
        eq(orders.stripeCheckoutSessionId, sessionId),
        eq(orders.userId, session.user.id),
      ),
    )
    .limit(1);

  return NextResponse.json(
    { status: row[0] ? ("confirmed" as const) : ("pending" as const) },
    { headers: { "cache-control": "private, no-store" } },
  );
}
