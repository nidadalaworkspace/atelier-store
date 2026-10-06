"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

const sections: Item[] = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/orders", label: "Orders" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin">
      {/* Mobile: horizontal rail. Desktop: vertical list with hairline rule. */}
      <ul
        className={cn(
          "flex overflow-x-auto gap-x-6 pb-2 -mx-5 px-5 hairline-b",
          "lg:mx-0 lg:px-0 lg:border-b-0 lg:flex-col lg:gap-x-0 lg:gap-y-0.5 lg:pb-0",
        )}
      >
        {sections.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "block py-2 text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "text-ink font-medium"
                    : "text-stone-600 hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="hidden lg:block mt-6 hairline-t pt-6">
        <Link href="/account" className="block py-2 text-sm text-stone-600 hover:text-ink transition-colors">
          Back to account
          <span aria-hidden className="ml-1">
            ↗
          </span>
        </Link>
      </div>
    </nav>
  );
}
