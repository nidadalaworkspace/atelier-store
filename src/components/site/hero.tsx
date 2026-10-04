import Image from "next/image";
import { hero } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-bleed background image */}
      <div className="relative h-[78vh] min-h-[560px] md:h-[88vh] md:min-h-[680px] w-full">
        <Image
          src={hero.imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Darkening gradient for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent"
        />
      </div>

      {/* Overlaid copy */}
      <div className="container-wide absolute inset-0 flex items-end pb-14 md:pb-20 pointer-events-none">
        <div className="max-w-2xl text-paper pointer-events-auto">
          <Eyebrow className="text-paper/85">{hero.eyebrow}</Eyebrow>
          <h1 className="display-xl mt-5 text-paper">{hero.title}</h1>
          <p className="mt-6 text-base md:text-lg text-paper/85 max-w-xl leading-relaxed">
            {hero.copy}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              as="a"
              href="/collections/resort-2026"
              variant="secondary"
              className="!border-paper !text-paper hover:!bg-paper hover:!text-ink"
            >
              Shop the collection
            </Button>
            <Button
              as="a"
              href="/journal/resort-2026"
              variant="ghost"
              className="!text-paper hover:!opacity-70"
            >
              Read the lookbook →
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
