"use client";

import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/site/auth-field";
import { AuthErrorBanner } from "@/components/site/auth-error-banner";
import {
  friendlyAuthError,
  validateEmail,
  validatePasswordPresence,
} from "@/lib/auth-validation";

type Status = "idle" | "submitting" | "success";

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>(
    { email: false, password: false },
  );
  const [fieldErrors, setFieldErrors] = useState<{
    email: string | null;
    password: string | null;
  }>({ email: null, password: null });

  const [serverError, setServerError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const pending = status === "submitting";
  const succeeded = status === "success";

  function fieldError(name: "email" | "password", value: string) {
    return name === "email"
      ? validateEmail(value)
      : validatePasswordPresence(value);
  }

  function handleBlur(name: "email" | "password", value: string) {
    setTouched((t) => ({ ...t, [name]: true }));
    setFieldErrors((e) => ({ ...e, [name]: fieldError(name, value) }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const errors = {
      email: fieldError("email", email),
      password: fieldError("password", password),
    };
    setFieldErrors(errors);
    setTouched({ email: true, password: true });

    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }

    setStatus("submitting");
    const { error: err } = await authClient.signIn.email({ email, password });

    if (err) {
      setServerError(friendlyAuthError(err, "sign-in"));
      setStatus("idle");
      return;
    }

    setStatus("success");
    // Hard navigation so the browser carries the fresh Set-Cookie on the next
    // request. router.push races the proxy middleware's cookie check and can
    // bounce the user back to /sign-in on the first attempt.
    window.location.assign(redirectTo);
  }

  const disabled = pending || succeeded;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {serverError && <AuthErrorBanner message={serverError} />}

      <AuthField
        ref={emailRef}
        label="Email"
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
        autoFocus
        required
        disabled={disabled}
        value={email}
        error={touched.email ? fieldErrors.email : null}
        onChange={(e) => {
          setEmail(e.target.value);
          if (fieldErrors.email) setFieldErrors((x) => ({ ...x, email: null }));
        }}
        onBlur={(e) => handleBlur("email", e.target.value)}
      />

      <AuthField
        ref={passwordRef}
        label="Password"
        type={showPassword ? "text" : "password"}
        name="password"
        autoComplete="current-password"
        required
        disabled={disabled}
        value={password}
        error={touched.password ? fieldErrors.password : null}
        onChange={(e) => {
          setPassword(e.target.value);
          if (fieldErrors.password)
            setFieldErrors((x) => ({ ...x, password: null }));
        }}
        onBlur={(e) => handleBlur("password", e.target.value)}
        trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={disabled}
            className="text-[0.6875rem] tracking-widest uppercase text-stone-600 hover:text-ink disabled:text-stone-400 transition-colors pr-1"
            aria-pressed={showPassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        }
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={disabled}
        aria-busy={pending}
      >
        {succeeded ? "Redirecting…" : pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
