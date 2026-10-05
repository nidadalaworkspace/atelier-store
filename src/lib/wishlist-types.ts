// Types shared between the server wishlist module and client UI.
// No `server-only` here — client components may import this file.

export type WishlistActionError = "unauthenticated" | "not-found" | "invalid-input";

export type WishlistActionResult =
  | { ok: true; inWishlist: boolean }
  | { ok: false; error: WishlistActionError };
