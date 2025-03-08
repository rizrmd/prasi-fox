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
      const labelPath = join(modelDir, "label.yml");

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
      
      // Define fields to exclude from various sections
      const excludeFromRecordTitle = ['id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'];
      const excludeFromLabels = ['id', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at'];
      
      // Generate label data
      const labelData: {
        title: string;
        record_title: string[];
        labels: Record<string, (string | number)[]>;
      } = {
        title: tableName.charAt(0).toUpperCase() + tableName.slice(1).replace(/_/g, ' '),
        // Ensure record_title never includes 'id'
        record_title: Object.keys(model.columns)
          .filter(col => {
            // Never include id and other excluded fields
            if (col === 'id' || excludeFromRecordTitle.includes(col)) {
              return false;
            }
            
            // Check if the column type is text or uuid
            return typeof model.columns[col] === 'string' ? 
              ['text', 'uuid'].includes(model.columns[col]) : 
              ['text', 'uuid'].includes(model.columns[col].type);
          })
          .slice(0, 2),
        labels: {}
      };
      
      // If record_title is empty after filtering, add the first eligible field
      if (labelData.record_title.length === 0) {
        const firstEligibleField = Object.keys(model.columns)
          .filter(col => {
            // Never include id and other excluded fields
            if (col === 'id' || excludeFromRecordTitle.includes(col)) {
              return false;
            }
            
            // Check if the column type is text or uuid
            return typeof model.columns[col] === 'string' ? 
              ['text', 'uuid'].includes(model.columns[col]) : 
              ['text', 'uuid'].includes(model.columns[col].type);
          })[0];
          
        if (firstEligibleField) {
          labelData.record_title = [firstEligibleField];
        }
      }
      
      // Track the index for labels
      let labelIndex = 1;
      
      // Create labels for columns with array values
      Object.entries(model.columns)
        .filter(([colName]) => !excludeFromLabels.includes(colName))
        .forEach(([colName, colDef]) => {
          const displayName = colName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
            
          // Check if field is required
          let isRequired = false;
          if (typeof colDef === 'object' && colDef !== null) {
            isRequired = 'default' in colDef === false && !colName.startsWith('id_');
          }
          
          // Add to labelData.labels
          labelData.labels[colName] = isRequired ? 
            [labelIndex, displayName, 'required'] : 
            [labelIndex, displayName];
            
          labelIndex++;
        });
        
      // Add relations to labels
      if (model.relations) {
        Object.entries(model.relations).forEach(([relationName, relationDef]) => {
          // Format the display name for relation
          const displayName = relationName
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Add the relation to labels
          labelData.labels[relationName] = [labelIndex, displayName];
          labelIndex++;
        });
      }
      
      // Convert to YAML
      let yamlString = stringify(labelData, { indent: 2 });
      
      // Process the YAML string to convert block arrays to flow style (square brackets)
      const lines = yamlString.split('\n');
      let inArray = false;
      let arrayIndent = 0;
      let arrayKey = '';
      let arrayItems: string[] = [];
      
      const outputLines: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue; // Skip empty lines
        
        // Check if this line starts a new array
        const arrayStart = line.match(/^(\s*)(\w+):\s*$/);
        if (arrayStart && i + 1 < lines.length && lines[i + 1]?.trimStart().startsWith('- ')) {
          // This is the start of an array
          arrayKey = arrayStart[2] || '';
          arrayIndent = (arrayStart[1] || '').length;
          inArray = true;
          arrayItems = [];
          continue;
        }
        
        // If we're in an array and this line is an array item
        if (inArray && line.trimStart().startsWith('- ')) {
          // Extract the item value
          const itemValue = line.trimStart().substring(2);
          arrayItems.push(itemValue);
          
          // Check if next line is not an array item or end of file
          if (i + 1 >= lines.length || !lines[i + 1]?.trimStart().startsWith('- ')) {
            // End of array, output with square brackets
            const indent = ' '.repeat(arrayIndent);
            outputLines.push(`${indent}${arrayKey}: [${arrayItems.join(', ')}]`);
            inArray = false;
          }
          
          continue;
        }
        
        // Regular line, just output it
        if (!inArray) {
          outputLines.push(line);
        }
      }
      
      await writeFile(labelPath, outputLines.join('\n'));
      console.log(`✅ Generated label for: ${tableName}`);
    }

    console.log("\n✅ Successfully pulled database schema");
  } catch (error) {
    console.error("Failed to pull database schema:", error);
    process.exit(1);
  }
}
