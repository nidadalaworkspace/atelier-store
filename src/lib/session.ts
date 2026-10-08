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
  // Send signed-out visitors back to /account after they sign in, not to the
  // admin surface they just hit — a non-admin who signs in would otherwise
  // land on a 404 at the admin route with no way back to their own account.
  // Admins who are already signed in still see the exact /admin page they
  // requested because requireSession is a no-op for them.
  const session = await requireSession("/account");
  void redirectTo; // kept for call-site clarity; non-admins never see it
  if (session.user.role !== "admin") notFound();
  return session;
}
