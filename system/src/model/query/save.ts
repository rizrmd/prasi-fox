import type { ModelDefinition } from "../types";
import {
  processBelongsToRelation,
  processHasManyRelation,
} from "./utils/relation-processors";
import {
  extractRelationData,
  getPrimaryKeyColumns,
} from "./utils/relation-utils";
import {
  buildInsertQuery,
  buildUpdateQuery,
  buildWhereClause,
  executeQuery,
  withTransaction,
} from "./utils/save-utils";
import type { SingleWhereClause } from "./utils/types";

export interface SaveOptions {
  data: Record<string, any>;
  model: ModelDefinition;
  debug?: (params: { arg: any; sql: string }) => void;
  // For internal use during transactions
  client?: any;
}

// Main entry point - with transaction support
export const save = async (options: SaveOptions) => {
  try {
    // Use withTransaction utility function instead of manual transaction management
    return await withTransaction({
      operation: async (tx) => {
        return saveWithinTransaction({
          ...options,
          client: tx,
        });
      },
      debug: options.debug,
    });
  } catch (error) {
    console.error("Error during save operation:", error);
    throw error;
  }
};

// Core save function (within transaction)
const saveWithinTransaction = async ({
  data,
  model,
  debug,
  client,
}: SaveOptions) => {
  // Clone data to avoid modifying the original
  const dataToSave = { ...data };

  // Extract and remove relation data
  const relationData = extractRelationData(dataToSave, model);

  // Save the main record
  const savedRecord = await saveRecord({
    data: dataToSave,
    model,
    debug,
    client,
  });

  // Process relations (if any)
  if (Object.keys(relationData).length > 0) {
    const recordWithRelations = await processRelations({
      record: savedRecord,
      relationData,
      model,
      debug,
      client,
    });

    return recordWithRelations;
  }

  return savedRecord;
};

// Save a single record (no relations)
const saveRecord = async ({
  data,
  model,
  debug,
  client,
}: SaveOptions): Promise<Record<string, any>> => {
  // Check if model and model.columns exist
  if (!model || !model.columns) {
    throw new Error(`Invalid model or model.columns is undefined`);
  }
  
  const columns = Object.keys(data).filter((key) =>
    Object.keys(model.columns).includes(key)
  );

  // Get primary key columns using utility function
  const pkColumns = getPrimaryKeyColumns(model);

  if (pkColumns.length === 0) {
    throw new Error(`Model ${model.table} has no primary key columns`);
  }

  // Check if record exists using primary key values
  const whereConditions: SingleWhereClause[] = pkColumns
    .filter((col) => data[col] !== undefined)
    .map((col) => ({
      field: col,
      operator: "=",
      value: data[col],
    }));

  // If no primary key values provided, do insert
  if (whereConditions.length === 0) {
    return insertRecord({ data, columns, model, debug, client });
  }

  // Build where clause using utility function
  const { whereClause, whereValues } = buildWhereClause(whereConditions);

  const checkQuery = `
    SELECT EXISTS (
      SELECT 1 FROM ${model.table}
      WHERE ${whereClause}
    )
  `;

  // Execute query using utility function
  const result = await executeQuery({
    query: checkQuery,
    values: whereValues,
    debug,
    client,
    debugInfo: { where: whereConditions, model: model.table },
  });

  const exists = result[0]?.exists;

  if (!exists) {
    // Do insert if record doesn't exist
    return insertRecord({ data, columns, model, debug, client });
  } else {
    // Do update if record exists
    return updateRecord({
      data,
      columns,
      model,
      whereConditions,
      whereClause,
      whereValues,
      pkColumns,
      debug,
      client,
    });
  }
};

// Insert a new record
const insertRecord = async ({
  data,
  columns,
  model,
  debug,
  client,
}: SaveOptions & { columns: string[] }): Promise<Record<string, any>> => {
  // Use utility function to build insert query
  const { query: insertQuery } = buildInsertQuery(model.table, columns);
  const values = columns.map((col) => data[col]);

  // Execute query using utility function
  const result = await executeQuery({
    query: insertQuery,
    values,
    debug,
    client,
    debugInfo: { data, model: model.table },
  });

  return result[0];
};

// Update an existing record
const updateRecord = async ({
  data,
  columns,
  model,
  whereConditions,
  whereClause,
  whereValues,
  pkColumns,
  debug,
  client,
}: SaveOptions & {
  columns: string[];
  whereConditions: SingleWhereClause[];
  whereClause: string;
  whereValues: any[];
  pkColumns: string[];
}): Promise<Record<string, any>> => {
  const updateColumns = columns.filter(
    (col) => !pkColumns.includes(col) && data[col] !== undefined
  );

  if (updateColumns.length === 0) {
    // No columns to update, return existing record
    const selectQuery = `
      SELECT * FROM ${model.table}
      WHERE ${whereClause}
    `;

    // Execute query using utility function
    const result = await executeQuery({
      query: selectQuery,
      values: whereValues,
      debug,
      client,
      debugInfo: { where: whereConditions, model: model.table },
    });

    return result[0];
  }

  // Use utility function to build update query
  const { query: updateQuery } = buildUpdateQuery({
    table: model.table,
    updateColumns,
    whereClause,
    whereValuesLength: whereValues.length,
  });

  const updateValues = [
    ...whereValues,
    ...updateColumns.map((col) => data[col]),
  ];

  // Execute query using utility function
  const result = await executeQuery({
    query: updateQuery,
    values: updateValues,
    debug,
    client,
    debugInfo: { data, where: whereConditions, model: model.table },
  });

  return result[0];
};

// Process relations
const processRelations = async ({
  record,
  relationData,
  model,
  debug,
  client,
}: {
  record: Record<string, any>;
  relationData: Record<string, any>;
  model: ModelDefinition;
  debug?: SaveOptions["debug"];
  client?: any;
}): Promise<Record<string, any>> => {
  const result = { ...record };

  for (const [relationName, relationValue] of Object.entries(relationData)) {
    const relationConfig = model.relations?.[relationName];

    if (!relationConfig) continue;

    if (relationConfig.type === "belongs_to") {
      const belongsToResult = await processBelongsToRelation({
        record: result,
        relationName,
        relationValue,
        relationConfig,
        debug,
        client,
        saveWithinTransaction,
      });

      Object.assign(result, belongsToResult);
    } else if (relationConfig.type === "has_many") {
      result[relationName] = await processHasManyRelation({
        record: result,
        relationValue,
        relationConfig,
        debug,
        client,
        saveWithinTransaction,
      });
    }
  }

  return result;
};
