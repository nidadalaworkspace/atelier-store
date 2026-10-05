import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in — Atelier",
  description: "Sign in to your Atelier account.",
};

function readRedirect(value: string | string[] | undefined): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/account";
}

export default async function SignInPage({
  searchParams,
}: PageProps<"/sign-in">) {
  const params = await searchParams;
  const redirectTo = readRedirect(params.redirect);

  return (
    <main className="flex-1">
      <section className="pt-16 md:pt-24 pb-20 md:pb-28">
        <Container width="prose">
          <div className="max-w-md mx-auto">
            <Eyebrow>The Account</Eyebrow>
            <h1 className="display-md mt-4">Sign in.</h1>
            <p className="mt-5 text-stone-600 leading-relaxed">
              Access your orders, saved pieces and preferences.
            </p>

            <div className="mt-10">
              <SignInForm redirectTo={redirectTo} />
            </div>

            <p className="mt-10 text-sm text-stone-600">
              New here?{" "}
              <a
                href={`/sign-up?redirect=${encodeURIComponent(redirectTo)}`}
                className="link text-ink"
              >
                Create an account
              </a>
              .
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
