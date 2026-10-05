"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

export function AccountSlot() {
  const { data, isPending } = useSession();

  if (isPending) {
    return <span className="hidden md:inline-block w-14" aria-hidden />;
  }

  const href = data ? "/account" : "/sign-in";
  const label = data ? "Account" : "Sign in";

  return (
    <Link href={href} className="hidden md:inline link">
      {label}
    </Link>
  );
}
