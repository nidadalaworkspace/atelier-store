import type { Metadata } from "next";
import { searchProducts } from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { ProductCard } from "@/components/site/product-card";
import { SearchForm } from "@/components/site/search-form";

export const metadata: Metadata = {
  title: "Search — Atelier",
  description:
    "Search the Atelier collection — pieces, categories and materials from Como and Milan.",
};

function readQuery(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? "";
  return value?.trim() ?? "";
}

export default async function SearchPage({
  searchParams,
}: PageProps<"/search">) {
  const params = await searchParams;
  const q = readQuery(params.q);
  const results = q ? await searchProducts(q) : [];
  const count = results.length;

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <section className="pt-10 md:pt-16 pb-10 md:pb-14">
        <Container width="wide">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-10">
            <div className="max-w-2xl">
              <Eyebrow>Search</Eyebrow>
              <h1 className="display-xl mt-5">
                {q ? (
                  <>
                    Results for <span className="italic">&ldquo;{q}&rdquo;</span>
                    .
                  </>
                ) : (
                  "Find your piece."
                )}
              </h1>
              <p className="mt-6 text-base md:text-lg text-stone-600 max-w-xl leading-relaxed">
                {q
                  ? "Matching pieces across the collection — newest first."
                  : "Search the catalogue by piece, category or material. Try “coat”, “leather” or “knitwear”."}
              </p>
            </div>
            {q && count > 0 && (
              <p className="text-[0.6875rem] tracking-widest uppercase text-stone-600 shrink-0">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            )}
          </div>

          <div className="mt-10 md:mt-14 max-w-3xl">
            <SearchForm initialQuery={q} autoFocus={!q} />
          </div>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container width="wide">
          {!q ? (
            <SuggestionList />
          ) : count === 0 ? (
            <div className="max-w-xl">
              <p className="text-stone-600">
                No pieces match <span className="italic">&ldquo;{q}&rdquo;</span>
                . Try a broader term — a category, a material, or the name of
                a piece.
              </p>
              <SuggestionList className="mt-10" />
            </div>
          ) : (
            <ul className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-x-6 md:gap-y-14">
              {results.map((product, i) => (
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

const suggestions = [
  "Coat",
  "Knitwear",
  "Leather",
  "Linen",
  "Loafer",
  "Scarf",
  "Jewellery",
  "Tailoring",
];

function SuggestionList({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Eyebrow>Try searching for</Eyebrow>
      <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-3">
        {suggestions.map((term) => (
          <li key={term}>
            <a
              href={`/search?q=${encodeURIComponent(term.toLowerCase())}`}
              className="link text-sm md:text-base text-ink"
            >
              {term}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
