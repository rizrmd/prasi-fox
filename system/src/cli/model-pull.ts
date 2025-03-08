import { sql } from "bun";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { stringify } from "yaml";

// Types for better type safety
type TableColumn = {
  table_name: string;
  column_name: string;
  data_type: string;
  column_default: string | null;
  is_nullable: string;
  constraint_type: string | null;
  column_comment: string | null;
  is_primary: boolean;
};

type TableRelation = {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
  constraint_comment: string | null;
};

type ModelColumn = {
  type: string;
  primary?: boolean;
  required?: boolean;
  default?: string;
  comment?: string;
  values?: string[];
};

type ModelRelation = {
  type: string;
  from: string;
  to: string;
  comment?: string;
};

type TableModel = {
  table: string;
  columns: Record<string, string | ModelColumn>;
  relations: Record<string, ModelRelation>;
};

type LabelData = {
  title: string;
  record_title: string[];
  labels: Record<string, (string | number)[]>;
};

// Configuration for the pull operation
const CONFIG = {
  MAX_RELATIONS_PER_TABLE: 1000,
  EXCLUDED_FIELDS: [
    "id",
    "created_at",
    "created_by",
    "updated_at",
    "updated_by",
    "deleted_at",
  ],
};

// Maps PostgreSQL types to model types
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

// Initialize database connection with proper settings
async function initDbConnection(connectionString: string) {
  // Add sslmode=prefer to connection URL
  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "prefer");

  console.log("Connecting to:", url.host);

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log("✅ Connected to database");

    // Set statement timeout to 60 seconds to prevent hanging on slow queries
    await sql`SET statement_timeout = 60000`;
    // console.log("Set statement timeout to 60 seconds");

    return url;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
}

// Fetch all tables and their columns
async function fetchTablesAndColumns(): Promise<TableColumn[]> {
  // console.log("Fetching tables and columns...");
  try {
    const tablesAndColumns = await sql`
      WITH pk_columns AS (
        SELECT 
          a.attrelid::regclass AS table_name,
          a.attname AS column_name
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indisprimary
      ),
      column_comments AS (
        SELECT 
          c.table_name,
          c.column_name,
          pg_catalog.col_description(
            ('"' || c.table_schema || '"."' || c.table_name || '"')::regclass, 
            c.ordinal_position
          ) as column_comment
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
      )
      SELECT 
        t.table_name, 
        c.column_name,
        c.data_type,
        c.column_default,
        c.is_nullable,
        tc.constraint_type,
        cc.column_comment,
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
        ON t.table_name::text = pk.table_name::text AND c.column_name = pk.column_name
      LEFT JOIN column_comments cc
        ON c.table_name = cc.table_name AND c.column_name = cc.column_name
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name, c.ordinal_position;
    `;
    return tablesAndColumns as TableColumn[];
  } catch (error) {
    console.error("Failed to fetch tables and columns:", error);
    throw error;
  }
}

// Fetch foreign key relationships for tables
async function fetchRelations(tableNames: string[]): Promise<TableRelation[]> {
  try {
    // Format the table names as a PostgreSQL array
    const tableNamesArray = `${tableNames
      .map((name) => `('${name})'`)
      .join(",")}`;

    // Fetch all foreign key relationships in a single query
    const allRelations = await sql.unsafe(`
-- This query uses system catalogs directly without information_schema
SELECT
    source_rel.relname AS table_name,
    source_att.attname AS column_name,
    target_rel.relname AS foreign_table_name,
    target_att.attname AS foreign_column_name
FROM
    pg_constraint con
JOIN
    pg_class source_rel ON con.conrelid = source_rel.oid
JOIN
    pg_class target_rel ON con.confrelid = target_rel.oid
JOIN
    pg_attribute source_att ON 
        source_att.attrelid = source_rel.oid AND
        source_att.attnum = ANY(con.conkey)
JOIN
    pg_attribute target_att ON 
        target_att.attrelid = target_rel.oid AND
        target_att.attnum = ANY(con.confkey)
JOIN
    pg_namespace ns ON source_rel.relnamespace = ns.oid
WHERE
    con.contype = 'f' AND -- foreign key constraint
    ns.nspname = 'public' AND -- public schema
    array_position(con.conkey, source_att.attnum) = array_position(con.confkey, target_att.attnum)
ORDER BY
    source_rel.relname, source_att.attname;
 `);

    console.log(
      `Retrieved ${allRelations.length} rows for foreign key relationships`
    );

    return allRelations as TableRelation[];
  } catch (error) {
    console.error("Failed to fetch relations:", error);
    throw error;
  }
}

// Process table columns into model structure
function processTableColumns(
  tablesAndColumns: TableColumn[]
): Map<string, TableModel> {
  // console.log("Processing table columns...");
  const tableMap = new Map<string, TableModel>();

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
    if (table && row.column_name) {
      const columnDef: ModelColumn = {
        type: mapType(row.data_type),
      };

      if (row.is_primary) {
        columnDef.primary = true;
      }

      // Set required field when is_nullable is 'NO'
      if (row.is_nullable === "NO") {
        columnDef.required = true;
      }

      // Process default value
      if (row.column_default !== null) {
        processColumnDefault(columnDef, row.column_default);
      }

      // Process column comments and enums
      if (row.column_comment) {
        processColumnComment(columnDef, row.column_comment);
      }

      // Simplify column definition if it only has type
      if (Object.keys(columnDef).length === 1 && columnDef.type) {
        table.columns[row.column_name] = columnDef.type;
      } else {
        table.columns[row.column_name] = columnDef;
      }
    }
  }

  return tableMap;
}

