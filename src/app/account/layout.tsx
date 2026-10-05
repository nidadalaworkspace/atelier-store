import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { requireSession } from "@/lib/session";
import { AccountNav } from "./account-nav";
import { signOutAction } from "./actions";

export default async function AccountLayout({
  children,
}: LayoutProps<"/account">) {
  const session = await requireSession("/account");
  const firstName = session.user.name.split(" ")[0] || session.user.name;
  const isAdmin = session.user.role === "admin";

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "Account" }]}
      />

      <section className="pt-10 md:pt-16 pb-10 md:pb-14">
        <Container width="wide">
          <Eyebrow>The Account</Eyebrow>
          <h1 className="display-xl mt-4">Welcome, {firstName}.</h1>
          <p className="mt-5 text-base md:text-lg text-stone-600 leading-relaxed">
            Signed in as{" "}
            <span className="text-ink">{session.user.email}</span>.
          </p>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container width="wide">
          <div className="grid gap-10 lg:gap-16 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside>
              <AccountNav isAdmin={isAdmin} />
            </aside>
            <div className="min-w-0">{children}</div>
          </div>

          {/* Mobile sign-out (sidebar sign-out is desktop-only) */}
          <div className="lg:hidden mt-14 hairline-t pt-8 flex flex-col items-start gap-3">
            {isAdmin && (
              <a href="/admin" className="link text-sm text-ink">
                Admin area ↗
              </a>
            )}
            <form action={signOutAction}>
              <Button type="submit" variant="secondary" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </Container>
      </section>
    </main>
  );
}
