"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  initialQuery?: string;
  autoFocus?: boolean;
  placeholder?: string;
};

export function SearchForm({
  initialQuery = "",
  autoFocus = false,
  placeholder = "Search by piece, category or material…",
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function clear() {
    setValue("");
    router.replace("/search");
  }

  return (
    <form
      role="search"
      action="/search"
      method="GET"
      className="relative flex items-center hairline-b focus-within:border-ink transition-colors"
    >
      <SearchIcon />
      <label className="sr-only" htmlFor="site-search-input">
        Search the collection
      </label>
      <input
        id="site-search-input"
        type="search"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className="w-full bg-transparent py-4 pl-3 pr-24 text-base md:text-lg font-light text-ink placeholder:text-stone-400 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          aria-label="Clear search"
          className="absolute right-20 top-1/2 -translate-y-1/2 text-[0.6875rem] tracking-widest uppercase text-stone-600 hover:text-ink transition-colors"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[0.6875rem] tracking-widest uppercase text-ink pl-4 pr-1"
      >
        Search
      </button>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden
      className="shrink-0 text-stone-600"
    >
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1" />
      <path d="M12 12l3.5 3.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
