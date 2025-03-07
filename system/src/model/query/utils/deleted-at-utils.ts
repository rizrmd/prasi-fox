import type { WhereClause } from "./types";

export const hasDeletedAtCondition = (condition: WhereClause): boolean => {
  if ('field' in condition) {
    return condition.field === 'deleted_at';
  }
  if ('and' in condition) {
    return condition.and.some(hasDeletedAtCondition);
  }
  if ('or' in condition) {
    return condition.or.some(hasDeletedAtCondition);
  }
  return false;
};

export const addDeletedAtFilter = (
  whereConditions: WhereClause[],
  includeDeleted: boolean,
  hasDeletedAtColumn: boolean
): WhereClause[] => {
  if (!includeDeleted && 
      hasDeletedAtColumn && 
      !whereConditions.some(hasDeletedAtCondition)) {
    return [
      ...whereConditions,
      {
        field: "deleted_at",
        operator: "=",
        value: null,
      },
    ];
  }
  return whereConditions;
};
