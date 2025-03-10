#!/usr/bin/env bun
import { readdirSync, watch, writeFileSync } from "fs";
import { join, parse } from "path";

const PAGES_DIR = join(process.cwd(), "frontend/src/pages");
const ROUTES_FILE = join(process.cwd(), "frontend/src/lib/generated/routes.ts");

function generateRoutes(dir: string, base = ""): Record<string, string> {
  const routes: Record<string, string> = {};
  const files = readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const path = join(dir, file.name);
    if (file.isDirectory()) {
      Object.assign(routes, generateRoutes(path, join(base, file.name)));
    } else {
      const { name, ext } = parse(file.name);
      if (ext === ".tsx") {
        let route = join(base, name === "index" ? "." : name).replace(
          /\\/g,
          "/"
        );
        route =
          route === "." ? "/" : route.startsWith("/") ? route : `/${route}`;
        routes[route] = `@/pages${route === "/" ? "" : route}`;
      }
    }
  }

  return routes;
}

function updateRoutesFile() {
  const routes = generateRoutes(PAGES_DIR);
  const content = `// Create a mapping of paths to modules
export const pageModules: Record<string, () => Promise<any>> = {
${Object.entries(routes)
  .map(([route, path]) => `  "${route}": () => import("${path}"),`)
  .join("\n")}
};`;

  writeFileSync(ROUTES_FILE, content);
}

export function buildRoutes() {
  updateRoutesFile();
}

export function watchPageRoutes() {
  // Initial generation
  updateRoutesFile();

  // Watch for changes
  watch(PAGES_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith(".tsx")) {
      console.log(`Change detected in: ${filename}`);
      updateRoutesFile();
    }
  });
}

// If running directly, start watching
if (import.meta.main) {
  watchPageRoutes();
}
