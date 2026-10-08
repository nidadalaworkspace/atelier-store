# CLAUDE.md

@AGENTS.md

## Durable decisions

**No test runner is configured.** `npm run build` is the only full typecheck (`tsc --noEmit`); `npm run lint` is the ESLint gate. Treat both as the pre-merge bar.

**Tailwind v4** — PostCSS plugin only, no `tailwind.config`. The theme lives in `src/app/globals.css`.

### Data layer

`db` in `src/db/index.ts` is Neon's **HTTP** driver (`drizzle-orm/neon-http`). It is stateless HTTP: there are no interactive transactions — use `db.batch()` for multi-statement atomicity. `DATABASE_URL` must be the **pooled** Neon string.

`src/db/schema.ts` is the single schema file and the source of truth for `drizzle.config.ts`, the `db` client, and the Better Auth adapter. **Every new application table belongs in this file.** The Better Auth table and column names (`user`, `session`, `account`, `verification`, plus their columns) are addressed by name by the adapter — renaming or dropping any of them breaks auth. `user.role` is the one hand-rolled addition.

Conventions:

- `slug` is the unique public identifier for every route and React key.
- Declare each foreign key's `relations()` alongside the table.
- Drizzle relational queries: write the `with` block **inline at each call site**. Hoisting it into a shared `as const` config breaks result-shape inference.

Migrations: versioned SQL under `drizzle/`, generated via `db:generate`, applied via `db:migrate`. `db:push` is a dev-only escape hatch; read the emitted SQL before applying it. `scripts/seed.ts` (via `db:seed`) clears `product_images` → `products` → `categories` in that order and backdates `createdAt` from a hardcoded base so ordering is reproducible across runs.

### Catalogue invariants

- **Money is integer cents** in the DB. Only `mapProduct()` in `src/lib/products.ts` divides by 100 — components receive dollars and never see the column.
- **Stock is a quantity + flag** (`stockQuantity`, `madeToOrder`), never a stored state. The UI states derive from `stockState()` in `src/lib/stock.ts`, which also owns `stockCopy` and `stockTone`.
- **Homepage order comes from `products.createdAt` DESC**, not a featured/"new" flag — the grid and the rail are two slices of the same ordering.
- **Categories carry the Collections strip**: only those with an `imageUrl` are shown; piece counts are derived from `products`, not stored.
- **`product_images.alt` belongs to the row**, not the asset — the same URL may be reused across products with different copy. `position` 0 is the packshot.
- Pages never touch `db` directly: they call query functions in `src/lib/*`. `src/lib/sample-data.ts` is static chrome only (hero, atelier, services, nav) and holds no catalogue data.

### Auth boundary

Client components import from `src/lib/auth-client.ts` (keyed off `NEXT_PUBLIC_APP_URL`). **Server code calls `auth.api.*` directly with `headers()` — never the client module.** All client HTTP auth routes are served by the catch-all `src/app/api/auth/[...all]/route.ts`.

### Bag and checkout

- The bag is **DB-backed and signed-in only** — `carts` has a UNIQUE on `user_id`. No guest bag, nothing to merge on sign-in.
- `src/lib/cart.ts` is the only module that touches `db` for carts. Its shapes live in `src/lib/cart-types.ts` so client components can import them without pulling a `server-only` module into the bundle.
- **`cart_items` stores no price.** Amounts are read live from `products.priceCents` at render AND again when the Checkout Session is created — the browser never supplies a number that touches money.
- Checkout is Stripe-hosted. `startCheckout` in `src/lib/checkout.ts` rebuilds `line_items` from a fresh `getBag()` and uses `price_data` (not Stripe Price objects — there is no `stripePriceId` column and no sync job). **Never pass `payment_method_types`** — Stripe's current API rejects the parameter outright, and omitting it is also what enables dynamic payment methods.

### Orders and the webhook

**Orders are created by the webhook, never the success page.** `src/app/api/stripe/webhook/route.ts` → `fulfillCheckoutSession` in `src/lib/orders.ts`. Customers aren't guaranteed to load the success page. The handler:

- takes both `checkout.session.completed` and `checkout.session.async_payment_succeeded`, ignores anything still `unpaid`;
- is idempotent through the **`orders.stripe_checkout_session_id` UNIQUE constraint** — the pre-check SELECT is only a fast path;
- fills `order_items` amounts from **Stripe's** line items (not the catalogue, which may have been re-priced since); every other order-items column is a purchase-time snapshot;
- decrements stock in the same `db.batch()`, skips `madeToOrder` rows, floors at zero with `greatest(…, 0)`. Two customers can both pass the pre-session check and both pay — that oversell window is accepted deliberately.
- Runs with `runtime = "nodejs"` because signature verification needs the raw request bytes.

**Keep `/api/**` out of `src/proxy.ts`'s matcher.** Stripe sends no cookie and would get redirected.

### Money formatting

`currency()` in `src/lib/format.ts` rounds to whole dollars and is **catalogue-only**. Anything derived from cents — bag, checkout, receipts — uses `formatCents`, or `$99.99` renders as `$100` next to a Stripe page that says otherwise.

### Admin area

`/admin` is gated at three layers, and all three are load-bearing:

1. `src/proxy.ts` keeps unauthenticated requests out (session cookie only — the edge can't see role).
2. `src/app/admin/layout.tsx` calls `requireAdmin("/admin")` so non-admins get `notFound()` (indistinguishable from a missing page).
3. **Every admin server action re-calls the admin check on its first line.** Actions are a separate POST endpoint and the layout gate does not cover them. Actions use `requireAdminForAction`, which calls `redirect("/")` rather than `notFound()` — `notFound()` in a server action surfaces as an opaque 500 ("Connection closed") in the Flight response.

`user.role` defaults to `'customer'` and is marked `input: false` in `src/lib/auth.ts` so clients can't self-promote. **Bootstrap the first admin via SQL** — there is no seed script, no self-serve promotion UI:

```sql
UPDATE "user" SET role = 'admin' WHERE email = 'you@example.com';
```

### Env

Copy `.env.example` → `.env`. `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` must both point at the app's origin or auth callbacks break. Checkout additionally needs `STRIPE_SECRET_KEY` (prefer a restricted `rk_` key) and `STRIPE_WEBHOOK_SECRET`. `src/lib/stripe.ts` validates these **on first use rather than at import**, so the storefront still builds and runs without them — only checkout and the webhook fail.

## Next.js 16 specifics

Route `params` and `searchParams` are **Promises** and must be awaited. Layouts/pages use the globally generated `LayoutProps<"/route">` / `PageProps<"/route">` types (see `src/app/layout.tsx`) — these are emitted into `.next/types`, so a route's types only exist after a dev server or build has run.
