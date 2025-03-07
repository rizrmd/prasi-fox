import { sql } from "bun";
import type { FindManyOptions } from "./utils/types";
import { buildSelectQuery } from "./utils/sql-utils";
import { processFields } from "./utils/query-utils";
import { transformRecords } from "./utils/transform-utils";

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

  // Add deleted_at filter if includeDeleted is false and the model has deleted_at column
  const whereConditions = [...where];
  if (!includeDeleted && model.columns.deleted_at) {
    whereConditions.push({
      field: "deleted_at",
      operator: "=",
      value: null,
    });
  }

  // Validate orderBy relations are included in the query
  if (orderBy?.length) {
    // Create a set of all relation paths included in the query for quick lookup
    const includedRelationPaths = new Set<string>();

    // Add all relation paths from the query
    for (const { path } of relationPaths) {
      // Add each level of the path
      let currentPath = "";
      for (const segment of path) {
        currentPath = currentPath ? `${currentPath}.${segment}` : segment;
        includedRelationPaths.add(currentPath);
      }
    }

    // Check each orderBy clause to ensure its relations are included
    for (const { field } of orderBy) {
      if (field.includes(".")) {
        const segments = field.split(".");
        segments.pop(); // Remove the field name, keep only the relation path

        // Build the relation path
        let relationPath = "";
        let valid = false;

        for (const segment of segments) {
          relationPath = relationPath ? `${relationPath}.${segment}` : segment;

          // Check if this relation path is included in the query
          if (includedRelationPaths.has(relationPath)) {
            valid = true;
          }
        }

        if (!valid) {
          throw new Error(
            `Relation "${segments.join(
              "."
            )}" used in orderBy is not included in the query fields. Make sure to include it in your fields array.`
          );
        }
      }
    }
  }

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
  if (orderBy && orderBy.length) {
    const orderClauses = orderBy.map(
      ({
        field,
        direction = "ASC",
        nulls,
      }: {
        field: string;
        direction?: "ASC" | "DESC";
        nulls?: "FIRST" | "LAST";
      }) => {
        let clause = "";

        // Check if this is a relation path (contains dots)
        if (field.includes(".")) {
          // Split the path into segments
          const segments = field.split(".");
          const fieldName = segments.pop() || ""; // Last segment is the field name
          const relationPath = segments.join("_"); // Convert relation path to match our alias format

          // Use the relation alias and field name
          clause = `${relationPath}.${fieldName} ${direction}`;
        } else {
          // Regular field on the base table
          clause = `${model.table}.${field} ${direction}`;
        }

        // Add NULLS directive if specified
        if (nulls) {
          clause += ` NULLS ${nulls}`;
        }

        return clause;
      }
    );

    fullQueryStr += ` ORDER BY ${orderClauses.join(", ")}`;
  }

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