// Process column default value
function processColumnDefault(
  columnDef: ModelColumn,
  defaultValue: string
): void {
  // Skip gen_random_uuid() default for primary UUID columns
  if (
    defaultValue.startsWith("gen_random_uuid()") &&
    columnDef.type === "uuid" &&
    columnDef.primary
  ) {
    return; // Don't set default
  }

  // Preserve function calls like now()
  if (defaultValue === "now()") {
    columnDef.default = defaultValue;
  } else if (defaultValue.includes("'::")) {
    // Clean up enum/text defaults that come with type casting
    const cleanValue = defaultValue.split("'::")[0]?.replace(/^'|'$/g, "");
    columnDef.default = cleanValue;
  } else {
    columnDef.default = defaultValue;
  }
}

// Process column comments and extract enums if present
function processColumnComment(columnDef: ModelColumn, comment: string): void {
  const match = comment.match(/^enum:\((.*?)\)(.*)$/);
  if (match) {
    columnDef.type = "enum";
    columnDef.values = match[1]?.split(",");
    // Preserve any comment text after the enum definition
    if (match[2] && match[2].trim()) {
      columnDef.comment = match[2].trim();
    }
  } else {
    // For non-enum fields, preserve the comment as is
    columnDef.comment = comment;
  }
}

// Process relationships and add to table models
function processRelationships(
  relations: TableRelation[],
  tableMap: Map<string, TableModel>
): void {
  for (const relation of relations) {
    const cleanTableName = relation.table_name.replace(/^[a-z]_/, "");
    const cleanForeignTableName = relation.foreign_table_name.replace(
      /^[a-z]_/,
      ""
    );

    // Add belongs_to to the source table (table with foreign key)
    const sourceTable = tableMap.get(cleanTableName);
    if (sourceTable) {
      // Remove relation column from columns object
      if (relation.column_name in sourceTable.columns) {
        delete sourceTable.columns[relation.column_name];
      }

      // Generate relation name based on the foreign key column
      const relationName = relation.column_name.startsWith("id_")
        ? relation.column_name.substring(3)
        : relation.column_name;

      const relationDef: ModelRelation = {
        type: "belongs_to",
        from: relation.column_name,
        to: `${cleanForeignTableName}.${relation.foreign_column_name}`,
      };

      // Add comment if it exists
      if (relation.constraint_comment) {
        relationDef.comment = relation.constraint_comment;
      }

      sourceTable.relations[relationName] = relationDef;
    }

    // Add has_many to the target table (referenced table)
    const targetTable = tableMap.get(cleanForeignTableName);
    if (targetTable) {
      const relationName = cleanTableName;

      targetTable.relations[relationName] = {
        type: "has_many",
        from: relation.foreign_column_name,
        to: `${cleanTableName}.${relation.column_name}`,
      };
    }
  }
}

// Generate and write model files
async function writeModelFiles(
  tableMap: Map<string, TableModel>
): Promise<void> {
  const modelsDir = join(process.cwd(), "shared/models");

  for (const [tableName, model] of tableMap.entries()) {
    // console.log(`Processing table: ${tableName}`);
    const modelDir = join(modelsDir, tableName);
    const modelPath = join(modelDir, "model.yml");
    const labelPath = join(modelDir, "label.yml");

    try {
      // Create directory if it doesn't exist
      await mkdir(modelDir, { recursive: true });

      // Write model file
      await writeFile(
        modelPath,
        stringify(model, {
          indent: 2,
        })
      );

      // Generate and write label file
      const labelData = generateLabelData(tableName, model);
      await writeLabelFile(labelPath, labelData);
      console.log(`✅ Generated: ${tableName}`);
    } catch (error) {
      console.error(`Failed to write model files for ${tableName}:`, error);
      // Continue with next table instead of failing entire operation
    }
  }
}

