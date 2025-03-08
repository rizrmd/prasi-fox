import { models } from "shared/generated/models";
import type { ModelBase } from "../../base";
import type { RelationDefinition } from "../../types";

/**
 * Loads a related model based on the table name
 */
export async function loadRelatedModel(table: string): Promise<ModelBase> {
  // Extract the table name from the relation definition (e.g., "client.id" -> "client")
  const tableName = table.split(".")[0] as keyof typeof models;

  if (!models[tableName]) {
    throw new Error(`Model ${tableName} not found`);
  }

  return models[tableName];
}

/**
 * Validates a relation path and returns the relation definition
 */
export async function validateRelationPath(
  model: ModelBase,
  path: string[]
): Promise<RelationDefinition | undefined> {
  if (path.length === 0) return undefined;

  let currentModel = model;
  let relation: RelationDefinition | undefined;

  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    if (!segment) continue;
    relation = currentModel.relations[segment];

    if (!relation) {
      throw new Error(
        `Relation ${segment} not found in table ${
          currentModel.table
        }. Available relations: ${Object.keys(currentModel.relations).join(
          ", "
        )}`
      );
    }

    // Load the next model in the path
    currentModel = await loadRelatedModel(relation.to);
  }

  return relation;
}
