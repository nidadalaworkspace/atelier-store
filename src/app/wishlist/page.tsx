import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { ProductCard } from "@/components/site/product-card";
import { WishlistButton } from "@/components/site/wishlist-button";
import { requireSession } from "@/lib/session";
import { getWishlist } from "@/lib/wishlist";
import { EmptyWishlist } from "./empty-wishlist";

export const metadata: Metadata = {
  title: "Your wishlist — Atelier",
};

export default async function WishlistPage() {
  await requireSession("/wishlist");
  const items = await getWishlist();
  const count = items.length;

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "Wishlist" }]}
      />
      <article className="pt-6 md:pt-10 pb-20 md:pb-28">
        <Container width="wide">
          <div className="mb-10 md:mb-14 flex items-baseline justify-between gap-6">
            <div>
              <Eyebrow>The wishlist</Eyebrow>
              <h1 className="display-md mt-3">Saved for later</h1>
            </div>
            {count > 0 && (
              <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600 shrink-0">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>

          {count === 0 ? (
            <EmptyWishlist />
          ) : (
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-x-6 md:gap-y-14">
              {items.map((product, i) => (
                <li key={product.slug} className="relative">
                  <ProductCard
                    product={product}
                    priority={i < 4}
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 50vw"
                  />
                  <WishlistButton
                    productId={product.id}
                    redirectTo="/wishlist"
                    initialInWishlist
                    variant="overlay"
                    className="absolute top-3 right-3 z-10"
                  />
                </li>
              ))}
            </ul>
          )}
        </Container>
      </article>
    </main>
  );
}
