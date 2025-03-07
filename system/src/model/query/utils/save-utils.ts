import { sql } from "bun";
import type { SingleWhereClause } from "./types";

/**
 * Builds a WHERE clause string and value array from conditions
 */
export const buildWhereClause = (whereConditions: SingleWhereClause[]): {
  whereClause: string;
  whereValues: any[];
} => {
  const whereClause = whereConditions
    .map((cond, i) => `${cond.field} = $${i + 1}`)
    .join(" AND ");

  const whereValues = whereConditions.map((cond) => cond.value);

  return {
    whereClause,
    whereValues,
  };
};

/**
 * Execute a query with debug support
 */
export const executeQuery = async ({
  query,
  values,
  debug,
  client,
  debugInfo,
}: {
  query: string;
  values: any[];
  debug?: (params: { arg: any; sql: string }) => void;
  client?: any;
  debugInfo?: any;
}): Promise<any[]> => {
  if (debug) {
    debug({
      arg: debugInfo,
      sql: query,
    });
  }

  const queryExecutor = client || sql;
  return queryExecutor.unsafe(query, values);
};

/**
 * Execute a database operation within a transaction
 */
export const withTransaction = async <T>({
  operation,
  debug,
}: {
  operation: (tx: any) => Promise<T>;
  debug?: (params: { arg: any; sql: string }) => void;
}): Promise<T> => {
  return sql.begin(async (tx) => {
    try {
      return await operation(tx);
    } catch (error) {
      console.error("Transaction error:", error);
      throw error;
    }
  });
};

/**
 * Build query components for an insert operation
 */
export const buildInsertQuery = (table: string, columns: string[]): {
  columnList: string;
  valuePlaceholders: string;
  query: string;
} => {
  const columnList = columns.join(", ");
  const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(", ");

  const query = `
    INSERT INTO ${table} (${columnList})
    VALUES (${valuePlaceholders})
    RETURNING *
  `;

  return {
    columnList,
    valuePlaceholders,
    query,
  };
};

/**
 * Build query components for an update operation
 */
export const buildUpdateQuery = ({
  table,
  updateColumns,
  whereClause,
  whereValuesLength,
}: {
  table: string;
  updateColumns: string[];
  whereClause: string;
  whereValuesLength: number;
}): {
  updateClause: string;
  query: string;
} => {
  const updateClause = updateColumns
    .map((col, i) => `${col} = $${whereValuesLength + i + 1}`)
    .join(", ");

  const query = `
    UPDATE ${table}
    SET ${updateClause}
    WHERE ${whereClause}
    RETURNING *
  `;

  return {
    updateClause,
    query,
  };
}; 