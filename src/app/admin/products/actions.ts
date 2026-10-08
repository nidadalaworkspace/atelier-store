"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductWriteInput,
  type ProductWriteResult,
} from "@/lib/products";
import { requireAdmin } from "@/lib/session";

export type ProductFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const urlPattern = /^https?:\/\/\S+$/i;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readString(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function readBool(data: FormData, key: string): boolean {
  const value = data.get(key);
  return value === "on" || value === "true";
}

// Splits a textarea into trimmed, non-empty lines so admins can enter one
// detail or size per line without worrying about leading/trailing whitespace.
function readLines(data: FormData, key: string): string[] {
  const raw = data.get(key);
  if (typeof raw !== "string") return [];
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function readCsv(data: FormData, key: string): string[] {
  const raw = data.get(key);
  if (typeof raw !== "string") return [];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

type ParseOk = { ok: true; input: ProductWriteInput };
type ParseErr = { ok: false; fieldErrors: Record<string, string> };

function parseProductForm(data: FormData): ParseOk | ParseErr {
  const fieldErrors: Record<string, string> = {};

  const name = readString(data, "name");
  const slug = readString(data, "slug").toLowerCase();
  const categoryId = readString(data, "categoryId");
  const priceRaw = readString(data, "priceDollars");
  const stockRaw = readString(data, "stockQuantity");
  const description = readString(data, "description");
  const materials = readString(data, "materials");
  const care = readString(data, "care");
  const reference = readString(data, "reference");
  const imageUrl = readString(data, "imageUrl");
  const imageAlt = readString(data, "imageAlt");

  if (!name) fieldErrors.name = "Name is required";
  if (!slug) {
    fieldErrors.slug = "Slug is required";
  } else if (!slugPattern.test(slug)) {
    fieldErrors.slug = "Lowercase letters, numbers and dashes only";
  }
  if (!categoryId) {
    fieldErrors.categoryId = "Pick a category";
  } else if (!uuidPattern.test(categoryId)) {
    fieldErrors.categoryId = "Unknown category";
  }
  if (!description) fieldErrors.description = "Description is required";
  if (!materials) fieldErrors.materials = "Materials copy is required";
  if (!care) fieldErrors.care = "Care copy is required";
  if (!reference) fieldErrors.reference = "Reference is required";
  if (!imageUrl) {
    fieldErrors.imageUrl = "A primary image URL is required";
  } else if (!urlPattern.test(imageUrl)) {
    fieldErrors.imageUrl = "Must be a full http:// or https:// URL";
  }
  if (!imageAlt) fieldErrors.imageAlt = "Alt text is required";

  const priceDollars = Number.parseFloat(priceRaw);
  if (!Number.isFinite(priceDollars) || priceDollars <= 0) {
    fieldErrors.priceDollars = "Enter a price greater than zero";
  }

  const stockQuantity = Number.parseInt(stockRaw, 10);
  if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
    fieldErrors.stockQuantity = "Enter a whole number, zero or more";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  // MTO pieces never carry stock — the webhook decrement skips them, so a
  // non-zero quantity would silently persist. Normalise server-side so a stale
  // client can't bypass the UI's disabled input.
  const madeToOrder = readBool(data, "madeToOrder");

  return {
    ok: true,
    input: {
      slug,
      name,
      categoryId,
      // Price arrives as decimal pounds; store as integer pence. Rounding is
      // defensive — the browser's step="0.01" should prevent fractions.
      priceCents: Math.round(priceDollars * 100),
      stockQuantity: madeToOrder ? 0 : stockQuantity,
      madeToOrder,
      isNew: readBool(data, "isNew"),
      description,
      materials,
      care,
      reference,
      sizes: (() => {
        const list = readCsv(data, "sizes");
        return list.length > 0 ? list : null;
      })(),
      details: readLines(data, "details"),
      primaryImage: { url: imageUrl, alt: imageAlt },
    },
  };
}

// Pulls every raw form value back into state so a failed submission re-renders
// the form with whatever the admin typed instead of losing it.
function echoValues(data: FormData): Record<string, string> {
  const keys = [
    "name",
    "slug",
    "categoryId",
    "priceDollars",
    "stockQuantity",
    "description",
    "materials",
    "care",
    "reference",
    "sizes",
    "details",
    "imageUrl",
    "imageAlt",
  ] as const;
  const out: Record<string, string> = {};
  for (const key of keys) {
    const v = data.get(key);
    if (typeof v === "string") out[key] = v;
  }
  out.madeToOrder = readBool(data, "madeToOrder") ? "on" : "";
  out.isNew = readBool(data, "isNew") ? "on" : "";
  return out;
}

export async function revalidatePublic(slugs: Array<string | undefined>) {
  revalidatePath("/admin/products");
  revalidatePath("/admin/stock");
  revalidatePath("/");
  revalidatePath("/new-arrivals");
  revalidatePath("/collections/[slug]", "page");
  // Revalidate the specific product page(s) touched so cache clears without
  // waiting for the ISR window.
  for (const slug of slugs) {
    if (slug) revalidatePath(`/products/${slug}`);
  }
}

function mapWriteError(result: Extract<ProductWriteResult, { ok: false }>): {
  error?: string;
  fieldErrors?: Record<string, string>;
} {
  switch (result.error) {
    case "slug-taken":
      return { fieldErrors: { slug: "This slug is already taken" } };
    case "category-not-found":
      return { fieldErrors: { categoryId: "That category no longer exists" } };
    case "not-found":
      return { error: "This product no longer exists" };
    case "unknown":
      return { error: "Something went wrong — try again" };
  }
}

export async function createProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin("/admin/products");

  const parsed = parseProductForm(formData);
  if (!parsed.ok) {
    return {
      ok: false,
      error: "Please fix the highlighted fields",
      fieldErrors: parsed.fieldErrors,
      values: echoValues(formData),
    };
  }

  const result = await createProduct(parsed.input);
  if (!result.ok) {
    return {
      ok: false,
      ...mapWriteError(result),
      values: echoValues(formData),
    };
  }

  await revalidatePublic([result.slug]);
  // redirect() returns `never`; `return`ing it keeps the function's declared
  // ProductFormState shape honest for any caller or future refactor that
  // forgets the success path is terminal.
  return redirect(`/admin/products/${result.id}?created=1`);
}

export async function updateProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  await requireAdmin("/admin/products");

  const id = readString(formData, "id");
  if (!uuidPattern.test(id)) {
    return { ok: false, error: "This product no longer exists" };
  }

  const parsed = parseProductForm(formData);
  if (!parsed.ok) {
    return {
      ok: false,
      error: "Please fix the highlighted fields",
      fieldErrors: parsed.fieldErrors,
      values: echoValues(formData),
    };
  }

  const result = await updateProduct(id, parsed.input);
  if (!result.ok) {
    return {
      ok: false,
      ...mapWriteError(result),
      values: echoValues(formData),
    };
  }

  await revalidatePublic([result.slug, result.previousSlug]);
  return { ok: true, values: echoValues(formData) };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  await requireAdmin("/admin/products");

  // Sentinel field set by DeleteProductButton after a native confirm() prompt.
  // A cross-origin form POST will not carry this, so we refuse the action
  // rather than destructively deleting on a drive-by submit.
  if (readString(formData, "confirm") !== "yes") {
    redirect("/admin/products");
  }

  const id = readString(formData, "id");
  if (!uuidPattern.test(id)) {
    redirect("/admin/products");
  }

  const result = await deleteProduct(id);
  await revalidatePublic([result.ok ? result.slug : undefined]);
  redirect("/admin/products");
}
