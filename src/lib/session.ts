import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// Memoized per request so a layout + page tree only pays one DB round-trip.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function requireSession(redirectTo: string) {
  const session = await getSession();
  if (!session) {
    const qs = new URLSearchParams({ redirect: redirectTo });
    redirect(`/sign-in?${qs.toString()}`);
  }
  return session;
}

export async function requireAdmin(redirectTo: string) {
  const session = await requireSession(redirectTo);
  if (session.user.role !== "admin") notFound();
  return session;
}
