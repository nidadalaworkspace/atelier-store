"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addToBag, removeLine, updateQuantity } from "@/lib/cart";
import type { CartActionResult } from "@/lib/cart-types";

function readString(data: FormData, key: string): string | null {
  const value = data.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readInt(data: FormData, key: string, fallback: number): number {
  const value = data.get(key);
  if (typeof value !== "string") return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function addToBagAction(
  _prev: CartActionResult | undefined,
  formData: FormData,
): Promise<CartActionResult> {
  const productId = readString(formData, "productId");
  const size = readString(formData, "size");
  const quantity = readInt(formData, "quantity", 1);
  const redirectTo = readString(formData, "redirectTo") ?? "/";
  if (!productId) return { ok: false, error: "invalid-input" };

  const result = await addToBag({ productId, size, quantity });
  if (result.ok) {
    revalidatePath("/bag");
    return result;
  }
  if (result.error === "unauthenticated") {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return result;
}

export async function updateQuantityAction(
  _prev: CartActionResult | undefined,
  formData: FormData,
): Promise<CartActionResult> {
  const lineId = readString(formData, "lineId");
  const quantity = readInt(formData, "quantity", Number.NaN);
  if (!lineId || !Number.isInteger(quantity)) {
    return { ok: false, error: "invalid-input" };
  }

  const result = await updateQuantity({ lineId, quantity });
  if (result.ok) revalidatePath("/bag");
  return result;
}

export async function removeLineAction(
  _prev: CartActionResult | undefined,
  formData: FormData,
): Promise<CartActionResult> {
  const lineId = readString(formData, "lineId");
  if (!lineId) return { ok: false, error: "invalid-input" };

  const result = await removeLine({ lineId });
  if (result.ok) revalidatePath("/bag");
  return result;
}
