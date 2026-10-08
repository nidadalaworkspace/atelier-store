"use server";

import { updateProductStock } from "@/lib/products";
import { requireAdminForAction } from "@/lib/session";
import { revalidatePublic } from "@/app/admin/products/actions";

export type StockRowState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_STOCK = 100_000;

function readString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBool(data: FormData, key: string): boolean {
  const value = data.get(key);
  return value === "on" || value === "true";
}

function echoValues(
  data: FormData,
  madeToOrder: boolean,
): Record<string, string> {
  return {
    stockQuantity: readString(data, "stockQuantity"),
    madeToOrder: madeToOrder ? "on" : "",
  };
}

export async function updateStockAction(
  _prev: StockRowState | undefined,
  formData: FormData,
): Promise<StockRowState> {
  await requireAdminForAction();

  const id = readString(formData, "id");
  const madeToOrder = readBool(formData, "madeToOrder");
  const values = echoValues(formData, madeToOrder);

  if (!uuidPattern.test(id)) {
    return { ok: false, error: "This product no longer exists", values };
  }

  const stockRaw = readString(formData, "stockQuantity");
  const stockQuantity = Number.parseInt(stockRaw, 10);
  const fieldErrors: Record<string, string> = {};

  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    fieldErrors.stockQuantity = "Enter a whole number, zero or more";
  } else if (stockQuantity > MAX_STOCK) {
    fieldErrors.stockQuantity = `Enter a value ${MAX_STOCK.toLocaleString()} or less`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please fix the highlighted field",
      fieldErrors,
      values,
    };
  }

  const result = await updateProductStock(id, { stockQuantity, madeToOrder });
  if (!result.ok) {
    return {
      ok: false,
      error:
        result.error === "not-found"
          ? "This product no longer exists"
          : "Something went wrong — try again",
      values,
    };
  }

  await revalidatePublic([result.slug]);
  return { ok: true, values };
}
