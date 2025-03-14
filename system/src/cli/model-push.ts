import { sql } from "bun";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { ColumnDefinition, ModelDefinition } from "system/model/types";
import { parse } from "yaml";
import { auditColumns } from "./model-utils";

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

// Format enum values as a comment string
function formatEnumComment(values: string[], comment?: string): string {
  return `enum:(${values.join(",")})${comment ? ' ' + comment : ''}`;
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
    
    // Add NOT NULL constraint for required fields
    if (def.required) {
      colDef += " NOT NULL";
    }
  }

  return colDef;
}

// Get comment SQL for column if it has a comment or enum values
function getColumnCommentSQL(
  tableName: string,
  columnName: string,
  def: string | ColumnDefinition
): string | null {
  if (typeof def === "object") {
    if (def.type === "enum" && Array.isArray(def.values)) {
      return `COMMENT ON COLUMN ${tableName}.${columnName} IS '${formatEnumComment(
        def.values,
        def.comment
      )}';`;
    } else if (def.comment) {
      // Handle regular comments for non-enum columns
      return `COMMENT ON COLUMN ${tableName}.${columnName} IS '${def.comment}';`;
    }
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
          // For foreign key columns, we'll add the column but without the constraint
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
  const processedTables = new Set<string>();

  function visit(tableName: string, model: ModelDefinition) {
    if (visited.has(tableName)) return;
    if (visiting.has(tableName)) {
      console.log(`⚠️  Circular dependency detected for table: ${tableName}`);
      // Don't mark as visited yet, we'll handle it in a separate pass
      return;
    }

    visiting.add(tableName);

    if (model.relations) {
      Object.entries(model.relations).forEach(([_, rel]) => {
        if (rel.type === "belongs_to") {
          const [refTable, refColumn] = rel.to.split(".");
          if (refTable && refColumn) {
            const refModel = models.get(refTable);
            if (refModel) {
              visit(refTable, refModel);
            }
          }
        }
      });
    }

    visiting.delete(tableName);
    visited.add(tableName);
    
    // Only add to sorted if we haven't processed this table yet
    if (!processedTables.has(tableName)) {
      sorted.push([tableName, model]);
      processedTables.add(tableName);
    }
  }

  // First pass: try to resolve dependencies naturally
  models.forEach((model, tableName) => {
    visit(tableName, model);
  });
  
  // Second pass: add any remaining tables (with circular dependencies)
  models.forEach((model, tableName) => {
    if (!processedTables.has(tableName)) {
      sorted.push([tableName, model]);
      processedTables.add(tableName);
    }
  });

  return sorted;
}

export async function modelPush() {
  const connectionString = Bun.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment");
    process.exit(1);
  }

  // Check if --skip-relations flag is present
  const skipRelations = process.argv.includes("--skip-relations");
  // Check if --dry-run flag is present
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE: No database changes will be made");
  }

  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "prefer");

  console.log("Connecting to:", url.host);

  try {
    await sql`SELECT 1`;
    console.log("✅ Connected to database");

    // Load model definitions first to calculate statistics
    const allModels = await loadModelFiles(
      join(process.cwd(), "shared/models")
    );
    const sortedModels = sortModels(allModels);
    
    // Calculate statistics from model definitions
    console.log("📊 Analyzing model definitions...");
    const uniqueTableCount = allModels.size;
    console.log(`Found ${uniqueTableCount} unique tables to be created`);
    
    // Count foreign key relationships
    let foreignKeyCount = 0;
    for (const [_, model] of allModels) {
      if (model.relations) {
        for (const [__, rel] of Object.entries(model.relations)) {
          if (rel.type === "belongs_to") {
            foreignKeyCount++;
          }
        }
      }
    }
    console.log(`Found ${foreignKeyCount} foreign key relationships to be created${skipRelations ? ' (will be skipped)' : ''}`);

    // Check for existing tables
    const existingTables = await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public';`;
    if (existingTables.length > 0) {
      console.warn(`⚠️ WARNING: ${existingTables.length} existing tables found. Dropping tables will result in DATA LOSS!`);
      
      // Skip confirmation in dry run mode
      if (!dryRun) {
        // Ask for confirmation
        const rl = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        const confirmation = await new Promise<string>((resolve) => {
          rl.question('Are you sure you want to continue? This will DELETE ALL DATA. Type "y" to continue: ', (answer: string) => {
            resolve(answer);
            rl.close();
          });
        });
        
        if (confirmation.toLowerCase() !== 'y' && confirmation.toLowerCase() !== 'yes') {
          console.log('Operation cancelled.');
          process.exit(0);
        }
      } else {
        console.log("DRY RUN: Would normally ask for confirmation to delete existing tables");
      }
    }

    if (dryRun) {
      console.log("🗑️  DRY RUN: Would drop existing tables...");
    } else {
      console.log("🗑️  Dropping existing tables...");
      await dropAllTables();
    }

    console.log(`📚 ${dryRun ? "Would create" : "Creating"} ${sortedModels.length} model(s)`);

    let updates = 0;
    const processedTables = new Set<string>();

    // Create a map of model names to their actual table names
    const tableNameMap = new Map<string, string>();
    for (const [_, model] of sortedModels) {
      tableNameMap.set(model.table.replace(/^[mt]_/, ""), model.table);
    }

    // First create all tables with their columns (no foreign keys yet)
    console.log(`📊 Phase 1: ${dryRun ? "Would create" : "Creating"} tables without foreign key constraints...`);
    
    if (!dryRun) {
      await sql.begin(async (tx) => {
        for (const [tableName, model] of sortedModels) {
          // Skip if we've already processed this table
          if (processedTables.has(tableName)) {
            console.log(`⏭️  Skipping duplicate table: ${tableName}`);
            continue;
          }
          
          // Create table with columns but without foreign key constraints
          const createTableSQL = generateUpdateSQL(
            model,
            tableNameMap,
            allModels
          );
          if (createTableSQL) {
            try {
              console.log(`📝 Creating table: ${tableName}`);
              await tx.unsafe(createTableSQL);
              processedTables.add(tableName);
              updates++;
            } catch (error) {
              console.error(`❌ Error creating table ${tableName}:`, error);
              throw error; // Re-throw to trigger transaction rollback
            }
          }
        }
      });
    } else {
      // In dry run mode, just show what would be done
      for (const [tableName, model] of sortedModels) {
        // Skip if we've already processed this table
        if (processedTables.has(tableName)) {
          console.log(`⏭️  Would skip duplicate table: ${tableName}`);
          continue;
        }
        
        // Create table with columns but without foreign key constraints
        const createTableSQL = generateUpdateSQL(
          model,
          tableNameMap,
          allModels
        );
        if (createTableSQL) {
          console.log(`📝 Would create table: ${tableName}`);
          console.log(`SQL that would be executed:\n${createTableSQL}`);
          processedTables.add(tableName);
          updates++;
        }
      }
    }

    // Then add all foreign key constraints unless --skip-relations flag is set
    if (!skipRelations) {
      console.log(`🔗 Phase 2: ${dryRun ? "Would add" : "Adding"} foreign key constraints...`);
      
      if (!dryRun) {
        await sql.begin(async (tx) => {
          for (const [tableName, model] of sortedModels) {
            if (model.relations) {
              for (const [relationName, rel] of Object.entries(model.relations)) {
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

                    const constraintName = `fk_${rel.from}_${refTable}`;
                    let sqlQuery = `ALTER TABLE ${model.table} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${rel.from}) REFERENCES ${actualRefTable}(${refColumn});`;
                    
                    // // Add comment to constraint if specified
                    // if (rel.comment) {
                    //   sqlQuery += `\nCOMMENT ON CONSTRAINT ${constraintName} ON ${model.table} IS '${rel.comment}';`;
                    // }
                    
                    try {
                      console.log(`🔗 Adding relation: ${tableName}.${relationName} -> ${refTable}`);
                      await tx.unsafe(sqlQuery);
                      updates++;
                    } catch (error) {
                      console.error(`❌ Error adding relation ${tableName}.${relationName} -> ${refTable}:`, error);
                      throw error; // Re-throw to trigger transaction rollback
                    }
                  }
                }
              }
            }
          }
        });
      } else {
        // In dry run mode, just show what would be done
        for (const [tableName, model] of sortedModels) {
          if (model.relations) {
            for (const [relationName, rel] of Object.entries(model.relations)) {
              if (rel.type === "belongs_to") {
                const [refTable, refColumn] = rel.to.split(".");
                if (refTable && refColumn) {
                  // Use the actual table name from our map
                  const actualRefTable = tableNameMap.get(refTable);
                  if (!actualRefTable) {
                    console.warn(
                      `⚠️ Could not find actual table name for ${refTable}, would skip relation`
                    );
                    continue;
                  }

                  const constraintName = `fk_${rel.from}_${refTable}`;
                  let sqlQuery = `ALTER TABLE ${model.table} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${rel.from}) REFERENCES ${actualRefTable}(${refColumn});`;
                  
                  console.log(`🔗 ${updates + 1} Would add relation: ${tableName}.${relationName} -> ${refTable}`);
                  console.log(`🔧 SQL that would be executed: ${sqlQuery}`);
                  updates++;
                }
              }
            }
          }
        }
      }
    } else {
      console.log(`🚫 Phase 2: ${dryRun ? "Would skip" : "Skipping"} foreign key constraints (--skip-relations flag set)`);
    }

    console.log(
      `\n✅ ${dryRun ? "Dry run completed. Would have applied" : "Successfully applied"} ${updates} schema update(s)${skipRelations ? ' (relations skipped)' : ' and constraints'}`
    );
  } catch (error) {
    console.error(`Failed to ${dryRun ? "simulate" : "update"} database schema:`, error);
    process.exit(1);
  }
}
