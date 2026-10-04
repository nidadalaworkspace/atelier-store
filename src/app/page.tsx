import { Hero } from "@/components/site/hero";
import { FeaturedCollections } from "@/components/site/featured-collections";
import { NewArrivals } from "@/components/site/new-arrivals";
import { EditorialSplit } from "@/components/site/editorial-split";
import { CuratedEdit } from "@/components/site/curated-edit";
import { ServicesStrip } from "@/components/site/services-strip";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <FeaturedCollections />
      <NewArrivals />
      <EditorialSplit />
      <CuratedEdit />
      <ServicesStrip />
    </main>
  );
}
