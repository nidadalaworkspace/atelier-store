export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value: string): string | null {
  if (!value.trim()) return "Please enter your name.";
  if (value.trim().length < 2) return "Please enter at least two characters.";
  return null;
}

export function validateEmail(value: string): string | null {
  const v = value.trim();
  if (!v) return "Please enter your email.";
  if (!EMAIL_RE.test(v)) return "Please enter a valid email address.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (!value) return "Please enter a password.";
  if (value.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  return null;
}

// Server-reported password rule (sign-in: no min-length check, just presence).
export function validatePasswordPresence(value: string): string | null {
  if (!value) return "Please enter your password.";
  return null;
}

/**
 * Translate a Better Auth error object into copy a shopper understands.
 * Falls back to the server-provided message, then to a generic line.
 */
type AuthErrorLike = { code?: string | null; message?: string | null } | null;

export function friendlyAuthError(
  err: AuthErrorLike,
  context: "sign-in" | "sign-up",
): string {
  const code = (err?.code ?? "").toUpperCase();

  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "INVALID_CREDENTIALS":
      return "That email and password don't match. Please try again.";
    case "USER_NOT_FOUND":
      return "No account found for that email. Create one to continue.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
    case "EMAIL_ALREADY_EXISTS":
      return "An account already exists for that email. Sign in instead.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    case "PASSWORD_TOO_SHORT":
      return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    case "PASSWORD_TOO_LONG":
      return "That password is too long. Please choose a shorter one.";
    case "ACCOUNT_LOCKED":
    case "TOO_MANY_REQUESTS":
      return "Too many attempts. Please wait a moment and try again.";
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email before signing in.";
    default:
      if (err?.message) return err.message;
      return context === "sign-in"
        ? "We couldn't sign you in. Please try again."
        : "We couldn't create your account. Please try again.";
  }
}
