import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllProductSlugs,
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/products";
import { Container } from "@/components/ui/container";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { ProductGallery } from "@/components/site/product-gallery";
import { ProductInfo } from "@/components/site/product-info";
import { RelatedProducts } from "@/components/site/related-products";

export async function generateStaticParams() {
  return getAllProductSlugs();
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found — Atelier" };
  return {
    title: `${product.name} — Atelier`,
    description: product.description,
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.slug, 4);

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[
          { label: "Home", href: "/" },
          { label: product.category, href: "/new-arrivals" },
          { label: product.name },
        ]}
      />

      <article className="pt-6 md:pt-10 pb-20 md:pb-28">
        <Container width="wide">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_520px] lg:items-start">
            <ProductGallery
              images={product.gallery}
              alt={`${product.name} — ${product.category}`}
            />
            <ProductInfo product={product} />
          </div>
        </Container>
      </article>

      <RelatedProducts products={related} />
    </main>
  );
}
