import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Orders — Admin",
};

export default async function AdminOrdersPage() {
  await requireAdmin("/admin/orders");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Orders</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          Completed checkouts.
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
          A newest-first list of every order the webhook has created — and a
          detail view per order — lands in the next slice.
        </p>
      </section>
    </div>
  );
}
