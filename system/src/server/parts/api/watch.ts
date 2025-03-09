#!/usr/bin/env bun
import { watch } from "fs";
import { join } from "path";
import { buildApis } from "./build";

// ANSI Colors
const cyan = "\x1b[36m";
const reset = "\x1b[0m";

const BACKEND_API_DIR = "system/src/server/api";
const watchPath = join(process.cwd(), BACKEND_API_DIR);

export function watchApis() {
  // Initial generation
  buildApis();

  // Watch for changes
  watch(watchPath, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".ts")) {
      console.log(`${cyan}API change detected in: ${filename}${reset}`);
      buildApis();
    }
  });
}

// If running directly, start watching
if (import.meta.main) {
  watchApis();
}
