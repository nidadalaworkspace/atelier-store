import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductBreadcrumb } from "@/components/site/product-breadcrumb";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin — Atelier",
};

export default async function AdminPage() {
  const session = await requireAdmin("/admin");

  return (
    <main className="flex-1">
      <ProductBreadcrumb
        trail={[{ label: "Home", href: "/" }, { label: "Admin" }]}
      />

      <section className="pt-10 md:pt-16 pb-20 md:pb-28">
        <Container width="prose">
          <Eyebrow>Staff</Eyebrow>
          <h1 className="display-xl mt-4">Admin.</h1>
          <p className="mt-6 text-base md:text-lg text-stone-600 leading-relaxed max-w-xl">
            Signed in as{" "}
            <span className="text-ink">{session.user.email}</span>. Catalogue
            and order management tools will live here.
          </p>
        </Container>
      </section>
    </main>
  );
}