// Generate label data for a table
function generateLabelData(tableName: string, model: TableModel): LabelData {
  // Generate label data
  const labelData: LabelData = {
    title:
      tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_/g, " "),
    record_title: findRecordTitleFields(model),
    labels: {},
  };

  // Track the index for labels
  let labelIndex = 1;

  // Create labels for columns
  Object.entries(model.columns)
    .filter(([colName]) => !CONFIG.EXCLUDED_FIELDS.includes(colName))
    .forEach(([colName, colDef]) => {
      const displayName = formatDisplayName(colName);

      // Check if field is required
      let isRequired = false;
      if (typeof colDef === "object" && colDef !== null) {
        isRequired =
          "default" in colDef === false && !colName.startsWith("id_");
      }

      // Add to labelData.labels
      labelData.labels[colName] = isRequired
        ? [labelIndex, displayName, "required"]
        : [labelIndex, displayName];

      labelIndex++;
    });

  // Add relations to labels
  if (model.relations) {
    Object.entries(model.relations).forEach(([relationName, relationDef]) => {
      const displayName = formatDisplayName(relationName);
      labelData.labels[relationName] = [labelIndex, displayName];
      labelIndex++;
    });
  }

  return labelData;
}

// Find appropriate fields for record_title
function findRecordTitleFields(model: TableModel): string[] {
  const eligibleFields = Object.keys(model.columns)
    .filter((col) => {
      // Never include excluded fields
      if (CONFIG.EXCLUDED_FIELDS.includes(col)) {
        return false;
      }

      // Check if the column type is text or uuid
      return typeof model.columns[col] === "string"
        ? ["text", "uuid"].includes(model.columns[col] as string)
        : ["text", "uuid"].includes((model.columns[col] as ModelColumn).type);
    })
    .slice(0, 2);

  if (eligibleFields.length > 0) {
    return eligibleFields;
  }

  // If no eligible fields found
  return [];
}

// Format a field name for display (e.g., "user_name" -> "User Name")
function formatDisplayName(fieldName: string): string {
  return fieldName
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Write label file with proper YAML formatting
async function writeLabelFile(
  labelPath: string,
  labelData: LabelData
): Promise<void> {
  // Convert to YAML
  let yamlString = stringify(labelData, { indent: 2 });

  // Process the YAML string to convert block arrays to flow style (square brackets)
  const lines = yamlString.split("\n");
  let inArray = false;
  let arrayIndent = 0;
  let arrayKey = "";
  let arrayItems: string[] = [];

  const outputLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue; // Skip empty lines

    // Check if this line starts a new array
    const arrayStart = line.match(/^(\s*)(\w+):\s*$/);
    if (
      arrayStart &&
      i + 1 < lines.length &&
      lines[i + 1]?.trimStart().startsWith("- ")
    ) {
      // This is the start of an array
      arrayKey = arrayStart[2] || "";
      arrayIndent = (arrayStart[1] || "").length;
      inArray = true;
      arrayItems = [];
      continue;
    }

    // If we're in an array and this line is an array item
    if (inArray && line.trimStart().startsWith("- ")) {
      // Extract the item value
      const itemValue = line.trimStart().substring(2);
      arrayItems.push(itemValue);

      // Check if next line is not an array item or end of file
      if (
        i + 1 >= lines.length ||
        !lines[i + 1]?.trimStart().startsWith("- ")
      ) {
        // End of array, output with square brackets
        const indent = " ".repeat(arrayIndent);
        outputLines.push(`${indent}${arrayKey}: [${arrayItems.join(", ")}]`);
        inArray = false;
      }

      continue;
    }

    // Regular line, just output it
    if (!inArray) {
      outputLines.push(line);
    }
  }

  await writeFile(labelPath, outputLines.join("\n"));
}

// Main function to pull models from database
export async function modelPull() {
  console.log("Starting model pull...");
  const connectionString = Bun.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment");
    process.exit(1);
  }

  // Configuration options
  const dryRun = process.argv.includes("--dry-run");

  if (dryRun) {
    console.log("🔍 DRY RUN MODE: No files will be written");
  }

  try {
    // Initialize database connection
    await initDbConnection(connectionString);

    // Fetch tables and columns
    const tablesAndColumns = await fetchTablesAndColumns();

    // Get a list of unique table names
    const tableNames = [
      ...new Set(tablesAndColumns.map((row) => row.table_name)),
    ];
    console.log(`Found ${tableNames.length} unique tables`);

    // Fetch foreign key relationships
    const relations = await fetchRelations(tableNames);

    // Process table columns into model structure
    const tableMap = processTableColumns(tablesAndColumns);

    // Process relationships
    processRelationships(relations, tableMap);

    // Write model files
    if (!dryRun) {
      await writeModelFiles(tableMap);
      console.log("\n✅ Successfully pulled database schema");
    } else {
      console.log(
        "\n✅ Dry run completed successfully. No files were written."
      );
      // Print a summary of what would have been created
      console.log(
        `Would have created ${tableMap.size} model files and their corresponding label files.`
      );
    }
  } catch (error) {
    console.error("Failed to pull database schema:", error);
    process.exit(1);
  }
}
