import Link from "next/link";
import { nav } from "@/lib/sample-data";

export function SiteHeader() {
  return (
    <header className="hairline-b bg-paper/95 backdrop-blur supports-[backdrop-filter]:bg-paper/80 sticky top-0 z-40">
      <div className="container-wide">
        {/* Top row: utility actions and wordmark */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center h-16 md:h-20">
          {/* Left: mobile menu, search */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Open menu"
              className="md:hidden -ml-1 p-1"
            >
              <MenuIcon />
            </button>
            <button
              type="button"
              aria-label="Search"
              className="hidden md:inline-flex items-center gap-2 text-[0.6875rem] tracking-widest uppercase"
            >
              <SearchIcon />
              <span>Search</span>
            </button>
          </div>

          {/* Centre: wordmark */}
          <Link
            href="/"
            className="font-display text-2xl md:text-3xl tracking-tightest leading-none"
          >
            Atelier
          </Link>

          {/* Right: account, bag */}
          <div className="flex items-center gap-5 justify-end text-[0.6875rem] tracking-widest uppercase">
            <Link href="/account" className="hidden md:inline">
              Account
            </Link>
            <Link href="/wishlist" aria-label="Wishlist" className="hidden sm:inline">
              <HeartIcon />
            </Link>
            <Link href="/bag" className="inline-flex items-center gap-1.5">
              <BagIcon />
              <span className="hidden sm:inline">Bag</span>
            </Link>
          </div>
        </div>

        {/* Bottom row: primary nav (desktop) */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center justify-center gap-8 lg:gap-10 pb-4"
        >
          {nav.primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[0.6875rem] tracking-widest uppercase hover:text-ink-soft transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1" />
      <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M9 15.5s-5.5-3.3-5.5-7.2A2.8 2.8 0 0 1 9 6.2a2.8 2.8 0 0 1 5.5 2.1C14.5 12.2 9 15.5 9 15.5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path
        d="M4 5h10l-.7 10.5H4.7L4 5Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path d="M6.5 5a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
