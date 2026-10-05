import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCategorySlugs,
  getCategoryBySlug,
} from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { ProductCard } from "@/components/site/product-card";

export async function generateStaticParams() {
  return getAllCategorySlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) return { title: "Collection not found — Atelier" };
  const { category } = data;
  return {
    title: `${category.name} — Atelier`,
    description:
      category.tagline ||
      `Shop the ${category.name} collection — hand-finished in our atelier.`,
  };
}

export default async function CollectionPage({
  params,
}: PageProps<"/collections/[slug]">) {
  const { slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();

  const { category, products } = data;
  const count = products.length;

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: category.name }]}
      />

      <section className="pt-10 md:pt-16 pb-10 md:pb-14">
        <Container width="wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
            <div className="max-w-2xl">
              <Eyebrow>The Collection</Eyebrow>
              <h1 className="display-xl mt-5">{category.name}.</h1>
              {category.tagline && (
                <p className="mt-6 text-base md:text-lg text-stone-600 max-w-xl leading-relaxed">
                  {category.tagline}
                </p>
              )}
            </div>
            {count > 0 && (
              <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600 shrink-0">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container width="wide">
          {count === 0 ? (
            <p className="text-stone-600 max-w-xl">
              This collection has no pieces available right now. Check back
              soon — the next drop is never far away.
            </p>
          ) : (
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-x-6 md:gap-y-14">
              {products.map((product, i) => (
                <li key={product.slug}>
                  <ProductCard
                    product={product}
                    priority={i < 4}
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 50vw"
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </main>
  );
}
