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

// Action-side analogue of requireAdmin. notFound() in a server action surfaces
// as an opaque 500 "Connection closed" in the Flight response rather than a
// clean 404, so we redirect non-admins (and the rare signed-out request that
// slipped past the proxy) to the home page instead. The proxy still gates GET
// requests to /admin for signed-out users — this covers the action POST path.
export async function requireAdminForAction() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/");
  return session;
}
