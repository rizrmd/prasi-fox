import { sql } from "bun";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ColumnDefinition, ModelDefinition } from "system/model/types";
import { parse } from "yaml";

// Load and parse model.yml files
async function loadModelFiles(
  modelsDir: string
): Promise<Map<string, ModelDefinition>> {
  const models = new Map<string, ModelDefinition>();

  try {
    const files = await readdir(modelsDir, { recursive: true });

    for (const filePath of files) {
      if (filePath.endsWith("model.yml")) {
        const fullPath = join(modelsDir, filePath);
        const content = await Bun.file(fullPath).text();
        const model = parse(content) as ModelDefinition;
        models.set(model.table, model);
      }
    }

    return models;
  } catch (error) {
    console.error("Failed to load model files:", error);
    process.exit(1);
  }
}

// Drop all existing tables
async function dropAllTables(): Promise<void> {
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;

  await sql.begin(async (tx) => {
    for (const table of tables) {
      await tx.unsafe(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE;`);
    }
  });
}

// Format column definition
// Format enum values as a comment string
function formatEnumComment(values: string[]): string {
  return `enum:(${values.join(",")})`;
}

function formatColumn(name: string, def: string | ColumnDefinition): string {
  let colDef = `${name} `;

  if (typeof def === "string") {
    colDef += mapType(def);
  } else {
    colDef += mapType(def.type);
    if (def.primary) colDef += " PRIMARY KEY";
    if (def.default) {
      if (typeof def.default === "string") {
        // Don't quote SQL function calls like now()
        if (def.default.endsWith("()")) {
          colDef += ` DEFAULT ${def.default}`;
        } else if (def.type !== "uuid") {
          colDef += ` DEFAULT '${def.default}'`;
        } else {
          colDef += ` DEFAULT ${def.default}`;
        }
      }
    } else if (def.primary && def.type === "uuid") {
      colDef += ` DEFAULT gen_random_uuid()`;
    }
  }

  return colDef;
}

// Get comment SQL for column if it has enum values
function getColumnCommentSQL(
  tableName: string,
  columnName: string,
  def: string | ColumnDefinition
): string | null {
  if (
    typeof def === "object" &&
    def.type === "enum" &&
    Array.isArray(def.values)
  ) {
    return `COMMENT ON COLUMN ${tableName}.${columnName} IS '${formatEnumComment(
      def.values
    )}';`;
  }
  return null;
}

// Get column type from referenced table
function getReferencedColumnType(
  models: Map<string, ModelDefinition>,
  tableName: string,
  columnName: string
): string | null {
  const model = models.get(tableName);
  if (!model) return null;

  const column = model.columns[columnName];
  if (!column) return null;

  return typeof column === "string" ? column : column.type;
}

// Generate SQL for schema updates
function generateUpdateSQL(
  modelDef: ModelDefinition,
  tableNameMap: Map<string, string>,
  allModels: Map<string, ModelDefinition>
): string {
  const sql = [];
  const columns = new Map<string, string | ColumnDefinition>();

  // First, copy all defined columns
  Object.entries(modelDef.columns).forEach(([name, def]) => {
    columns.set(name, def);
  });

  // Add audit columns if they don't exist
  const auditColumns = {
    created_date: { type: "datetime", default: "now()" },
    created_by: "uuid",
    updated_date: { type: "datetime", default: "now()" },
    updated_by: "uuid",
    deleted_at: "datetime",
  };

  for (const [name, def] of Object.entries(auditColumns)) {
    if (!columns.has(name)) {
      columns.set(name, def);
    }
  }

  // Add foreign key columns from belongs_to relations
  if (modelDef.relations) {
    Object.entries(modelDef.relations).forEach(([_, rel]) => {
      if (rel.type === "belongs_to") {
        const [refTable, refColumn] = rel.to.split(".");

        if (!refTable || !refColumn) return;
        // Get referenced column type using the actual table name from the map
        const actualRefTable = tableNameMap.get(refTable);
        const refType = getReferencedColumnType(
          allModels,
          actualRefTable || refTable,
          refColumn
        );
        if (refType) {
          columns.set(rel.from, refType);
        }
      }
    });
  }

  // Create table with all columns including foreign keys
  sql.push(`CREATE TABLE ${modelDef.table} (`);
  const columnEntries = Array.from(columns.entries());
  const columnDefs = columnEntries.map(([name, def], index) => {
    const colDef = formatColumn(name, def);
    return `  ${colDef}${index < columnEntries.length - 1 ? "," : ""}`;
  });

  sql.push(columnDefs.join("\n"));
  sql.push(");\n");

  // Add comments for enum columns
  for (const [name, def] of columns.entries()) {
    const commentSQL = getColumnCommentSQL(modelDef.table, name, def);
    if (commentSQL) {
      sql.push(commentSQL);
    }
  }

  return sql.join("\n");
}

// Map model types to PostgreSQL types
function mapType(type: string): string {
  const typeMap: Record<string, string> = {
    text: "TEXT",
    number: "INTEGER",
    uuid: "UUID",
    boolean: "BOOLEAN",
    enum: "TEXT",
    datetime: "TIMESTAMP WITH TIME ZONE",
    timestamptz: "TIMESTAMP WITH TIME ZONE",
    json: "json",
    jsonb: "jsonb",
    array: "TEXT[]",
  };

  return typeMap[type] || "TEXT";
}

// Sort models to ensure tables with foreign keys are created after their dependencies
function sortModels(
  models: Map<string, ModelDefinition>
): [string, ModelDefinition][] {
  const sorted: [string, ModelDefinition][] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(tableName: string, model: ModelDefinition) {
    if (visited.has(tableName)) return;
    if (visiting.has(tableName)) {
      console.log(`⚠️  Circular dependency detected for table: ${tableName}`);
      visited.add(tableName);
      return;
    }

    visiting.add(tableName);

    if (model.relations) {
      for (const [_, rel] of Object.entries(model.relations)) {
        if (rel.type === "belongs_to") {
          const [refTable] = rel.to.split(".");
          if (!refTable) continue;
          const actualRefTable = models.get(refTable)?.table || refTable; // Use actual table name
          if (
            actualRefTable &&
            models.has(actualRefTable) &&
            !visited.has(actualRefTable)
          ) {
            visit(actualRefTable, models.get(actualRefTable)!);
          }
        }
      }
    }

    visiting.delete(tableName);
    visited.add(tableName);
    sorted.push([tableName, model]);
  }

  for (const [tableName, model] of models.entries()) {
    if (!visited.has(tableName)) {
      visit(tableName, model);
    }
  }

  return sorted;
}

export async function modelPush() {
  const connectionString = Bun.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment");
    process.exit(1);
  }

  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "prefer");

  console.log("🔌 Connecting to database...");

  try {
    await sql`SELECT 1`;
    console.log("✅ Connected to database");

    console.log("🗑️  Dropping existing tables...");
    await dropAllTables();

    const allModels = await loadModelFiles(
      join(process.cwd(), "shared/models")
    );
    const sortedModels = sortModels(allModels);
    console.log(`📚 Found ${sortedModels.length} model(s)`);

    let updates = 0;

    // Create a map of model names to their actual table names
    const tableNameMap = new Map<string, string>();
    for (const [_, model] of sortedModels) {
      tableNameMap.set(model.table.replace(/^[mt]_/, ""), model.table);
    }

    // First create all tables with their columns (no foreign keys yet)
    await sql.begin(async (tx) => {
      for (const [tableName, model] of sortedModels) {
        // Create table with columns but without foreign key constraints
        const createTableSQL = generateUpdateSQL(
          model,
          tableNameMap,
          allModels
        );
        if (createTableSQL) {
          console.log(`📝 Creating table: ${tableName}`);
          await tx.unsafe(createTableSQL);
          updates++;
        }
      }
    });

    // Then add all foreign key constraints
    await sql.begin(async (tx) => {
      for (const [tableName, model] of sortedModels) {
        if (model.relations) {
          for (const [_, rel] of Object.entries(model.relations)) {
            if (rel.type === "belongs_to") {
              const [refTable, refColumn] = rel.to.split(".");
              if (refTable && refColumn) {
                // Use the actual table name from our map
                const actualRefTable = tableNameMap.get(refTable);
                if (!actualRefTable) {
                  console.warn(
                    `⚠️ Could not find actual table name for ${refTable}, skipping relation`
                  );
                  continue;
                }

                const alterQuery = `ALTER TABLE ${model.table} ADD CONSTRAINT fk_${rel.from}_${refTable} FOREIGN KEY (${rel.from}) REFERENCES ${actualRefTable}(${refColumn});`;
                console.log(`🔗 Adding relation: ${tableName} -> ${refTable}`);
                await tx.unsafe(alterQuery);
                updates++;
              }
            }
          }
        }
      }
    });

    console.log(
      `\n✅ Successfully applied ${updates} schema update(s) and constraints`
    );
  } catch (error) {
    console.error("Failed to update database schema:", error);
    process.exit(1);
  }
}
