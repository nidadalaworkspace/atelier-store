import type { Metadata } from "next";
import { getNewArrivals } from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { ProductCard } from "@/components/site/product-card";

export const metadata: Metadata = {
  title: "New Arrivals — Atelier",
  description:
    "The latest pieces to join the collection — fresh from the ateliers in Como and Milan.",
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals();
  const count = products.length;

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "New Arrivals" }]}
      />

      <section className="pt-10 md:pt-16 pb-10 md:pb-14">
        <Container width="wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
            <div className="max-w-2xl">
              <Eyebrow>Just In</Eyebrow>
              <h1 className="display-xl mt-5">New arrivals.</h1>
              <p className="mt-6 text-base md:text-lg text-stone-600 max-w-xl leading-relaxed">
                Fresh from the ateliers in Como and Milan — the newest pieces
                to join the collection, listed in the order they arrived.
              </p>
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
              Nothing new just yet. Check back shortly — the next drop is
              never far away.
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
