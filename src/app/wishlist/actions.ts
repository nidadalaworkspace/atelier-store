"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
} from "@/lib/wishlist";
import type { WishlistActionResult } from "@/lib/wishlist-types";

function readString(data: FormData, key: string): string | null {
  const value = data.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

export async function toggleWishlistAction(
  _prev: WishlistActionResult | undefined,
  formData: FormData,
): Promise<WishlistActionResult> {
  const productId = readString(formData, "productId");
  const redirectTo = readString(formData, "redirectTo") ?? "/";
  if (!productId) return { ok: false, error: "invalid-input" };

  const result = await toggleWishlist(productId);
  if (result.ok) {
    revalidatePath("/wishlist");
    return result;
  }
  if (result.error === "unauthenticated") {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return result;
}

export async function removeFromWishlistAction(
  _prev: WishlistActionResult | undefined,
  formData: FormData,
): Promise<WishlistActionResult> {
  const productId = readString(formData, "productId");
  if (!productId) return { ok: false, error: "invalid-input" };

  const result = await removeFromWishlist(productId);
  if (result.ok) revalidatePath("/wishlist");
  return result;
}

export async function addToWishlistAction(
  _prev: WishlistActionResult | undefined,
  formData: FormData,
): Promise<WishlistActionResult> {
  const productId = readString(formData, "productId");
  if (!productId) return { ok: false, error: "invalid-input" };

  const result = await addToWishlist(productId);
  if (result.ok) revalidatePath("/wishlist");
  return result;
}
