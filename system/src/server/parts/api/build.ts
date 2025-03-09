import { readdir } from "fs/promises";
import { camelCase, snakeCase } from "lodash";
import { join } from "path";

const BACKEND_API_DIR = "system/src/server/api";
const FRONTEND_API_FILE = "frontend/src/lib/generated/api.ts";
const BACKEND_GENERATED_API = "system/src/server/parts/api/index.ts";

async function scanAPIFiles() {
  const apiFiles: string[] = [];

  async function readDirRecursively(dir: string) {
    const entries = await readdir(join(process.cwd(), dir), {
      withFileTypes: true,
    });

    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        await readDirRecursively(path);
      } else if (entry.isFile() && entry.name.endsWith(".ts")) {
        apiFiles.push(path.replace(`${BACKEND_API_DIR}/`, ""));
      }
    }
  }

  await readDirRecursively(BACKEND_API_DIR);
  return apiFiles.filter((file) => file.endsWith(".ts"));
}

async function generateAPICode(apiFiles: string[]): Promise<string> {
  let imports = "";
  let apiObject = "";

  for (const file of apiFiles) {
    const name = file.replace(".ts", "");
    const camelName = camelCase(snakeCase(name));

    try {
      const module = await import(`system/server/api/${name}`);
      const { path, msgpack } = module.default;
      const opt =
        typeof msgpack === "boolean"
          ? `, { msgpack: ${JSON.stringify(msgpack)} }`
          : "";

      imports += `import type ${camelName} from "system/server/api/${name}";\n`;
      apiObject += `  ${camelName}: apiClient<typeof ${camelName}>("${path}"${opt}),\n`;
    } catch (error) {
      console.error(`Failed to import API file ${file}:`, error);
    }
  }

  return `// This file is auto-generated. Do not edit manually.
import { apiClient } from "system/api-client";
${imports}
export const api = {
${apiObject}};
`;
}

export async function buildApis() {
  const apiFiles = await scanAPIFiles();
  const generatedCode = await generateAPICode(apiFiles);

  // Generate frontend types
  await Bun.write(join(process.cwd(), FRONTEND_API_FILE), generatedCode);

  // Generate backend exports
  let backendExports = "";
  for (const file of apiFiles) {
    const name = file.replace(".ts", "");
    const camelName = camelCase(snakeCase(name));
    backendExports += `import ${camelName} from "system/server/api/${name}";\n`;
  }
  backendExports += `\nexport const api = { ${apiFiles
    .map((f) => camelCase(snakeCase(f.replace(".ts", ""))))
    .join(", ")} };\n`;

  await Bun.write(join(process.cwd(), BACKEND_GENERATED_API), backendExports);
}

if (import.meta.main) {
  buildApis().catch(console.error);
}
