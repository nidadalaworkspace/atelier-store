// Types shared between the server cart module and the client bag UI.
// No `server-only` here — client components may import this file.

export type LineAvailability = "ok" | "exceeds-stock" | "unavailable";

export type BagLine = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  size: string | null;
  quantity: number;
  unitCents: number;
  lineCents: number;
  imageUrl: string;
  madeToOrder: boolean;
  availableNow: number | null;
  availability: LineAvailability;
};

export type BagView = {
  id: string;
  items: BagLine[];
  subtotalCents: number;
  itemCount: number;
};

export type CartActionError =
  | "unauthenticated"
  | "not-found"
  | "out-of-stock"
  | "exceeds-stock"
  | "invalid-input";

export type CartActionResult =
  | { ok: true }
  | { ok: false; error: CartActionError; available?: number };
