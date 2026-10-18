import Image from "next/image";
import { hero } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Full-bleed background image */}
      <div className="relative h-[78vh] min-h-[560px] md:h-[88vh] md:min-h-[680px] w-full">
        <div className="absolute inset-0 atl-ken-burns">
          <Image
            src={hero.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        {/* Darkening gradient for text legibility */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent atl-fade-in"
        />
      </div>

      {/* Overlaid copy */}
      <div className="container-wide absolute inset-0 flex items-end pb-14 md:pb-20 pointer-events-none">
        <div className="max-w-2xl text-paper pointer-events-auto">
          <div className="atl-fade-up">
            <Eyebrow className="text-paper/85">{hero.eyebrow}</Eyebrow>
          </div>
          <h1 className="display-xl mt-5 text-paper atl-fade-up atl-delay-100">
            {hero.title}
          </h1>
          <p className="mt-6 text-base md:text-lg text-paper/85 max-w-xl leading-relaxed atl-fade-up atl-delay-300">
            {hero.copy}
          </p>
          <div className="mt-9 flex flex-wrap gap-3 atl-fade-up atl-delay-500">
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
