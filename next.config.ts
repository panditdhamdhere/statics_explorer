import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@statics-protocol/sdk"],
  serverExternalPackages: ["pino", "pino-pretty", "lokijs", "encoding"],
  agentRules: false,
  turbopack: {
    resolveAlias: {
      pino: "./src/lib/pino-browser-shim.ts",
    },
  },
};

export default nextConfig;
