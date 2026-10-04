import Link from "next/link";
import { Container } from "@/components/ui/container";

type Crumb = { label: string; href?: string };

export function ProductBreadcrumb({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hairline-b py-4">
      <Container width="wide">
        <ol className="flex items-center gap-2 text-[0.6875rem] tracking-widest uppercase text-stone-600">
          {trail.map((crumb, i) => {
            const isLast = i === trail.length - 1;
            return (
              <li key={`${crumb.label}-${i}`} className="flex items-center gap-2">
                {crumb.href && !isLast ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-ink transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-ink truncate max-w-[60vw]" : undefined}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && (
                  <span aria-hidden className="text-stone-400">
                    /
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
