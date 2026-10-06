import type { Metadata } from "next";
import Link from "next/link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { getAdminOverview } from "@/lib/admin";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin — Atelier",
};

type Tile = {
  href: string;
  label: string;
  description: string;
  metric: (overview: Awaited<ReturnType<typeof getAdminOverview>>) => {
    value: number;
    unit: string;
  };
};

const tiles: Tile[] = [
  {
    href: "/admin/products",
    label: "Products",
    description: "Create, edit and retire pieces in the catalogue.",
    metric: (o) => ({ value: o.products, unit: o.products === 1 ? "piece" : "pieces" }),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    description: "The collections that group the catalogue and anchor the home page.",
    metric: (o) => ({
      value: o.categories,
      unit: o.categories === 1 ? "category" : "categories",
    }),
  },
  {
    href: "/admin/stock",
    label: "Stock",
    description: "Quantities and made-to-order flags per piece.",
    metric: (o) => ({
      value: o.outOfStock,
      unit: o.outOfStock === 1 ? "sold out" : "sold out",
    }),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Receipts for every completed checkout session.",
    metric: (o) => ({ value: o.orders, unit: o.orders === 1 ? "order" : "orders" }),
  },
];

export default async function AdminPage() {
  // Defence in depth — the layout already gates /admin, but a page can also be
  // reached by RSC payload fetches so the role check is cheap and belongs here.
  await requireAdmin("/admin");
  const overview = await getAdminOverview();

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Overview</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          The atelier at a glance.
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
          Each tile below opens the matching workspace. Catalogue and order
          tooling will fill out behind these links.
        </p>
      </section>

      <section>
        <ul className="grid gap-px bg-[color:var(--color-hairline)] sm:grid-cols-2 hairline-t hairline-b">
          {tiles.map((tile) => {
            const metric = tile.metric(overview);
            return (
              <li key={tile.href} className="bg-canvas">
                <Link
                  href={tile.href}
                  className="group block p-6 md:p-8 h-full transition-colors hover:bg-stone-50"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <Eyebrow>{tile.label}</Eyebrow>
                    <span aria-hidden className="text-stone-400 transition-colors group-hover:text-ink">
                      →
                    </span>
                  </div>
                  <p className="mt-4 text-3xl md:text-4xl text-ink tabular-nums">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-[0.6875rem] tracking-widest uppercase text-stone-600">
                    {metric.unit}
                  </p>
                  <p className="mt-5 text-sm text-stone-600 leading-relaxed">
                    {tile.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
