import "server-only";
import { asc, count, eq, ilike, isNotNull, or } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

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
