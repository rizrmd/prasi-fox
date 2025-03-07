import { type RelationPath } from "./types";
/**
 * Transforms a raw database result into a structured object with nested relations
 * based on the relation paths and SQL field selections
 */
export const transformRecord = async (
  rawResult: Record<string, any>,
  relationPaths: RelationPath[]
): Promise<Record<string, any> | null> => {
  if (!rawResult) return null;

  // Clone the raw result as a starting point
  const transformedResult: Record<string, any> = { ...rawResult };

  // Track relation types to know which ones should be arrays
  const relationTypes = new Map<string, string>();

  // First pass: get relation types and handle json_agg results
  for (const { path, relation } of relationPaths) {
    const relationName = path[0]; // First segment is the relation name
    if (!relationName) continue;

    // Store relation type (has_many or belongs_to)
    relationTypes.set(relationName, relation.type);

    // Handle json_agg results for has_many relations
    if (relation.type === "has_many") {
      // Check if we have a direct json_agg result
      if (relationName in rawResult && Array.isArray(rawResult[relationName])) {
        // Keep the json_agg result as is
        transformedResult[relationName] = rawResult[relationName] || [];
        // Remove the raw field from the result to avoid duplication
        delete rawResult[relationName];
        continue;
      }
      
      // For backwards compatibility, initialize has_many relations as arrays if not present
      if (!transformedResult[relationName]) {
        transformedResult[relationName] = [];
      }
    }
  }

  // Second pass: process relations that use the old approach with table aliases
  for (const { fields, path, relation } of relationPaths) {
    // Skip if path is empty or if this relation was already processed as json_agg
    if (!path.length) continue;
    const relationName = path[0];
    
    // Skip if this is a has_many relation that was already processed via json_agg
    if (relation.type === "has_many" && relationName && 
        relationName in transformedResult && 
        Array.isArray(transformedResult[relationName]) && 
        transformedResult[relationName].length >= 0) {
      continue;
    }

    const tableAlias = path.join("_");

    // Create an object to hold the related data
    const relatedData: Record<string, any> = {};
    let hasRelatedData = false;

    // Extract fields with the correct prefix
    for (const field of fields) {
      const rawField = `${tableAlias}_${field}`;
      if (rawResult[rawField] !== undefined) {
        relatedData[field] = rawResult[rawField];
        hasRelatedData = true;
        // Remove the raw field from the result
        delete transformedResult[rawField];
      }
    }

    if (!hasRelatedData) continue;

    // Handle nested paths properly
    let currentObj = transformedResult;
    const relationType = relationTypes.get(path[0] || "");

    if (relationType === "has_many") {
      // For has_many relations, we need to find or create the appropriate array item
      const idFieldName = `${tableAlias}_id`;
      const itemId = rawResult[idFieldName];

      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (!segment) continue; // Skip if segment is undefined or empty

        if (!currentObj[segment]) {
          currentObj[segment] = {};
        }
        currentObj = currentObj[segment];
      }

      const relationKey = path[0];
      if (!relationKey) {
        continue; // Skip processing if the relation key is undefined
      }

      let arrayItem = currentObj[relationKey].find(
        (item: any) => item.id === itemId
      );

      if (!arrayItem) {
        arrayItem = { id: itemId };
        currentObj[relationKey].push(arrayItem);
      }

      currentObj = arrayItem;

      // Process remaining path segments for nested structure
      for (let i = 1; i < path.length - 1; i++) {
        const segment = path[i];
        if (!segment) continue;

        if (!currentObj[segment]) {
          currentObj[segment] = {};
        }
        currentObj = currentObj[segment];
      }

      // Add the related data to the last segment
      const lastSegment = path[path.length - 1];
      if (lastSegment && lastSegment !== path[0]) {
        currentObj[lastSegment] = relatedData;
      } else {
        // If it's a direct field of the array item
        Object.assign(currentObj, relatedData);
      }
    } else {
      // For belongs_to relations, create nested objects
      // Process each path segment except the last one
      for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (!segment) continue;

        if (!currentObj[segment]) {
          currentObj[segment] = {};
        }
        currentObj = currentObj[segment];
      }

      // Add the related data to the last segment
      const lastSegment = path[path.length - 1];
      if (lastSegment) {
        currentObj[lastSegment] = relatedData;
      }
    }
  }

  return transformedResult;
};
/**
 * Transforms raw database results into structured objects with nested relations
 * based on the relation paths and SQL field selections
 */
export const transformRecords = (
  rawResults: Record<string, any>[],
  relationPaths: RelationPath[]
): Record<string, any>[] => {
  if (!rawResults.length) return [];

  return rawResults.map(
    (rawResult) =>
      transformRecord(rawResult, relationPaths) as unknown as Record<
        string,
        any
      >
  );
};
