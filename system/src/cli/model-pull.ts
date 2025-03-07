import { sql } from "bun";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify } from "yaml";

export async function modelPull() {
  const connectionString = Bun.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment");
    process.exit(1);
  }

  // Add sslmode=prefer to connection URL
  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "prefer");

  console.log("Connecting to:", url.toString());

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log("✅ Connected to database");

    // Get all tables and their columns
    const tablesAndColumns = await sql`
      WITH pk_columns AS (
        SELECT 
          tc.table_name,
          kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = 'public'
      )
      SELECT 
        t.table_name,
        c.column_name,
        c.data_type,
        c.column_default,
        c.is_nullable,
        tc.constraint_type,
        col_description(t.table_name::regclass, c.ordinal_position) as column_comment,
        CASE WHEN pk.column_name IS NOT NULL THEN true ELSE false END as is_primary
      FROM information_schema.tables t
      LEFT JOIN information_schema.columns c 
        ON t.table_name = c.table_name AND t.table_schema = c.table_schema
      LEFT JOIN information_schema.constraint_column_usage ccu 
        ON c.column_name = ccu.column_name 
        AND c.table_name = ccu.table_name
        AND t.table_schema = ccu.table_schema
      LEFT JOIN information_schema.table_constraints tc 
        ON tc.constraint_name = ccu.constraint_name
      LEFT JOIN pk_columns pk
        ON t.table_name = pk.table_name AND c.column_name = pk.column_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position;
    `;

    // Get foreign key relationships
    const relations = await sql`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu 
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `;

    // Map PostgreSQL types to model types
    function mapType(pgType: string): string {
      const typeMap: Record<string, string> = {
        text: "text",
        "character varying": "text",
        integer: "number",
        bigint: "number",
        boolean: "boolean",
        uuid: "uuid",
        "timestamp with time zone": "datetime",
        "timestamp without time zone": "datetime",
        date: "datetime",
        jsonb: "json",
        json: "json",
        ARRAY: "array",
      };
      return typeMap[pgType] || "text";
    }

    // Group columns by table
    const tableMap = new Map<string, any>();
    for (const row of tablesAndColumns) {
      const cleanTableName = row.table_name.replace(/^[a-z]_/, "");
      if (!tableMap.has(cleanTableName)) {
        tableMap.set(cleanTableName, {
          table: row.table_name, // Keep original table name for DB operations
          columns: {},
          relations: {},
        });
      }

      const table = tableMap.get(cleanTableName);
      if (row.column_name) {
        const columnDef: any = {
          type: mapType(row.data_type),
        };

        if (row.is_primary) {
          columnDef.primary = true;
        }

        if (row.column_default !== null) {
          // Clean up default value
          let defaultValue = row.column_default;

          // Skip gen_random_uuid() default for primary UUID columns
          if (
            defaultValue.startsWith("gen_random_uuid()") &&
            columnDef.type === "uuid" &&
            row.is_primary
          ) {
            // Don't set default
          } else {
            // Preserve function calls like now()
            if (defaultValue === "now()") {
              columnDef.default = defaultValue;
            } else if (defaultValue.includes("'::")) {
              // Clean up enum/text defaults that come with type casting
              defaultValue = defaultValue.split("'::")[0].replace(/^'|'$/g, "");
              columnDef.default = defaultValue;
            } else {
              columnDef.default = defaultValue;
            }
          }
        }

        // Extract enum values from column comment if present
        if (row.column_comment) {
          const match = row.column_comment.match(/^enum:\((.*?)\)$/);
          if (match) {
            columnDef.type = "enum";
            columnDef.values = match[1].split(",");
          }
        }

        // Simplify column definition if it only has type
        if (Object.keys(columnDef).length === 1 && columnDef.type) {
          table.columns[row.column_name] = columnDef.type;
        } else {
          table.columns[row.column_name] = columnDef;
        }
      }
    }

    // Add relations and remove relation columns from columns object
    for (const relation of relations) {
      const cleanTableName = relation.table_name.replace(/^[a-z]_/, "");
      const cleanForeignTableName = relation.foreign_table_name.replace(
        /^[a-z]_/,
        ""
      );

      // Add belongs_to to the source table (table with foreign key)
      const sourceTable = tableMap.get(cleanTableName);
      if (sourceTable) {
        if (!sourceTable.relations) {
          sourceTable.relations = {};
        }
        delete sourceTable.columns[relation.column_name];

        // Generate relation name based on the foreign key column
        const relationName = relation.column_name.startsWith("id_")
          ? relation.column_name.substring(3)
          : relation.column_name;

        sourceTable.relations[relationName] = {
          type: "belongs_to",
          from: relation.column_name,
          to: `${cleanForeignTableName}.${relation.foreign_column_name}`,
        };
      }

      // Add has_many to the target table (referenced table)
      const targetTable = tableMap.get(cleanForeignTableName);
      if (targetTable) {
        if (!targetTable.relations) {
          targetTable.relations = {};
        }

        // Generate relation name for has_many based on the source table
        // Prioritize using just the model name before falling back to model name + column
        const relationName = cleanTableName;

        targetTable.relations[relationName] = {
          type: "has_many",
          from: relation.foreign_column_name,
          to: `${cleanTableName}.${relation.column_name}`,
        };
      }
    }

    // Create model files
    const modelsDir = join(process.cwd(), "shared/models");

    for (const [tableName, model] of tableMap.entries()) {
      const modelDir = join(modelsDir, tableName);
      const modelPath = join(modelDir, "model.yml");

      // Create directory if it doesn't exist
      await mkdir(modelDir, { recursive: true });

      // Write model file
      await writeFile(
        modelPath,
        stringify(model, {
          indent: 2,
        })
      );
      console.log(`✅ Generated model for: ${tableName}`);
    }

    console.log("\n✅ Successfully pulled database schema");
  } catch (error) {
    console.error("Failed to pull database schema:", error);
    process.exit(1);
  }
}
