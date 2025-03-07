import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parse } from "yaml";
import { writeFileSync } from "fs";

type YAMLColumn = {
  type?: string;
  primary?: boolean;
  default?: string;
};

type YAMLRelation = {
  type: string;
  from: string;
  to: string;
};

type YAMLModel = {
  table: string;
  columns: Record<string, string | YAMLColumn>;
  relations: Record<string, YAMLRelation>;
};

const generateModel = () => {
  const modelsDir = join(process.cwd(), "shared", "models");
  const outputDir = join(process.cwd(), "shared", "generated", "models");

  // Read all directories in models folder
  const modelDirs = readdirSync(modelsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const modelDir of modelDirs) {
    const modelPath = join(modelsDir, modelDir, "model.yml");
    try {
      const yamlContent = readFileSync(modelPath, "utf8");
      const model = parse(yamlContent) as YAMLModel;

      // Generate TypeScript model
      let tsContent = `import type { ModelBase } from "system/model/base";

export const ${modelDir} = {
  table: "${model.table}",
  columns: {
`;

      // Add columns
      for (const [columnName, columnDef] of Object.entries(model.columns)) {
        if (typeof columnDef === "string") {
          tsContent += `    ${columnName}: { type: "${columnDef}" },\n`;
        } else {
          const column = columnDef as YAMLColumn;
          tsContent += `    ${columnName}: { type: "${column.type || "text"}"`;
          if (column.primary) tsContent += ", primary: true";
          if (column.default) tsContent += `, default: "${column.default}"`;
          tsContent += " },\n";
        }
      }

      tsContent += "  },\n  relations: {\n";

      // Add relations
      for (const [relationName, relation] of Object.entries(model.relations || {})) {
        tsContent += `    ${relationName}: {
      type: "${relation.type}",
      from: "${relation.from}",
      to: "${relation.to}"
    },\n`;
      }

      tsContent += "  },\n} as const satisfies ModelBase;\n";

      // Write the generated model file
      const outputPath = join(outputDir, `${modelDir}.ts`);
      writeFileSync(outputPath, tsContent);

    } catch (error) {
      console.error(`Error processing ${modelDir}:`, error);
    }
  }
};

export default generateModel;