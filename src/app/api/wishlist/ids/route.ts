import { NextResponse } from "next/server";
import { getWishlistProductIds } from "@/lib/wishlist";

// Client WishlistButton calls this once on mount to decide whether to render
// as filled or hollow. Keeping this on an API route (rather than a server
// prop) means catalogue pages stay static — no headers() read at render.

export async function GET() {
  const ids = await getWishlistProductIds();
  return NextResponse.json(
    { ids },
    { headers: { "cache-control": "private, no-store" } },
  );
}
