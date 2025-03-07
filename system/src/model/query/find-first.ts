import { sql } from "bun";
import type { FindFirstOptions } from "./utils/types";
import { buildSelectQuery } from "./utils/sql-utils";
import { processFields } from "./utils/query-utils";
import { transformRecord } from "./utils/transform-utils";
import { addDeletedAtFilter } from "./utils/deleted-at-utils";

export const findFirst = async ({
  where,
  fields,
  model,
  debug,
  includeDeleted = false,
}: FindFirstOptions) => {
  // Process fields to separate columns and relations
  const { columnFields, relationPaths } = await processFields(fields, model);

  // Handle deleted_at filtering
  const whereConditions = addDeletedAtFilter(
    [...where], 
    includeDeleted, 
    !!model.columns.deleted_at
  );

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
      params, // Include params from buildSelectQuery
    });
  }

  // Execute the query using sql.unsafe with parameters
  const result = await sql.unsafe(queryStr, params);

  // Transform the result to handle nested relations
  if (!result[0]) return null;

  // Transform the result using the standard transform function
  return await transformRecord(result[0], relationPaths);
};
