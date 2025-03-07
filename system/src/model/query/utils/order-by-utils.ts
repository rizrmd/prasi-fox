import type { OrderByClause, RelationPath } from "./types";

export const validateOrderByRelations = (
  orderBy: OrderByClause[] | undefined,
  relationPaths: RelationPath[]
) => {
  if (!orderBy?.length) return;

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
};

export const buildOrderByClause = (
  orderBy: OrderByClause[] | undefined,
  modelTable: string
): string => {
  if (!orderBy?.length) return "";

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
        clause = `${modelTable}.${field} ${direction}`;
      }

      // Add NULLS directive if specified
      if (nulls) {
        clause += ` NULLS ${nulls}`;
      }

      return clause;
    }
  );

  return ` ORDER BY ${orderClauses.join(", ")}`;
};
