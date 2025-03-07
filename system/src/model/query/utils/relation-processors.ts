import type { ModelDefinition } from "../../types";
import type { SaveOptions } from "../save";
import { getPrimaryKeyColumns } from "./relation-utils";

/**
 * Process belongs_to relation
 */
export const processBelongsToRelation = async ({ 
  record, 
  relationName,
  relationValue, 
  relationConfig, 
  debug, 
  client,
  saveWithinTransaction 
}: { 
  record: Record<string, any>, 
  relationName: string,
  relationValue: any,
  relationConfig: any,
  debug?: SaveOptions['debug'],
  client?: any,
  saveWithinTransaction: (options: SaveOptions) => Promise<Record<string, any>>
}): Promise<Record<string, any>> => {
  if (!relationValue) return record;
  
  // Save related record (with all its nested relations)
  const relatedRecord = await saveWithinTransaction({
    data: relationValue,
    model: relationConfig.model,
    debug,
    client
  });
  
  // Get primary key columns of the related model
  const pkColumns = getPrimaryKeyColumns(relationConfig.model);
  
  // Update the local record with the foreign key
  if (relatedRecord && relationConfig.foreignKey && record) {
    const foreignKeyUpdate = {
      [pkColumns[0] || 'id']: record[pkColumns[0] || 'id'],
      [relationConfig.localKey]: relatedRecord[relationConfig.foreignKey]
    };
    
    const updatedRecord = await saveWithinTransaction({
      data: foreignKeyUpdate,
      model: relationConfig.model,
      debug,
      client
    });
    
    // Add the related record to the result
    return {
      ...updatedRecord,
      [relationName]: relatedRecord
    };
  }
  
  return record;
};

/**
 * Process has_many relation
 */
export const processHasManyRelation = async ({ 
  record, 
  relationValue, 
  relationConfig, 
  debug, 
  client,
  saveWithinTransaction 
}: { 
  record: Record<string, any>, 
  relationValue: any[],
  relationConfig: any,
  debug?: SaveOptions['debug'],
  client?: any,
  saveWithinTransaction: (options: SaveOptions) => Promise<Record<string, any>>
}): Promise<Record<string, any>[]> => {
  if (!Array.isArray(relationValue)) return [];
  
  const savedRelations = [];
  const pkColumns = getPrimaryKeyColumns(relationConfig.model);
  
  // Process each item in the has_many relation
  for (const item of relationValue) {
    // Set the foreign key to reference the parent
    const foreignData = {
      ...item,
      [relationConfig.foreignKey]: record[relationConfig.localKey || pkColumns[0] || 'id']
    };
    
    const savedRelation = await saveWithinTransaction({
      data: foreignData,
      model: relationConfig.model,
      debug,
      client
    });
    
    savedRelations.push(savedRelation);
  }
  
  return savedRelations;
}; 