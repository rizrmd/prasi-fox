import type { ColumnDefinition, RelationDefinition } from "./types";

export type ModelBase = {
  table: string;
  columns: Record<string, ColumnDefinition>;
  relations: Record<string, RelationDefinition>;
};
