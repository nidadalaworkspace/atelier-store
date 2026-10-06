import "server-only";
import { asc, count, eq, ilike, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, productImages, products } from "@/db/schema";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  imageUrl: string;
  isNew: boolean;
};

export type ProductDetail = Product & {
  description: string;
  gallery: string[];
  stockQuantity: number;
  madeToOrder: boolean;
  sizes?: string[];
  details: string[];
  materials: string;
  care: string;
  reference: string;
};

export type Collection = {
  slug: string;
  name: string;
  tagline: string;
  pieces: number;
  imageUrl: string;
};

type ProductCardRow = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  isNew: boolean;
  category: { name: string; slug: string };
  images: { url: string }[];
};

type ProductDetailRow = ProductCardRow & {
  description: string;
  materials: string;
  care: string;
  reference: string;
  sizes: string[] | null;
  details: string[];
  stockQuantity: number;
  madeToOrder: boolean;
  images: { url: string; position: number }[];
};

function mapProduct(row: ProductCardRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category.name,
    categorySlug: row.category.slug,
    price: row.priceCents / 100,
    imageUrl: row.images[0]?.url ?? "",
    isNew: row.isNew,
  };
}

function mapProductDetail(row: ProductDetailRow): ProductDetail {
  return {
    ...mapProduct(row),
    description: row.description,
    gallery: row.images.map((i) => i.url),
    stockQuantity: row.stockQuantity,
    madeToOrder: row.madeToOrder,
    sizes: row.sizes ?? undefined,
    details: row.details,
    materials: row.materials,
    care: row.care,
    reference: row.reference,
  };
}

export async function getNewArrivals(limit?: number): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    with: {
      category: true,
      images: {
        where: (image, { eq }) => eq(image.position, 0),
        limit: 1,
      },
    },
    orderBy: (p, { desc }) => desc(p.createdAt),
    limit,
  });
  return rows.map(mapProduct);
}

export async function getCurated(limit = 4, offset = 8): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    with: {
      category: true,
      images: {
        where: (image, { eq }) => eq(image.position, 0),
        limit: 1,
      },
    },
    orderBy: (p, { desc }) => desc(p.createdAt),
    offset,
    limit,
  });
  return rows.map(mapProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.slug, slug),
    with: {
      category: true,
      images: {
        orderBy: (image, { asc }) => asc(image.position),
      },
    },
  });
  return row ? mapProductDetail(row) : null;
}

export async function getRelatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where: (p, { ne }) => ne(p.slug, slug),
    with: {
      category: true,
      images: {
        where: (image, { eq }) => eq(image.position, 0),
        limit: 1,
      },
    },
    orderBy: (p, { desc }) => desc(p.createdAt),
    limit,
  });
  return rows.map(mapProduct);
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  return db.select({ slug: products.slug }).from(products);
}

export async function searchProducts(
  query: string,
  limit = 48,
): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

  const matchingCategoryIds = (
    await db
      .select({ id: categories.id })
      .from(categories)
      .where(or(ilike(categories.name, pattern), ilike(categories.slug, pattern)))
  ).map((r) => r.id);

  const rows = await db.query.products.findMany({
    with: {
      category: true,
      images: {
        where: (image, { eq }) => eq(image.position, 0),
        limit: 1,
      },
    },
    where: (p, { or: orOp, ilike: ilikeOp, inArray }) => {
      const nameMatch = ilikeOp(p.name, pattern);
      const descMatch = ilikeOp(p.description, pattern);
      return matchingCategoryIds.length
        ? orOp(nameMatch, descMatch, inArray(p.categoryId, matchingCategoryIds))
        : orOp(nameMatch, descMatch);
    },
    orderBy: (p, { desc }) => desc(p.createdAt),
    limit,
  });
  return rows.map(mapProduct);
}

export type Category = {
  slug: string;
  name: string;
  tagline: string;
  imageUrl: string | null;
};

export type CategoryWithProducts = {
  category: Category;
  products: Product[];
};

