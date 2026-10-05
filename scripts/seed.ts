import { db } from "../src/db";
import { categories, products, productImages } from "../src/db/schema";

const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

type CategorySeed = {
  slug: string;
  name: string;
  tagline?: string;
  imageUrl?: string;
};

// Strip-eligible categories — shown on homepage FeaturedCollections (imageUrl set).
// Order here = display order on the strip (seeded with ascending createdAt).
const stripCategories: CategorySeed[] = [
  {
    slug: "soft-tailoring",
    name: "The Soft Tailoring Edit",
    tagline: "Unstructured jackets, wide trousers.",
    imageUrl: u("photo-1490481651871-ab68de25d43d", 1000),
  },
  {
    slug: "leather-and-craft",
    name: "Leather & Craft",
    tagline: "Vegetable-tanned, numbered editions.",
    imageUrl: u("photo-1591561954557-26941169b49e", 1000),
  },
  {
    slug: "objects-for-the-home",
    name: "Objects for the Home",
    tagline: "Hand-thrown ceramics and linen.",
    imageUrl: u("photo-1526170375885-4d8ecf77b99f", 1000),
  },
  {
    slug: "fine-jewellery",
    name: "Fine Jewellery",
    tagline: "Solid gold, understated.",
    imageUrl: u("photo-1515562141207-7a88fb7ce338", 1000),
  },
];

// Product-level categories — used as the card label only (no imageUrl).
const labelCategories: CategorySeed[] = [
  { slug: "outerwear", name: "Outerwear" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "tailoring", name: "Tailoring" },
  { slug: "bags", name: "Bags" },
  { slug: "accessories", name: "Accessories" },
  { slug: "footwear", name: "Footwear" },
  { slug: "shirting", name: "Shirting" },
  { slug: "jewellery", name: "Jewellery" },
  { slug: "leather", name: "Leather" },
  { slug: "eyewear", name: "Eyewear" },
  { slug: "travel", name: "Travel" },
];

type ProductSeed = {
  slug: string;
  name: string;
  categorySlug: string;
  priceCents: number;
  isNew: boolean;
  description: string;
  materials: string;
  care: string;
  reference: string;
  sizes?: string[];
  details: string[];
  stockQuantity: number;
  madeToOrder: boolean;
  images: { url: string; alt: string }[];
};

const DEFAULT_DETAILS = [
  "Hand-finished in Italy",
  "Produced in a numbered edition",
  "Carries the maker's mark on the inside seam",
];
const DEFAULT_MATERIALS = "Specified on the inside label.";
const DEFAULT_CARE = "Professional care is recommended.";
const DEFAULT_STOCK = 6;

const defaultReference = (slug: string) =>
  `ATL-${slug.replace(/-/g, "").toUpperCase().slice(0, 8)}`;

const defaultDescription = (name: string, categoryName: string) =>
  `${name} — a considered ${categoryName.toLowerCase()} piece, hand-finished in our atelier in Como and shipped in limited numbers.`;

