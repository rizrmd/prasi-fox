import { sql } from "bun";
import type { FindManyOptions } from "./utils/types";
import { buildSelectQuery } from "./utils/sql-utils";
import { processFields } from "./utils/query-utils";
import { transformRecords } from "./utils/transform-utils";
import { addDeletedAtFilter } from "./utils/deleted-at-utils";
import { validateOrderByRelations, buildOrderByClause } from "./utils/order-by-utils";

export const findMany = async ({
  where,
  fields,
  model,
  limit = 100,
  offset = 0,
  orderBy,
  debug,
  includeDeleted = false,
}: FindManyOptions) => {
  // Process fields to separate columns and relations
  const { columnFields, relationPaths } = await processFields(fields, model);

  // Handle deleted_at filtering
  const whereConditions = addDeletedAtFilter(
    [...where],
    includeDeleted,
    !!model.columns.deleted_at
  );

  // Validate orderBy relations are included in the query
  validateOrderByRelations(orderBy, relationPaths);

  // Build the SELECT query using our utility function
  const { queryStr: baseQueryStr, params } = buildSelectQuery(
    model,
    columnFields,
    relationPaths,
    whereConditions,
    0 // No limit in base query, we'll add it with pagination
  );

  // Add ORDER BY, LIMIT, and OFFSET clauses
  let fullQueryStr = baseQueryStr;

  // Add ORDER BY if specified
  fullQueryStr += buildOrderByClause(orderBy, model.table);

  // Add pagination
  if (limit > 0) {
    fullQueryStr += ` LIMIT ${limit}`;
  }

  if (offset > 0) {
    fullQueryStr += ` OFFSET ${offset}`;
  }

  if (debug) {
    debug({
      arg: {
        where: whereConditions,
        fields,
        model: model.table,
        limit,
        offset,
        orderBy,
        includeDeleted,
      },
      sql: fullQueryStr,
    });
  }

  // Execute the query using sql.unsafe with parameters
  const results = await sql.unsafe(fullQueryStr, params);

  // Transform the results to handle nested relations
  return transformRecords(results, relationPaths);
};
