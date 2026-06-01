import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // Ship the pre-computed verse graph with the self-reference route on Vercel.
  outputFileTracingIncludes: {
    "/api/self-reference": ["./src/data/verse_graph.json"],
  },
};

export default nextConfig;
