// Single source of truth for the hostnames next/image is allowed to load.
// next.config.ts converts this into remotePatterns; the admin product
// validator rejects imageUrl values that fall outside the list so a save can
// never leave a product whose packshot 500s the storefront PDP.
export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com"] as const;

export function isAllowedImageHost(hostname: string): boolean {
  return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(hostname);
}
