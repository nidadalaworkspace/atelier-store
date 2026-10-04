import Image from "next/image";
import { editorial } from "@/lib/sample-data";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function EditorialSplit() {
  return (
    <Section>
      <Container width="wide">
        <div className="grid gap-10 md:gap-16 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/5] md:aspect-[5/6] overflow-hidden bg-stone-50 order-1 lg:order-none">
            <Image
              src={editorial.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 48vw, 96vw"
              className="object-cover"
            />
          </div>
          <div className="max-w-xl lg:pl-10 xl:pl-20">
            <Eyebrow>{editorial.eyebrow}</Eyebrow>
            <h2 className="display-lg mt-5">{editorial.title}</h2>
            <p className="mt-6 text-base md:text-lg text-stone-600 leading-relaxed">
              {editorial.copy}
            </p>
            <div className="mt-9">
              <Button as="a" href={editorial.cta.href} variant="primary">
                {editorial.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
