import type { ModelBase } from "../../base";
import type { RelationDefinition } from "../../types";

// Define a recursive field type to support nested relations
// The fields type supports nested relations in the following formats:
// 1. Simple string field: "id", "name", etc.
// 2. Relation with default 'id' field: ["staff"]
// 3. Relation with specified fields: ["staff", "id", "name"]
// 4. Relation with nested relations: ["staff", ["client", ["id", "name"]]]
// The first element of each array is always the relation name
export type FieldItem = string | [string, ...FieldItem[]];

export interface RelationPath {
  fields: string[];
  path: string[];
  relation: RelationDefinition;
}

export interface SingleWhereClause {
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" | "ILIKE" | "IN";
  value: any;
}

export interface AndWhereClause {
  and: WhereClause[];
}

export interface OrWhereClause {
  or: WhereClause[];
}

export type WhereClause = SingleWhereClause | AndWhereClause | OrWhereClause;

export interface FindFirstOptions {
  where: WhereClause[];
  model: ModelBase;
  fields: FieldItem[];
  includeDeleted?: boolean;
  debug?: (opt: {
    arg: any;
    sql: string;
    select: string[];
    joins: string[];
    where: string;
    params?: any[];
  }) => void;
  isTest?: boolean;
}

export interface OrderByClause {
  field: string; // Can now be "fieldName" or "relation.fieldName" or "relation.nestedRelation.fieldName"
  direction?: "ASC" | "DESC";
  nulls?: "FIRST" | "LAST";
}

export interface FindManyOptions {
  where: WhereClause[];
  model: ModelBase;
  fields: FieldItem[];
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
  orderBy?: OrderByClause[];
  debug?: (opt: { arg: any; sql: string }) => void;
}

export interface FindListOptions {
  where: WhereClause[];
  model: ModelBase;
  fields: FieldItem[];
  includeDeleted?: boolean;
  currentPage?: number;
  itemPerPage?: number;
  orderBy?: OrderByClause[];
  debug?: (opt: { arg: any; sql: string }) => void;
}

export interface FindListResult {
  data: any[];
  itemCount: number;
  totalPage: number;
  itemPerPage: number;
  currentPage: number;
}