// Products in homepage display order. Position 0 = newest = first card on the
// new-arrivals grid; positions 0..7 are the "New Arrivals" grid, 8..11 the
// "Curated Edit" rail. Seeded with descending createdAt matching this order.
const productSeeds: ProductSeed[] = [
  {
    slug: "boucle-coat-ecru",
    name: "Bouclé Coat",
    categorySlug: "outerwear",
    priceCents: 129000,
    isNew: true,
    description:
      "An unlined bouclé coat with a relaxed drop-shoulder and single horn button at the throat. Cut from an Italian wool-and-mohair blend woven on vintage shuttle looms, it holds its shape without stiffness and softens with wear.",
    materials: "72% virgin wool, 28% kid mohair. Shell woven in Biella.",
    care: "Dry clean only. Store on a wide-shoulder hanger.",
    reference: "ATL-BC-ECR-01",
    sizes: ["XS", "S", "M", "L", "XL"],
    details: [
      "Drop-shoulder, unlined construction",
      "Single horn button closure at the throat",
      "Welt pockets at the hip",
      "Made in Como, Italy — numbered edition of 180",
    ],
    stockQuantity: 7,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1544022613-e87ca75a784a", 1600),
        alt: "Bouclé Coat — Outerwear",
      },
      {
        url: u("photo-1591047139829-d91aecb6caea", 1600),
        alt: "Bouclé Coat — detail",
      },
      {
        url: u("photo-1551232864-3f0890e580d9", 1600),
        alt: "Bouclé Coat — styled",
      },
    ],
  },
  {
    slug: "merino-rib-sweater",
    name: "Merino Rib Sweater",
    categorySlug: "knitwear",
    priceCents: 34500,
    isNew: true,
    description:
      "A fine-gauge rib sweater knitted from extra-fine Australian merino. Cut long in the body with a slim crew — a quiet, essential layer.",
    materials: "100% extra-fine Australian merino wool.",
    care: "Hand wash cold with wool shampoo. Dry flat.",
    reference: "ATL-MR-STO-04",
    sizes: ["XS", "S", "M", "L", "XL"],
    details: [
      "Extra-fine 18.5 micron merino",
      "Fully fashioned on hand-flat knitting machines",
      "Made to order in editions as needed",
    ],
    stockQuantity: 0,
    madeToOrder: true,
    images: [
      {
        url: u("photo-1618354691373-d851c5c3a990", 900),
        alt: "Merino Rib Sweater — Knitwear",
      },
    ],
  },
  {
    slug: "wide-leg-trouser-ink",
    name: "Wide-Leg Trouser",
    categorySlug: "tailoring",
    priceCents: 45000,
    isNew: false,
    description: defaultDescription("Wide-Leg Trouser", "Tailoring"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("wide-leg-trouser-ink"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1594938298603-c8148c4dae35", 900),
        alt: "Wide-Leg Trouser — Tailoring",
      },
    ],
  },
  {
    slug: "leather-tote-cognac",
    name: "Soft Leather Tote",
    categorySlug: "bags",
    priceCents: 165000,
    isNew: true,
    description:
      "A soft, unstructured tote in vegetable-tanned calfskin that gains character with every carry. Hand-cut in panels and saddle-stitched by a single artisan, each bag carries their initials inside the lining.",
    materials: "100% Tuscan calf leather. Solid brass hardware.",
    care: "Condition with neutral leather balm twice a year.",
    reference: "ATL-LT-COG-02",
    details: [
      "Vegetable-tanned Tuscan calfskin",
      "Saddle-stitched by a single artisan",
      "Unlined, with an interior patch pocket",
      "Signed and numbered inside the seam",
    ],
    stockQuantity: 2,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1584917865442-de89df76afd3", 1600),
        alt: "Soft Leather Tote — Bags",
      },
      {
        url: u("photo-1548036328-c9fa89d128fa", 1600),
        alt: "Soft Leather Tote — carried",
      },
      {
        url: u("photo-1600857544200-b2f666a9a2ec", 1600),
        alt: "Soft Leather Tote — interior",
      },
    ],
  },
  {
    slug: "silk-scarf-ochre",
    name: "Printed Silk Scarf",
    categorySlug: "accessories",
    priceCents: 21500,
    isNew: false,
    description: defaultDescription("Printed Silk Scarf", "Accessories"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("silk-scarf-ochre"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1601924994987-69e26d50dc26", 900),
        alt: "Printed Silk Scarf — Accessories",
      },
    ],
  },
  {
    slug: "loafer-chocolate",
    name: "Horsebit Loafer",
    categorySlug: "footwear",
    priceCents: 72500,
    isNew: false,
    description:
      "A horsebit loafer in burnished calfskin, hand-lasted on an almond last and finished with a leather sole. Built to be worn — and to be resoled many times.",
    materials: "Burnished calfskin upper. Full leather lining.",
    care: "Brush after wear. Polish monthly with a wax cream.",
    reference: "ATL-HL-CHO-03",
    sizes: ["39", "40", "41", "42", "43", "44", "45"],
    details: [
      "Hand-lasted on an almond last",
      "Blake-stitched leather sole",
      "Solid brass horsebit",
      "Resole programme available for life",
    ],
    stockQuantity: 12,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1549298916-b41d501d3772", 1600),
        alt: "Horsebit Loafer — Footwear",
      },
      {
        url: u("photo-1543163521-1bf539c55dd2", 1600),
        alt: "Horsebit Loafer — side",
      },
    ],
  },
  {
    slug: "linen-shirt-bone",
    name: "Washed Linen Shirt",
    categorySlug: "shirting",
    priceCents: 26500,
    isNew: true,
    description: defaultDescription("Washed Linen Shirt", "Shirting"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("linen-shirt-bone"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1602810318383-e386cc2a3ccf", 900),
        alt: "Washed Linen Shirt — Shirting",
      },
    ],
  },
  {
    slug: "signet-ring-gold",
    name: "Oval Signet Ring",
    categorySlug: "jewellery",
    priceCents: 99500,
    isNew: false,
    description: defaultDescription("Oval Signet Ring", "Jewellery"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("signet-ring-gold"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1611591437281-460bfbe1220a", 900),
        alt: "Oval Signet Ring — Jewellery",
      },
    ],
  },
  // Curated edit (positions 8..11)
  {
    slug: "cashmere-scarf-camel",
    name: "Double-Face Cashmere Scarf",
    categorySlug: "accessories",
    priceCents: 39500,
    isNew: false,
    description: defaultDescription("Double-Face Cashmere Scarf", "Accessories"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("cashmere-scarf-camel"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1520975916090-3105956dac38", 900),
        alt: "Double-Face Cashmere Scarf — Accessories",
      },
    ],
  },
  {
    slug: "leather-belt-noir",
    name: "Hand-Finished Belt",
    categorySlug: "leather",
    priceCents: 28500,
    isNew: false,
    description: defaultDescription("Hand-Finished Belt", "Leather"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("leather-belt-noir"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1624222247344-550fb60583dc", 900),
        alt: "Hand-Finished Belt — Leather",
      },
    ],
  },
  {
    slug: "tortoise-sunglasses",
    name: "Acetate Sunglasses",
    categorySlug: "eyewear",
    priceCents: 32500,
    isNew: false,
    description: defaultDescription("Acetate Sunglasses", "Eyewear"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("tortoise-sunglasses"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1572635196237-14b3f281503f", 900),
        alt: "Acetate Sunglasses — Eyewear",
      },
    ],
  },
  {
    slug: "weekender-bag",
    name: "Weekender Bag",
    categorySlug: "travel",
    priceCents: 135000,
    isNew: false,
    description: defaultDescription("Weekender Bag", "Travel"),
    materials: DEFAULT_MATERIALS,
    care: DEFAULT_CARE,
    reference: defaultReference("weekender-bag"),
    details: DEFAULT_DETAILS,
    stockQuantity: DEFAULT_STOCK,
    madeToOrder: false,
    images: [
      {
        url: u("photo-1553062407-98eeb64c6a62", 900),
        alt: "Weekender Bag — Travel",
      },
    ],
  },
];

