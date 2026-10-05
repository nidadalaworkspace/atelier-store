"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: React.ReactNode;
  error?: string | null;
  trailing?: React.ReactNode;
};

export const AuthField = forwardRef<HTMLInputElement, Props>(function AuthField(
  { label, hint, error, trailing, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? rest.name ?? reactId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="eyebrow">
        {label}
      </label>
      <div
        className={cn(
          "flex items-center gap-2 border-b transition-colors",
          error
            ? "border-danger focus-within:border-danger"
            : "border-hairline focus-within:border-ink",
        )}
      >
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [hintId, errorId].filter(Boolean).join(" ") || undefined
          }
          {...rest}
          className={cn(
            "flex-1 bg-transparent py-2 text-base text-ink placeholder:text-stone-400 focus:outline-none disabled:text-stone-400 disabled:cursor-not-allowed",
            className,
          )}
        />
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
      {hint && !error && (
        <p
          id={hintId}
          className="text-[0.6875rem] tracking-widest uppercase text-stone-400"
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-danger"
        >
          {error}
        </p>
      )}
    </div>
  );
});
