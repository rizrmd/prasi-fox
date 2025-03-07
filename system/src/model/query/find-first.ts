import { sql } from "bun";
import type { FindFirstOptions } from "./utils/types";
import { buildSelectQuery } from "./utils/sql-utils";
import { processFields } from "./utils/query-utils";
import { transformRecord } from "./utils/transform-utils";

export const findFirst = async ({
  where,
  fields,
  model,
  debug,
  includeDeleted = false,
}: FindFirstOptions) => {
  // Process fields to separate columns and relations
  const { columnFields, relationPaths } = await processFields(fields, model);

  // Add deleted_at filter if includeDeleted is false and the model has deleted_at column
  const whereConditions = [...where];
  if (!includeDeleted && model.columns.deleted_at) {
    whereConditions.push({
      field: "deleted_at",
      operator: "=",
      value: null,
    });
  }

  // Build the SELECT query using utility function
  const { queryStr, params } = buildSelectQuery(
    model,
    columnFields,
    relationPaths,
    whereConditions
  );

  if (debug) {
    debug({
      arg: {
        where: whereConditions,
        fields,
        model: model.table,
        includeDeleted,
      },
      sql: queryStr,
      select: [], // Empty array to satisfy type
      joins: [], // Empty array to satisfy type
      where: "", // Empty string to satisfy type
    });
  }

  // Execute the query using sql.unsafe with parameters
  const result = await sql.unsafe(queryStr, params);

  // Transform the result to handle nested relations
  if (!result[0]) return null;

  // Transform the result using the standard transform function
  return await transformRecord(result[0], relationPaths);
};
