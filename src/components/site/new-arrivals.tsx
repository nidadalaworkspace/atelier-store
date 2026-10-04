import { getNewArrivals } from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { ProductCard } from "./product-card";

export async function NewArrivals() {
  const newArrivals = await getNewArrivals(8);
  return (
    <Section className="bg-canvas hairline-y">
      <Container width="wide">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <Eyebrow>Just In</Eyebrow>
            <h2 className="display-lg mt-4">New arrivals.</h2>
          </div>
          <TextLink
            href="/new-arrivals"
            className="text-[0.6875rem] tracking-widest uppercase self-start sm:self-end"
          >
            Shop all new arrivals
          </TextLink>
        </header>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-x-6 md:gap-y-14">
          {newArrivals.map((product) => (
            <li key={product.slug}>
              <ProductCard
                product={product}
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 50vw"
              />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