export async function getCategoryBySlug(
  slug: string,
): Promise<CategoryWithProducts | null> {
  const row = await db.query.categories.findFirst({
    where: (c, { eq }) => eq(c.slug, slug),
    with: {
      products: {
        with: {
          category: true,
          images: {
            where: (image, { eq }) => eq(image.position, 0),
            limit: 1,
          },
        },
        orderBy: (p, { desc }) => desc(p.createdAt),
      },
    },
  });
  if (!row) return null;
  return {
    category: {
      slug: row.slug,
      name: row.name,
      tagline: row.tagline ?? "",
      imageUrl: row.imageUrl,
    },
    products: row.products.map(mapProduct),
  };
}

export async function getAllCategorySlugs(): Promise<{ slug: string }[]> {
  return db.select({ slug: categories.slug }).from(categories);
}

// --- Admin --------------------------------------------------------------
// These helpers do no authorization themselves — the caller (an admin route
// or an admin server action) is responsible for having already verified role
// via requireAdmin(). Keep the shape rich: admin surfaces want the raw cents
// value, the full stock pair, and the category name in one trip.

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  stockQuantity: number;
  madeToOrder: boolean;
  isNew: boolean;
  category: { id: string; name: string; slug: string };
  primaryImage: { url: string; alt: string } | null;
  createdAt: Date;
};

export async function listAdminProducts(): Promise<AdminProductRow[]> {
  const rows = await db.query.products.findMany({
    with: {
      category: true,
      images: {
        where: (image, { eq }) => eq(image.position, 0),
        limit: 1,
      },
    },
    orderBy: (p, { desc }) => desc(p.createdAt),
  });

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    priceCents: row.priceCents,
    stockQuantity: row.stockQuantity,
    madeToOrder: row.madeToOrder,
    isNew: row.isNew,
    category: {
      id: row.category.id,
      name: row.category.name,
      slug: row.category.slug,
    },
    primaryImage: row.images[0]
      ? { url: row.images[0].url, alt: row.images[0].alt }
      : null,
    createdAt: row.createdAt,
  }));
}

export type AdminProductImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
};

export type AdminProductDetail = {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  priceCents: number;
  stockQuantity: number;
  madeToOrder: boolean;
  isNew: boolean;
  description: string;
  materials: string;
  care: string;
  reference: string;
  sizes: string[] | null;
  details: string[];
  images: AdminProductImage[];
  categorySlug: string;
  createdAt: Date;
};

export async function getAdminProduct(
  id: string,
): Promise<AdminProductDetail | null> {
  if (!uuidPattern.test(id)) return null;
  const row = await db.query.products.findFirst({
    where: (p, { eq }) => eq(p.id, id),
    with: {
      category: true,
      images: {
        orderBy: (image, { asc }) => asc(image.position),
      },
    },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categoryId: row.categoryId,
    priceCents: row.priceCents,
    stockQuantity: row.stockQuantity,
    madeToOrder: row.madeToOrder,
    isNew: row.isNew,
    description: row.description,
    materials: row.materials,
    care: row.care,
    reference: row.reference,
    sizes: row.sizes,
    details: row.details,
    images: row.images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      position: i.position,
    })),
    categorySlug: row.category.slug,
    createdAt: row.createdAt,
  };
}

export type CategoryOption = { id: string; name: string; slug: string };

export async function listCategoriesForSelect(): Promise<CategoryOption[]> {
  const rows = await db
    .select({ id: categories.id, name: categories.name, slug: categories.slug })
    .from(categories)
    .orderBy(asc(categories.name));
  return rows;
}

// Shape every admin product write accepts — one place, one contract. Prices
// are in cents by the time they reach here (the server action is where the
// dollars→cents conversion happens, next to the other validation).
export type ProductWriteInput = {
  slug: string;
  name: string;
  categoryId: string;
  priceCents: number;
  stockQuantity: number;
  madeToOrder: boolean;
  isNew: boolean;
  description: string;
  materials: string;
  care: string;
  reference: string;
  sizes: string[] | null;
  details: string[];
  primaryImage: { url: string; alt: string };
};

export type ProductWriteResult =
  | { ok: true; id: string; slug: string; previousSlug?: string }
  | {
      ok: false;
      error:
        | "slug-taken"
        | "category-not-found"
        | "not-found"
        | "unknown";
    };

