import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Your account — Atelier",
};

const memberSinceFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default async function AccountOverview() {
  const session = await requireSession("/account");
  const createdAt =
    session.user.createdAt instanceof Date
      ? session.user.createdAt
      : new Date(session.user.createdAt);

  const rows: { label: string; value: string }[] = [
    { label: "Name", value: session.user.name },
    { label: "Email", value: session.user.email },
    {
      label: "Account type",
      value:
        session.user.role === "admin" ? "Administrator" : "Customer",
    },
    { label: "Member since", value: memberSinceFormatter.format(createdAt) },
  ];

  return (
    <div className="flex flex-col gap-14 lg:gap-16 max-w-2xl">
      <section>
        <Eyebrow>Account information</Eyebrow>
        <dl className="mt-6 hairline-t">
          {rows.map((row) => (
            <div
              key={row.label}
              className="hairline-b py-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            >
              <dt className="text-[0.6875rem] tracking-widest uppercase text-stone-600 sm:w-40 sm:shrink-0">
                {row.label}
              </dt>
              <dd className="text-base text-ink sm:text-right sm:flex-1">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-sm text-stone-600 leading-relaxed">
          To update your name or email, write to{" "}
          <a href="mailto:care@atelier.example" className="link text-ink">
            care@atelier.example
          </a>
          .
        </p>
      </section>
    </div>
  );
}
