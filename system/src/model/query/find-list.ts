import { sql } from "bun";
import type { FindListOptions, FindListResult } from "./utils/types";
import { buildSelectQuery } from "./utils/sql-utils";
import { processFields } from "./utils/query-utils";
import { transformRecords } from "./utils/transform-utils";
import { addDeletedAtFilter } from "./utils/deleted-at-utils";
import { validateOrderByRelations, buildOrderByClause } from "./utils/order-by-utils";

export const findList = async ({
  where,
  fields,
  model,
  currentPage = 1,
  itemPerPage = 10,
  orderBy,
  debug,
  includeDeleted = false,
}: FindListOptions): Promise<FindListResult> => {
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

  // Calculate pagination values
  const offset = (currentPage - 1) * itemPerPage;
  const limit = itemPerPage;

  // Build the SELECT query using our utility function
  const { queryStr: baseQueryStr, params } = buildSelectQuery(
    model,
    columnFields,
    relationPaths,
    whereConditions,
    0 // No limit in base query, we'll add it with pagination
  );

  // First, execute a COUNT query to get the total number of items
  const countQueryStr = `SELECT COUNT(*) FROM (${baseQueryStr}) AS countable`;
  const countResult = await sql.unsafe(countQueryStr, params);
  const itemCount = parseInt(countResult[0]?.count || '0');
  const totalPage = Math.ceil(itemCount / itemPerPage);

  // Add ORDER BY, LIMIT, and OFFSET clauses for the main data query
  let fullQueryStr = baseQueryStr;

  // Add ORDER BY if specified
  fullQueryStr += buildOrderByClause(orderBy, model.table);

  // Add pagination
  fullQueryStr += ` LIMIT ${limit} OFFSET ${offset}`;

  if (debug) {
    debug({
      arg: {
        where: whereConditions,
        fields,
        model: model.table,
        currentPage,
        itemPerPage,
        orderBy,
        includeDeleted,
      },
      sql: fullQueryStr,
    });
  }

  // Execute the query using sql.unsafe with parameters
  const results = await sql.unsafe(fullQueryStr, params);

  // Transform the results to handle nested relations
  const data = transformRecords(results, relationPaths);

  // Return the paginated results along with metadata
  return {
    data,
    itemCount,
    totalPage,
    itemPerPage,
    currentPage,
  };
};
