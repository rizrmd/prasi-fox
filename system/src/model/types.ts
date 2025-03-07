
export interface ColumnDefinition {
  type: string;
  primary?: boolean;
  default?: string | number | boolean;
  values?: string[];
}

export type RelationType = "has_many" | "belongs_to";

export interface RelationDefinition {
  type: RelationType;
  from: string;
  to: string;
}

export interface ModelDefinition {
  table: string;
  columns: Record<string, string | ColumnDefinition>;
  relations?: Record<string, RelationDefinition>;
}

export interface TableSchema {
  name: string;
  columns: Array<{
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>;
}