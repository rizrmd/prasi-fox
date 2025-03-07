import type { ModelBase } from "../../base";
import { type RelationPath, type FieldItem } from "./types";
import { loadRelatedModel, validateRelationPath } from "./model-utils";

/**
 * Processes fields to separate column fields from relation fields
 * and loads related models as needed
 */
export const processFields = async (
  fields: FieldItem[],
  model: ModelBase
): Promise<{
  columnFields: string[];
  relationPaths: RelationPath[];
  modelMap: Map<string, ModelBase>;
}> => {
  // Load all related models first
  const modelMap = new Map<string, ModelBase>();
  modelMap.set(model.table, model);

  // Separate column fields and relation fields
  const columnFields: string[] = [];
  const relationPaths: RelationPath[] = [];

  // Process each field or field array
  await processFieldItems(fields, model, columnFields, relationPaths, modelMap, []);

  return { columnFields, relationPaths, modelMap };
};

/**
 * Recursively processes field items to handle nested arrays and relation paths
 */
async function processFieldItems(
  fieldItems: FieldItem[],
  model: ModelBase,
  columnFields: string[],
  relationPaths: RelationPath[],
  modelMap: Map<string, ModelBase>,
  currentPath: string[] = []
): Promise<void> {
  for (const item of fieldItems) {
    if (typeof item === "string") {
      // If the item is a string and we're at the root level (no current path)
      if (currentPath.length === 0) {
        // It's a direct column field
        columnFields.push(item);
      } else {
        // It's a field within a relation
        const relation = await validateRelationPath(model, currentPath);
        if (relation) {
          relationPaths.push({
            fields: [item],
            path: [...currentPath],
            relation,
          });
        }
      }
    } else if (Array.isArray(item) && item.length > 0) {
      // It's an array, format is [relationName, ...fieldsOrSubRelations]
      // First element is always the relation name
      const relationName = item[0];
      if (typeof relationName !== "string") {
        throw new Error(`Relation name must be a string: ${JSON.stringify(relationName)}`);
      }

      // Create a new path including this relation
      const newPath = [...currentPath, relationName];
      
      // Validate the relation path
      const relation = await validateRelationPath(model, newPath);
      if (!relation) {
        throw new Error(`Invalid relation path: ${newPath.join(".")}`); 
      }

      // Load the related model if not already loaded
      const relatedTableName = relation.to?.split(".")[0];
      if (!relatedTableName) {
        throw new Error(`Invalid relation target for ${relationName}`);
      }
      
      if (!modelMap.has(relatedTableName)) {
        const relatedModel = await loadRelatedModel(relation.to);
        if (!relatedModel) {
          throw new Error(`Could not load related model for ${relation.to}`);
        }
        modelMap.set(relatedTableName, relatedModel);
      }

      // Get the related model for nested relation processing
      const relatedModel = modelMap.get(relatedTableName);
      if (!relatedModel) {
        throw new Error(`Could not find related model for ${relationName}`);
      }

      // If there are no additional items, add a default 'id' field
      if (item.length === 1) {
        relationPaths.push({
          fields: ["id"], // Default to 'id' if no fields specified
          path: newPath,
          relation,
        });
        continue;
      }

      // Process the remaining items (fields or nested relations)
      const directFields: string[] = [];
      const nestedRelations: any[] = [];

      // First pass: separate direct fields from nested relations
      for (let i = 1; i < item.length; i++) {
        const nestedItem = item[i];
        if (typeof nestedItem === "string") {
          // Simple field for the current relation
          directFields.push(nestedItem);
        } else if (Array.isArray(nestedItem) && nestedItem.length > 0) {
          // This is a nested relation array: ["relationName", ...fields]
          nestedRelations.push(nestedItem);
        }
      }

      // Add the collected direct fields for this relation
      if (directFields.length > 0) {
        relationPaths.push({
          fields: directFields,
          path: newPath,
          relation,
        });
      }

      // Process nested relations
      for (const nestedRelation of nestedRelations) {
        if (!Array.isArray(nestedRelation) || nestedRelation.length === 0) {
          continue;
        }
        
        const nestedRelationName = nestedRelation[0];
        if (typeof nestedRelationName !== "string") {
          throw new Error(`Nested relation name must be a string: ${JSON.stringify(nestedRelationName)}`);
        }
        
        // Check if the nested relation exists in the related model
        if (!relatedModel.relations[nestedRelationName]) {
          throw new Error(`Relation '${nestedRelationName}' not found in model ${relatedModel.table}. Available relations: ${Object.keys(relatedModel.relations).join(', ')}`);
        }
        
        // Get the relation definition
        const relationDef = relatedModel.relations[nestedRelationName];
        if (!relationDef || !relationDef.to) {
          throw new Error(`Invalid relation definition for '${nestedRelationName}' in model ${relatedModel.table}`);
        }
        
        // Load the model for this relation if not already loaded
        const relatedTableName = relationDef.to?.split(".")[0];
        if (relatedTableName && !modelMap.has(relatedTableName)) {
          const nestedModel = await loadRelatedModel(relationDef.to);
          if (!nestedModel) {
            throw new Error(`Could not load related model for ${relationDef.to}`);
          }
          modelMap.set(relatedTableName, nestedModel);
        }
        
        // Build the path for this nested relation
        const nestedPath = [...newPath, nestedRelationName];
        
        // Add default 'id' field if no fields specified
        if (nestedRelation.length === 1) {
          relationPaths.push({
            fields: ["id"],
            path: nestedPath,
            relation: relationDef,
          });
        } else {
          // Collect and add fields for this nested relation
          const fields: string[] = [];
          
          for (let i = 1; i < nestedRelation.length; i++) {
            const field = nestedRelation[i];
            if (typeof field === "string") {
              fields.push(field);
            }
            // Note: we don't handle deeply nested relations here (depth > 2)
            // Those would need another approach or recursive implementation
          }
          
          if (fields.length > 0) {
            relationPaths.push({
              fields,
              path: nestedPath,
              relation: relationDef,
            });
          }
        }
      }
    }
  }
}