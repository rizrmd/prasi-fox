import type { ModelDefinition } from "../../types";

/**
 * Extract relation data from input data
 */
export const extractRelationData = (data: Record<string, any>, model: ModelDefinition): Record<string, any> => {
  const relationData: Record<string, any> = {};
  
  if (model && model.relations) {
    Object.entries(data).forEach(([key, value]) => {
      if (model.relations && model.relations[key] && value) {
        relationData[key] = value;
        // Remove relation data from main data
        delete data[key];
      }
    });
  }
  
  return relationData;
};

/**
 * Get primary key columns for a model
 */
export const getPrimaryKeyColumns = (model: ModelDefinition): string[] => {
  if (!model || !model.columns) {
    return [];
  }
  
  return Object.entries(model.columns)
    .filter(([_, col]: [string, any]) => col.primary)
    .map(([colName]) => colName);
};

/**
 * Check if data contains all primary keys
 */
export const hasPrimaryKeys = (data: Record<string, any>, pkColumns: string[]): boolean => {
  return pkColumns.every(column => data[column] !== undefined);
}; 