import type { ModelBase } from "../../base";
import type { RelationPath } from "./types";
import { models } from "shared/generated/models";

export interface LateralJoinResult {
  joins: string[];
  selectFields: string[];
}

export const buildLateralJoins = (
  model: ModelBase,
  relationPaths: RelationPath[]
): LateralJoinResult => {
  const lateralJoins: string[] = [];
  const selectFields: string[] = [];
  // Track processed joins to avoid duplicates
  const processedJoins = new Set<string>();

  for (const { fields, path, relation: relationInfo } of relationPaths) {
    const tableAlias = path.join("_");

    // Skip if relation is already processed
    if (processedJoins.has(tableAlias)) continue;

    // Check if this is a has_many relation
    const isHasMany = relationInfo.type === "has_many";

    if (isHasMany) {
      // For has_many relations, use json_agg to get all related records as an array
      const relatedTableName = relationInfo.to.split(".")[0];
      const relatedTable =
        models[relatedTableName! as keyof typeof models]?.table ||
        (relatedTableName!.startsWith("m_")
          ? relatedTableName
          : `m_${relatedTableName}`);

      // Build JSON fields list
      const jsonFields = fields
        .map((field) => `'${field}', ${relatedTable}.${field}`)
        .join(", ");

      // Create the JSON aggregation select statement
      selectFields.push(
        `(SELECT json_agg(json_build_object(${jsonFields}))
          FROM ${relatedTable}
          WHERE ${model.table}.id = ${relatedTable}.${
          relationInfo.to.split(".")[1] || relationInfo.from
        }
        ) AS ${tableAlias}`
      );

      processedJoins.add(tableAlias);
      continue;
    }

    // For regular belongs_to relations, continue with the lateral join approach
    // Alias each field with the relation name to avoid column name collisions
    for (const field of fields) {
      selectFields.push(`${tableAlias}.${field} AS ${tableAlias}_${field}`);
    }

    // Build lateral joins for each segment in the relation path
    let currentAlias = model.table;
    let currentModel = model;

    // Process each segment of the path (handles unlimited depth)
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      if (!segment) continue;

      // Get the relation definition for this segment
      const rel =
        i === path.length - 1
          ? relationInfo // Use the provided relation for the last segment
          : currentModel.relations[segment]; // Use the relation from the current model for intermediate segments

      if (!rel || !rel.to) continue;

      // Get the related table name from the relation's to field
      const relatedTableName = rel.to.split(".")[0];

      // Get the actual table name from the related model using imported models
      const tableName =
        models[relatedTableName! as keyof typeof models]?.table ||
        (relatedTableName!.startsWith("m_")
          ? relatedTableName
          : `m_${relatedTableName}`);

      // Update the current model for the next iteration
      currentModel =
        models[relatedTableName! as keyof typeof models] || currentModel;

      // Create join condition based on relation type
      const joinCondition =
        rel.type === "belongs_to"
          ? `${currentAlias}.${rel.from} = ${tableName}.id`
          : `${currentAlias}.id = ${tableName}.${
              rel.to.split(".")[1] || rel.from
            }`;

      // Create the lateral join with proper aliasing
      const newAlias =
        i === path.length - 1
          ? tableAlias
          : `${path.slice(0, i + 1).join("_")}`;

      // Create a unique identifier for this join to avoid duplicates
      const joinKey = `${tableName}_${newAlias}`;

      // Only add this join if it hasn't been added yet
      if (!processedJoins.has(joinKey)) {
        // For belongs_to we still use LIMIT 1 since we only expect one record
        const lateralJoin = `LEFT JOIN LATERAL (
          SELECT * FROM ${tableName} 
          WHERE ${joinCondition} 
          LIMIT 1
        ) AS ${newAlias} ON true`;

        lateralJoins.push(lateralJoin);
        processedJoins.add(joinKey);
      }

      // Update the current alias for the next iteration
      currentAlias = newAlias;
    }
  }

  return { joins: lateralJoins.map((join) => ` ${join}`), selectFields };
};

export interface WhereClauseResult {
  clause: string;
  params: any[];
}

import type { WhereClause, SingleWhereClause, AndWhereClause, OrWhereClause } from "./types";

