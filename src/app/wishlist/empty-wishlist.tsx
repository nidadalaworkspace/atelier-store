import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function EmptyWishlist() {
  return (
    <div className="hairline-t py-20 md:py-28 text-center flex flex-col items-center gap-6">
      <Eyebrow>Your wishlist</Eyebrow>
      <h2 className="display-sm max-w-md">Nothing saved just yet.</h2>
      <p className="text-stone-600 max-w-sm leading-relaxed">
        Tap the heart on any piece to keep it close. We&apos;ll hold your
        selection here between visits.
      </p>
      <div className="mt-2">
        <Button as={Link} href="/new-arrivals" variant="secondary" size="lg">
          Browse new arrivals
        </Button>
      </div>
    </div>
  );
}