async function seed() {
  // Deterministic timestamps so re-seeding yields the same ordering.
  const base = new Date("2026-01-01T00:00:00Z").getTime();
  const hour = 60 * 60 * 1000;

  console.log("Clearing existing catalogue…");
  await db.delete(productImages);
  await db.delete(products);
  await db.delete(categories);

  console.log("Inserting categories…");
  const allCategorySeeds = [...stripCategories, ...labelCategories];
  const categoryRows = await db
    .insert(categories)
    .values(
      allCategorySeeds.map((c, i) => ({
        slug: c.slug,
        name: c.name,
        tagline: c.tagline ?? null,
        imageUrl: c.imageUrl ?? null,
        // ascending so getCollections() ORDER BY createdAt ASC matches seed order
        createdAt: new Date(base + i * hour),
      })),
    )
    .returning({ id: categories.id, slug: categories.slug });

  const categoryIdBySlug = new Map(categoryRows.map((r) => [r.slug, r.id]));

  console.log("Inserting products…");
  const productRows = await db
    .insert(products)
    .values(
      productSeeds.map((p, i) => {
        const categoryId = categoryIdBySlug.get(p.categorySlug);
        if (!categoryId) {
          throw new Error(
            `Seed error: product "${p.slug}" references unknown category "${p.categorySlug}"`,
          );
        }
        return {
          slug: p.slug,
          name: p.name,
          categoryId,
          priceCents: p.priceCents,
          isNew: p.isNew,
          description: p.description,
          materials: p.materials,
          care: p.care,
          reference: p.reference,
          sizes: p.sizes ?? null,
          details: p.details,
          stockQuantity: p.stockQuantity,
          madeToOrder: p.madeToOrder,
          // descending so getNewArrivals/Curated ORDER BY createdAt DESC
          // returns products in seed order (position 0 = newest)
          createdAt: new Date(base + (productSeeds.length - i) * hour),
        };
      }),
    )
    .returning({ id: products.id, slug: products.slug });

  const productIdBySlug = new Map(productRows.map((r) => [r.slug, r.id]));

  console.log("Inserting product images…");
  const imageRows = productSeeds.flatMap((p) =>
    p.images.map((img, position) => ({
      productId: productIdBySlug.get(p.slug)!,
      url: img.url,
      alt: img.alt,
      position,
    })),
  );
  await db.insert(productImages).values(imageRows);

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products, ${imageRows.length} images.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
