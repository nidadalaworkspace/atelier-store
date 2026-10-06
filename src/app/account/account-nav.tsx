"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { signOutAction } from "./actions";

type Item = { href: string; label: string; comingSoon?: boolean };

const sections: Item[] = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses", comingSoon: true },
  { href: "/account/payment-methods", label: "Payment methods", comingSoon: true },
  { href: "/account/preferences", label: "Preferences", comingSoon: true },
];

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Account">
      {/* Mobile: horizontal rail. Desktop: vertical list with hairline rule. */}
      <ul
        className={cn(
          "flex overflow-x-auto gap-x-6 pb-2 -mx-5 px-5 hairline-b",
          "lg:mx-0 lg:px-0 lg:border-b-0 lg:flex-col lg:gap-x-0 lg:gap-y-0.5 lg:pb-0",
        )}
      >
        {sections.map((item) => {
          const isActive =
            !item.comingSoon &&
            (pathname === item.href ||
              (item.href !== "/account" &&
                pathname.startsWith(`${item.href}/`)));
          if (item.comingSoon) {
            return (
              <li key={item.href} className="shrink-0">
                <span
                  aria-disabled="true"
                  className={cn(
                    "flex items-baseline gap-2 py-2 text-sm text-stone-400 whitespace-nowrap cursor-default",
                  )}
                >
                  <span>{item.label}</span>
                  <span className="text-[0.6875rem] tracking-widest uppercase text-stone-400">
                    Soon
                  </span>
                </span>
              </li>
            );
          }
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

      <div className="hidden lg:block mt-6 hairline-t pt-6 space-y-1">
        {isAdmin && (
          <Link
            href="/admin"
            className="block py-2 text-sm text-ink link"
          >
            Admin area
            <span aria-hidden className="ml-1">
              ↗
            </span>
          </Link>
        )}
        <form action={signOutAction}>
          <button
            type="submit"
            className="block py-2 text-sm text-stone-600 hover:text-ink transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
