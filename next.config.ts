import type { NextConfig } from "next";
// Validates env vars when `next dev` / `next build` starts; throws a readable error if config is wrong
import "./src/lib/env";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
