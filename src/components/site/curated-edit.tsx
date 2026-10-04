import { getCurated } from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";
import { ProductCard } from "./product-card";

export async function CuratedEdit() {
  const curated = await getCurated(4);
  return (
    <Section className="bg-stone-50">
      <Container width="wide">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <Eyebrow>The Gift Edit</Eyebrow>
            <h2 className="display-lg mt-4">For someone considered.</h2>
          </div>
          <TextLink
            href="/gifts"
            className="text-[0.6875rem] tracking-widest uppercase self-start sm:self-end"
          >
            Explore all gifts
          </TextLink>
        </header>

        <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-x-6 md:gap-y-14">
          {curated.map((product) => (
            <li key={product.slug}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
