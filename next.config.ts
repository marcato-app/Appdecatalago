import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default is 1MB — too small for a photo straight off a phone camera.
    // Matches the 6MB validated in lib/uploads.ts, with headroom for
    // multipart overhead.
    serverActions: {
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
