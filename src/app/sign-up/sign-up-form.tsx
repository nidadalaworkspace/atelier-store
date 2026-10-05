"use client";

import { useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/site/auth-field";
import { AuthErrorBanner } from "@/components/site/auth-error-banner";
import {
  friendlyAuthError,
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/auth-validation";
import { cn } from "@/lib/cn";

type Status = "idle" | "submitting" | "success";

export function SignUpForm({ redirectTo }: { redirectTo: string }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
  }>({ name: false, email: false, password: false });

  const [fieldErrors, setFieldErrors] = useState<{
    name: string | null;
    email: string | null;
    password: string | null;
  }>({ name: null, email: null, password: null });

  const [serverError, setServerError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const pending = status === "submitting";
  const succeeded = status === "success";

  function fieldError(name: "name" | "email" | "password", value: string) {
    if (name === "name") return validateName(value);
    if (name === "email") return validateEmail(value);
    return validatePassword(value);
  }

  function handleBlur(f: "name" | "email" | "password", value: string) {
    setTouched((t) => ({ ...t, [f]: true }));
    setFieldErrors((e) => ({ ...e, [f]: fieldError(f, value) }));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);

    const errors = {
      name: fieldError("name", name),
      email: fieldError("email", email),
      password: fieldError("password", password),
    };
    setFieldErrors(errors);
    setTouched({ name: true, email: true, password: true });

    if (errors.name) {
      nameRef.current?.focus();
      return;
    }
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }
    if (errors.password) {
      passwordRef.current?.focus();
      return;
    }

    setStatus("submitting");
    const { error: err } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    if (err) {
      setServerError(friendlyAuthError(err, "sign-up"));
      setStatus("idle");
      return;
    }

    setStatus("success");
    // Hard navigation so the browser carries the fresh Set-Cookie on the next
    // request — see note in sign-in-form.tsx.
    window.location.assign(redirectTo);
  }

  const disabled = pending || succeeded;
  const passwordLongEnough = password.length >= PASSWORD_MIN_LENGTH;

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {serverError && <AuthErrorBanner message={serverError} />}

      <AuthField
        ref={nameRef}
        label="Name"
        type="text"
        name="name"
        autoComplete="name"
        autoFocus
        required
        disabled={disabled}
        value={name}
        error={touched.name ? fieldErrors.name : null}
        onChange={(e) => {
          setName(e.target.value);
          if (fieldErrors.name) setFieldErrors((x) => ({ ...x, name: null }));
        }}
        onBlur={(e) => handleBlur("name", e.target.value)}
      />

      <AuthField
        ref={emailRef}
        label="Email"
        type="email"
        name="email"
        inputMode="email"
        autoComplete="email"
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
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        disabled={disabled}
        value={password}
        hint={<PasswordHint ok={passwordLongEnough} />}
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
        {succeeded ? "Redirecting…" : pending ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function PasswordHint({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "transition-colors",
        ok ? "text-success" : "text-stone-400",
      )}
    >
      <span aria-hidden className="mr-2">
        {ok ? "✓" : "—"}
      </span>
      Minimum {PASSWORD_MIN_LENGTH} characters
    </span>
  );
}
