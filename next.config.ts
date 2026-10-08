import type { NextConfig } from "next";
import { ALLOWED_IMAGE_HOSTS } from "./src/lib/image-hosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: ALLOWED_IMAGE_HOSTS.map((hostname) => ({
      protocol: "https",
      hostname,
    })),
  },
};

export default nextConfig;
