import fs from "fs";
import path from "path";
import { parse } from "yaml";
import type { ModelBase } from "../model/base";
import type { RelationDefinition } from "../model/types";

const MODELS_DIR = path.join(process.cwd(), "shared", "models");
const GENERATED_DIR = path.join(process.cwd(), "shared", "generated", "models");
const MODELS_INDEX_FILE = path.join(
  process.cwd(),
  "shared",
  "generated",
  "models.ts"
);

const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const transformColumnType = (type: string): string => {
  const typeMap: Record<string, string> = {
    uuid: "uuid",
    text: "text",
    datetime: "datetime",
    json: "json",
    // Add more type mappings as needed
  };
  return typeMap[type] || type;
};

// Parse fields.yml to extract label information
const parseFieldsYaml = (modelDirPath: string) => {
  const fieldsPath = path.join(modelDirPath, "fields.yml");

  if (!fs.existsSync(fieldsPath)) {
    return {
      title: "",
      record_title: [],
      fields: [],
    };
  }

  try {
    const fieldsData = parse(fs.readFileSync(fieldsPath, "utf8"));
    const fields: Record<string, string[]>[] = [];

    if (fieldsData.fields && Array.isArray(fieldsData.fields)) {
      for (const field of fieldsData.fields) {
        if (typeof field === "object") {
          const fieldEntry = Object.entries(field)[0];
          if (fieldEntry && Array.isArray(fieldEntry[1])) {
            fields.push({ [fieldEntry[0]]: fieldEntry[1] });
          }
        }
      }
    }

    return {
      title: fieldsData.title || "",
      record_title: fieldsData.record_title || [],
      fields: fields,
    };
  } catch (error) {
    console.warn(
      `Warning: Could not parse fields.yml for model at ${modelDirPath}:`,
      error
    );
    return {
      title: "",
      record_title: [],
      fields: [],
    };
  }
};

const generateModelFile = (
  modelName: string,
  modelData: any,
  modelDirPath: string
) => {
  // Get label data from fields.yml
  const labelData = parseFieldsYaml(modelDirPath);

  const transformedModel: ModelBase = {
    table: modelData.table,
    columns: Object.entries(modelData.columns).reduce(
      (acc, [key, value]: [string, any]) => {
        acc[key] = {
          type:
            typeof value === "string"
              ? transformColumnType(value)
              : transformColumnType(value.type),
          default: typeof value === "string" ? undefined : value.default,
        };

        if (value.primary) {
          acc[key].primary = true;
        }

        return acc;
      },
      {} as Record<string, any>
    ),
    relations: modelData.relations || {},
    label: labelData,
  };

  const fileContent = `import type { ModelBase } from "system/model/base";

export const ${modelName} = ${JSON.stringify(
    transformedModel,
    null,
    2
  )} as const satisfies ModelBase;
`;

  const outputPath = path.join(GENERATED_DIR, `${modelName}.ts`);
  fs.writeFileSync(outputPath, fileContent);
};

const generateModelsIndex = (modelNames: string[]) => {
  const imports = modelNames
    .map((name) => `import { ${name} } from "./models/${name}";`)
    .join("\n");
  const exports = `export const models = { ${modelNames.join(", ")} };`;

  const fileContent = `${imports}\n\n${exports}\n`;
  fs.writeFileSync(MODELS_INDEX_FILE, fileContent);
};

export const modelGenerate = async () => {
  try {
    // Ensure output directory exists
    ensureDirectoryExists(GENERATED_DIR);

    // Read all model directories
    const modelDirs = fs.readdirSync(MODELS_DIR);
    const generatedModelNames: string[] = [];

    for (const dir of modelDirs) {
      const modelDirPath = path.join(MODELS_DIR, dir);
      const modelPath = path.join(modelDirPath, "model.yml");
      if (fs.existsSync(modelPath)) {
        const modelData = parse(fs.readFileSync(modelPath, "utf8"));
        generateModelFile(dir, modelData, modelDirPath);
        generatedModelNames.push(dir);
      }
    }

    // Generate the models index file
    generateModelsIndex(generatedModelNames);

    console.log(generatedModelNames.length + " Models generated successfully");
  } catch (error) {
    console.error("Error generating models:", error);
    throw error;
  }
};