export async function createProduct(
  input: ProductWriteInput,
): Promise<ProductWriteResult> {
  // Pre-generate the id so product + its first image can be written in one
  // db.batch() — the Neon HTTP driver has no interactive transactions, so
  // batched statements are the closest we get to atomic multi-table writes.
  const id = crypto.randomUUID();
  try {
    await db.batch([
      db.insert(products).values({
        id,
        slug: input.slug,
        name: input.name,
        categoryId: input.categoryId,
        priceCents: input.priceCents,
        stockQuantity: input.stockQuantity,
        madeToOrder: input.madeToOrder,
        isNew: input.isNew,
        description: input.description,
        materials: input.materials,
        care: input.care,
        reference: input.reference,
        sizes: input.sizes,
        details: input.details,
      }),
      db.insert(productImages).values({
        productId: id,
        url: input.primaryImage.url,
        alt: input.primaryImage.alt,
        position: 0,
      }),
    ]);
    return { ok: true, id, slug: input.slug };
  } catch (err) {
    return mapWriteError(err);
  }
}

export async function updateProduct(
  id: string,
  input: ProductWriteInput,
): Promise<ProductWriteResult> {
  if (!uuidPattern.test(id)) return { ok: false, error: "not-found" };

  // We need the previous slug so the caller can revalidate the old public
  // product page when the slug changes.
  const existing = await db
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, id))
    .limit(1);
  if (!existing[0]) return { ok: false, error: "not-found" };

  // The primary image row may already exist (edit) or be absent (admin
  // deleted it somehow). Upsert on the (productId, position) unique index.
  try {
    await db.batch([
      db
        .update(products)
        .set({
          slug: input.slug,
          name: input.name,
          categoryId: input.categoryId,
          priceCents: input.priceCents,
          stockQuantity: input.stockQuantity,
          madeToOrder: input.madeToOrder,
          isNew: input.isNew,
          description: input.description,
          materials: input.materials,
          care: input.care,
          reference: input.reference,
          sizes: input.sizes,
          details: input.details,
        })
        .where(eq(products.id, id)),
      db
        .insert(productImages)
        .values({
          productId: id,
          url: input.primaryImage.url,
          alt: input.primaryImage.alt,
          position: 0,
        })
        .onConflictDoUpdate({
          target: [productImages.productId, productImages.position],
          set: {
            url: input.primaryImage.url,
            alt: input.primaryImage.alt,
          },
        }),
    ]);
    return {
      ok: true,
      id,
      slug: input.slug,
      previousSlug: existing[0].slug,
    };
  } catch (err) {
    return mapWriteError(err);
  }
}

export async function deleteProduct(
  id: string,
): Promise<
  | { ok: true; slug: string }
  | { ok: false; error: "not-found" | "unknown" }
> {
  if (!uuidPattern.test(id)) return { ok: false, error: "not-found" };
  try {
    const rows = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ slug: products.slug });
    if (!rows[0]) return { ok: false, error: "not-found" };
    return { ok: true, slug: rows[0].slug };
  } catch {
    return { ok: false, error: "unknown" };
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapWriteError(err: unknown): ProductWriteResult {
  if (!err || typeof err !== "object") {
    return { ok: false, error: "unknown" };
  }
  const anyErr = err as {
    code?: string;
    constraint?: string;
    message?: string;
  };
  if (anyErr.code === "23505") {
    // UNIQUE violation — only one source (products.slug) matters at this layer.
    return { ok: false, error: "slug-taken" };
  }
  if (anyErr.code === "23503") {
    // FK violation — categoryId refers to a row that doesn't exist.
    return { ok: false, error: "category-not-found" };
  }
  // Silence noisy fields but keep the shape useful for logs upstream.
  return { ok: false, error: "unknown" };
}

// --- Public catalogue ----------------------------------------------------

export async function getCollections(): Promise<Collection[]> {
  const rows = await db
    .select({
      slug: categories.slug,
      name: categories.name,
      tagline: categories.tagline,
      imageUrl: categories.imageUrl,
      createdAt: categories.createdAt,
      pieces: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .where(isNotNull(categories.imageUrl))
    .groupBy(categories.id)
    .orderBy(asc(categories.createdAt));

  return rows.map((r) => ({
    slug: r.slug,
    name: r.name,
    tagline: r.tagline ?? "",
    pieces: Number(r.pieces),
    imageUrl: r.imageUrl as string,
  }));
}
