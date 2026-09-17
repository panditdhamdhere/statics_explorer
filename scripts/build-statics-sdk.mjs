import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sdkDir = path.join(root, "node_modules", "@statics-protocol", "sdk");
const distFile = path.join(sdkDir, "dist", "index.js");

if (!existsSync(sdkDir)) {
  console.warn("Skipping SDK build: @statics-protocol/sdk is not installed.");
  process.exit(0);
}

if (existsSync(distFile)) {
  process.exit(0);
}

console.log("Building deployment-pinned @statics-protocol/sdk (dist is not published on GitHub).");

const result = spawnSync(
  process.execPath,
  [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json"],
  {
    cwd: sdkDir,
    stdio: "inherit",
    env: process.env,
  },
);

if (result.status !== 0) {
  console.error(
    "Failed to compile @statics-protocol/sdk. The GitHub package gitignores dist/, so this app compiles the pinned source after install.",
  );
  process.exit(result.status ?? 1);
}
