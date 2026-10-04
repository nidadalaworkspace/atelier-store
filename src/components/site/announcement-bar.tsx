export function AnnouncementBar() {
  return (
    <div className="bg-ink text-paper text-[0.6875rem] tracking-widest uppercase">
      <div className="container-wide flex h-9 items-center justify-center gap-6 text-center">
        <span className="hidden sm:inline opacity-70">
          Complimentary shipping on orders over $200
        </span>
        <span className="opacity-70">Discover Resort 2026</span>
      </div>
    </div>
  );
}
