export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
    >
      {message}
    </div>
  );
}
