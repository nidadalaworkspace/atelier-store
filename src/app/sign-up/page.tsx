import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create account — Atelier",
  description: "Create your Atelier account.",
};

function readRedirect(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

export default async function SignUpPage({
  searchParams,
}: PageProps<"/sign-up">) {
  const params = await searchParams;
  const redirectTo = readRedirect(params.redirect);

  return (
    <main className="flex-1">
      <section className="pt-16 md:pt-24 pb-20 md:pb-28">
        <Container width="prose">
          <div className="max-w-md mx-auto">
            <Eyebrow>The Account</Eyebrow>
            <h1 className="display-md mt-4">Create account.</h1>
            <p className="mt-5 text-stone-600 leading-relaxed">
              A single account for orders, saved pieces and the atelier
              newsletter.
            </p>

            <div className="mt-10">
              <SignUpForm redirectTo={redirectTo} />
            </div>

            <p className="mt-10 text-sm text-stone-600">
              Already a client?{" "}
              <a
                href={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
                className="link text-ink"
              >
                Sign in
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
