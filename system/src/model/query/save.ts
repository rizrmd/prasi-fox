import { sql } from "bun";
import type { ModelDefinition } from "../types";
import type { SingleWhereClause } from "./utils/types";

interface SaveOptions {
  data: Record<string, any>;
  model: ModelDefinition;
  debug?: (params: {
    arg: any;
    sql: string;
  }) => void;
}

export const save = async ({ data, model, debug }: SaveOptions) => {
  const columns = Object.keys(data).filter(
    (key) => Object.keys(model.columns).includes(key)
  );

  // Get primary key columns
  const pkColumns = Object.entries(model.columns)
    .filter(([_, col]: [string, any]) => col.primary)
    .map(([colName]) => colName);

  if (pkColumns.length === 0) {
    throw new Error(`Model ${model.table} has no primary key columns`);
  }

  // Check if record exists using primary key values
  const whereConditions: SingleWhereClause[] = pkColumns
    .filter((col) => data[col] !== undefined)
    .map((col) => ({
      field: col,
      operator: "=",
      value: data[col],
    }));

  // If no primary key values provided, do insert
  if (whereConditions.length === 0) {
    const columnList = columns.join(", ");
    const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const insertQuery = `
      INSERT INTO ${model.table} (${columnList})
      VALUES (${valuePlaceholders})
      RETURNING *
    `;

    const values = columns.map((col) => data[col]);

    if (debug) {
      debug({
        arg: {
          data,
          model: model.table,
        },
        sql: insertQuery,
      });
    }

    const result = await sql.unsafe(insertQuery, values);
    return result[0];
  }

  // Check if record exists
  const whereClause = whereConditions
    .map((cond, i) => `${cond.field} = $${i + 1}`)
    .join(" AND ");

  const checkQuery = `
    SELECT EXISTS (
      SELECT 1 FROM ${model.table}
      WHERE ${whereClause}
    )
  `;

  const whereValues = whereConditions.map((cond) => cond.value);

  if (debug) {
    debug({
      arg: {
        where: whereConditions,
        model: model.table,
      },
      sql: checkQuery,
    });
  }

  const exists = (await sql.unsafe(checkQuery, whereValues))[0]?.exists;

  if (!exists) {
    // Do insert if record doesn't exist
    const columnList = columns.join(", ");
    const valuePlaceholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const insertQuery = `
      INSERT INTO ${model.table} (${columnList})
      VALUES (${valuePlaceholders})
      RETURNING *
    `;

    const values = columns.map((col) => data[col]);

    if (debug) {
      debug({
        arg: {
          data,
          model: model.table,
        },
        sql: insertQuery,
      });
    }

    const result = await sql.unsafe(insertQuery, values);
    return result[0];
  }

  // Do update if record exists
  const updateColumns = columns.filter(
    (col) => !pkColumns.includes(col) && data[col] !== undefined
  );

  if (updateColumns.length === 0) {
    // No columns to update, return existing record
    const selectQuery = `
      SELECT * FROM ${model.table}
      WHERE ${whereClause}
    `;

    if (debug) {
      debug({
        arg: {
          where: whereConditions,
          model: model.table,
        },
        sql: selectQuery,
      });
    }

    const result = await sql.unsafe(selectQuery, whereValues);
    return result[0];
  }

  const updateClause = updateColumns
    .map((col, i) => `${col} = $${whereValues.length + i + 1}`)
    .join(", ");

  const updateQuery = `
    UPDATE ${model.table}
    SET ${updateClause}
    WHERE ${whereClause}
    RETURNING *
  `;

  const updateValues = [...whereValues, ...updateColumns.map((col) => data[col])];

  if (debug) {
    debug({
      arg: {
        data,
        where: whereConditions,
        model: model.table,
      },
      sql: updateQuery,
    });
  }

  const result = await sql.unsafe(updateQuery, updateValues);
  return result[0];
};
