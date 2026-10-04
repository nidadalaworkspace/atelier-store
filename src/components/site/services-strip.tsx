import { services } from "@/lib/sample-data";
import { Container } from "@/components/ui/container";

export function ServicesStrip() {
  return (
    <section className="hairline-y py-14 md:py-20">
      <Container width="wide">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-6">
          {services.map((item) => (
            <li key={item.title} className="text-center sm:text-left">
              <h3 className="font-display text-lg md:text-xl leading-snug">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-xs sm:max-w-none mx-auto sm:mx-0">
                {item.copy}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
