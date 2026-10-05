import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function EmptyBag() {
  return (
    <div className="hairline-t py-20 md:py-28 text-center flex flex-col items-center gap-6">
      <Eyebrow>Your bag</Eyebrow>
      <h2 className="display-sm max-w-md">Nothing in the bag just yet.</h2>
      <p className="text-stone-600 max-w-sm leading-relaxed">
        Browse the new season or revisit a collection you&apos;ve been drawn to.
      </p>
      <div className="mt-2">
        <Button as={Link} href="/new-arrivals" variant="secondary" size="lg">
          Discover new arrivals
        </Button>
      </div>
    </div>
  );
}
