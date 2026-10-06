import { Eyebrow } from "@/components/ui/eyebrow";

export function CheckoutCancelledNotice() {
  return (
    <div
      role="status"
      className="mb-10 md:mb-14 hairline-y py-5 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
    >
      <div className="flex items-start gap-3">
        <span className="dot bg-warning mt-2" aria-hidden />
        <div>
          <Eyebrow>Checkout cancelled</Eyebrow>
          <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-prose">
            Your bag is just as you left it. No payment was taken — review the
            pieces below and continue whenever you&apos;re ready.
          </p>
        </div>
      </div>
    </div>
  );
}
