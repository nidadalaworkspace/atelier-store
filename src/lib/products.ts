import "server-only";
import { asc, count, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { categories, products } from "@/db/schema";

export type Product = {
  slug: string;
  name: string;
  category: string;
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
  slug: string;
  name: string;
  priceCents: number;
  isNew: boolean;
  category: { name: string };
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
    slug: row.slug,
    name: row.name,
    category: row.category.name,
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

export async function getNewArrivals(limit = 8): Promise<Product[]> {
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