const buildCondition = (
  model: ModelBase,
  clause: SingleWhereClause,
  relationPaths: RelationPath[],
  params: any[]
): string => {
  const operator =
    clause.operator === "="
      ? "="
      : clause.operator === "!="
      ? "!="
      : clause.operator === ">"
      ? ">"
      : clause.operator === "<"
      ? "<"
      : clause.operator === ">="
      ? ">="
      : clause.operator === "<="
      ? "<="
      : clause.operator === "LIKE"
      ? "LIKE"
      : clause.operator === "ILIKE"
      ? "ILIKE"
      : clause.operator === "IN"
      ? "IN"
      : "=";

  let tableName = model.table;
  let fieldName = clause.field;

  if (clause.field.includes(".")) {
    const parts = clause.field.split(".");
    fieldName = parts.pop()!;
    const relationPath = parts;
    const alias = relationPath.join("_");
    tableName = alias;
  }

  // Special case for field that exists in where clause but not in selected fields
  if (!fieldName) {
    throw new Error(`Invalid field name in where clause: ${clause.field}`);
  }

  // Only validate field existence if it's on the base model
  if (tableName === model.table && !model.columns[fieldName]) {
    throw new Error(`Column ${fieldName} not found in model ${model.table}`);
  }

  params.push(clause.value);
  return `${tableName}.${fieldName} ${operator} $${params.length}`;
};

const buildGroup = (
  model: ModelBase,
  conditions: WhereClause[],
  relationPaths: RelationPath[],
  params: any[]
): string => {
  if (conditions.length === 0) return "";

  const buildGroupCondition = (condition: WhereClause): string => {
    // Always returns a non-empty string or empty string, never undefined
    if ("field" in condition) {
      return buildCondition(model, condition, relationPaths, params);
    }

    if ("and" in condition) {
      const parts = condition.and
        .map(buildGroupCondition)
        .filter(
          (part): part is string => typeof part === "string" && part.length > 0
        );
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0] || "";
      return `(${parts.join(" AND ")})`;
    }

    if ("or" in condition) {
      const parts = condition.or
        .map(buildGroupCondition)
        .filter(
          (part): part is string => typeof part === "string" && part.length > 0
        );
      if (parts.length === 0) return "";
      if (parts.length === 1) return parts[0] || "";
      return `(${parts.join(" OR ")})`;
    }

    return "";
  };

  const validParts = conditions
    .map(buildGroupCondition)
    .filter(
      (part): part is string => typeof part === "string" && part.length > 0
    );
  if (validParts.length === 0) return "";
  if (validParts.length === 1) return validParts[0] || "";
  return validParts.join(" AND ");
};

export const buildWhereClause = (
  model: ModelBase,
  where: WhereClause[],
  relationPaths: RelationPath[]
): WhereClauseResult => {
  if (where.length === 0) {
    return { clause: "", params: [] };
  }

  const params: any[] = [];
  const conditions = buildGroup(model, where, relationPaths, params);
  return { clause: conditions ? ` WHERE ${conditions}` : "", params };
};

export interface SelectQueryResult {
  queryStr: string;
  params: any[];
}

export const buildSelectQuery = (
  model: ModelBase,
  columnFields: string[],
  relationPaths: RelationPath[],
  where: WhereClause[],
  limit: number = 1
): SelectQueryResult => {
  // Build the SELECT query fields
  const selectFields = columnFields.map((field) => {
    if (!model.columns[field]) {
      throw new Error(`Column ${field} not found in model ${model.table}`);
    }
    return `${model.table}.${field}`;
  });

  // Build lateral joins using the utility function
  const { joins: lateralJoins, selectFields: relationSelectFields } =
    buildLateralJoins(model, relationPaths);
  selectFields.push(...relationSelectFields);

  // Build WHERE clause using the utility function
  const { clause: whereClauseStr, params } = buildWhereClause(
    model,
    where,
    relationPaths
  );

  // Build query parts as strings
  const selectClause = selectFields.join(", ");
  const fromClause = model.table;
  const lateralJoinsClause =
    lateralJoins.length > 0 ? lateralJoins.join(" ") : "";
  const whereClause = whereClauseStr ? `${whereClauseStr}` : "";
  const limitClause = limit > 0 ? ` LIMIT ${limit}` : "";

  // Construct the final query string
  const queryStr = `SELECT ${selectClause} FROM ${fromClause}${lateralJoinsClause}${whereClause}${limitClause}`;

  return { queryStr, params };
};
