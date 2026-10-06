import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Categories — Admin",
};

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categories");

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Eyebrow>Categories</Eyebrow>
        <h2 className="mt-3 text-2xl md:text-3xl text-ink">
          Collections.
        </h2>
        <p className="mt-4 text-sm text-stone-600 leading-relaxed max-w-xl">
          Category CRUD — the groupings that anchor the home page strip — lands
          in the next slice.
        </p>
      </section>
    </div>
  );
}
