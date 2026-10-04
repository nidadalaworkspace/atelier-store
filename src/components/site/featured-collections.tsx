import Image from "next/image";
import Link from "next/link";
import { getCollections } from "@/lib/products";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Eyebrow } from "@/components/ui/eyebrow";
import { TextLink } from "@/components/ui/text-link";

export async function FeaturedCollections() {
  const collections = await getCollections();
  return (
    <Section>
      <Container width="wide">
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 md:mb-14">
          <div>
            <Eyebrow>The Collections</Eyebrow>
            <h2 className="display-lg mt-4">An edited world.</h2>
          </div>
          <TextLink
            href="/collections"
            className="text-[0.6875rem] tracking-widest uppercase self-start sm:self-end"
          >
            View all collections
          </TextLink>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {collections.map((collection) => (
            <li key={collection.slug}>
              <Link
                href={`/collections/${collection.slug}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-stone-50">
                  <Image
                    src={collection.imageUrl}
                    alt={collection.name}
                    fill
                    sizes="(min-width: 1024px) 24vw, (min-width: 640px) 48vw, 96vw"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-5">
                  <h3 className="font-display text-xl md:text-2xl leading-tight">
                    {collection.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-stone-600">
                    {collection.tagline}
                  </p>
                  <p className="mt-3 text-[0.6875rem] tracking-widest uppercase text-stone-400">
                    {collection.pieces} pieces
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
