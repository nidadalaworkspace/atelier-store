import type { Product } from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { ProductCard } from "./product-card";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <Section className="bg-stone-50">
      <Container width="wide">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <Eyebrow>You may also like</Eyebrow>
            <h2 className="display-lg mt-4">From the same hands.</h2>
          </div>
          <TextLink
            href="/new-arrivals"
            className="text-[0.6875rem] tracking-widest uppercase self-start sm:self-end"
          >
            Shop all new arrivals
          </TextLink>
        </header>
        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-x-6 md:gap-y-14">
          {products.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
