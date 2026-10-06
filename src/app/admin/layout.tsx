import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { requireAdmin } from "@/lib/session";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  // Gates the whole /admin subtree. Non-admins receive notFound() so the
  // response is indistinguishable from a missing page — do not leak role.
  // Every server action under /admin must repeat this check: actions have
  // their own POST endpoint and are not covered by this layout.
  const session = await requireAdmin("/admin");
  const firstName = session.user.name.split(" ")[0] || session.user.name;

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "Admin" }]}
      />

      <section className="pt-10 md:pt-16 pb-10 md:pb-14">
        <Container width="wide">
          <Eyebrow>Staff</Eyebrow>
          <h1 className="display-xl mt-4">Admin, {firstName}.</h1>
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
              <AdminNav />
            </aside>
            <div className="min-w-0">{children}</div>
          </div>
        </Container>
      </section>
    </main>
  );
}
