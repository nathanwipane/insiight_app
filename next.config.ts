import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Limit the in-memory dev page buffer so long sessions don't balloon the heap.
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
