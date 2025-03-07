import { describe, expect, it } from "bun:test";
import type { WhereClause } from "../utils/types";
import { user } from "shared/generated/models/user";
import { findFirst } from "../find-first";
import type { FieldItem } from "../utils/types";

describe("findFirst", () => {
  // Test for nested relations with unlimited depth
  it("should handle nested relations with unlimited depth", async () => {
    const where = [
      { field: "email", operator: "=" as const, value: "test@example.com" },
    ];

    // Using valid relation paths based on the available model structure
    // m_user has staff relation and m_staff has client relation
    const fields = [
      "id",
      "display_name",
      "email",
      "username",
      // Nested relation: staff → client
      // This format: [[outer_relation, fields...], [inner_relation, fields...]]
      ["staff", ["client", "id", "name"]],
      // Simple relation with one field
      ["session", "id", "status"],
    ] as const as FieldItem[];

    let capturedSql = "";

    try {
      const result = await findFirst({
        where,
        fields,
        model: user,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL for nested relations:", sql);
        },
      });
      console.log("Result with nested relations:", result);
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify SQL contains expected clauses
    expect(capturedSql).toContain("SELECT");
    expect(capturedSql).toContain("m_user.id");
    expect(capturedSql).toContain("m_user.display_name");
    expect(capturedSql).toContain("LEFT JOIN LATERAL");
  });

  // Test for has_many relations with multiple records
  it("should retrieve all records for has_many relations", async () => {
    const where = [
      { field: "email", operator: "=" as const, value: "test@example.com" },
    ];

    const fields = [
      "id",
      "email",
      // This should return ALL sessions for the user, not just one
      ["session", "id", "status"],
    ] as const as FieldItem[];

    let capturedSql = "";

    try {
      const result = await findFirst({
        where,
        fields,
        model: user,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL for has_many relation:", sql);
        },
      });
      console.log("Result with has_many relation:", result);
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify SQL contains expected clauses
    expect(capturedSql).toContain("SELECT");
    expect(capturedSql).toContain("m_user.id");
    expect(capturedSql).toContain("m_user.email");
    expect(capturedSql).toContain("json_agg");
    expect(capturedSql).toContain("t_session");
  });

  // Test nested AND/OR conditions
  it("should handle nested AND/OR conditions", async () => {
    const where: WhereClause[] = [
      {
        or: [
          { field: "email", operator: "=", value: "test1@example.com" },
          {
            and: [
              { field: "username", operator: "LIKE", value: "test%" },
              { field: "deleted_at", operator: "=", value: null },
            ],
          },
        ],
      },
    ];

    const fields = [
      "id",
      "email",
      "username",
      "deleted_at",
    ] as const as FieldItem[];

    let capturedSql = "";
    let capturedParams: any[] = [];

    try {
      await findFirst({
        where,
        fields,
        model: user,
        debug: ({ sql, params }) => {
          capturedSql = sql;
          capturedParams = params || [];
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    console.log("Actual SQL:", JSON.stringify(capturedSql));

    // Verify individual parts of the SQL query
    expect(capturedSql).toContain("SELECT m_user.id");
    expect(capturedSql).toContain("m_user.email");
    expect(capturedSql).toContain("m_user.username");
    expect(capturedSql).toContain("m_user.deleted_at");
    expect(capturedSql).toContain("FROM m_user");
    expect(capturedSql).toContain("m_user.email = $1");
    expect(capturedSql).toContain("m_user.username LIKE $2");
    expect(capturedSql).toContain("m_user.deleted_at = $3");

    // Verify parameters are in correct order
    expect(capturedParams).toEqual(["test1@example.com", "test%", null]);
  });

  // Test deeply nested AND/OR conditions
  it("should handle deeply nested AND/OR conditions", async () => {
    const where: WhereClause[] = [
      {
        and: [
          { field: "email", operator: "!=", value: "admin@example.com" },
          {
            or: [
              { field: "deleted_at", operator: "=", value: null },
              {
                and: [
                  { field: "username", operator: "LIKE", value: "temp%" },
                  { field: "created_date", operator: ">", value: "2024-01-01" },
                ],
              },
            ],
          },
        ],
      },
    ];

    const fields = [
      "id",
      "email",
      "username",
      "deleted_at",
      "created_date",
    ] as const as FieldItem[];

    let capturedSql = "";
    let capturedParams: any[] = [];

    try {
      await findFirst({
        where,
        fields,
        model: user,
        debug: ({ sql, params }) => {
          capturedSql = sql;
          capturedParams = params || [];
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    console.log("Actual SQL:", JSON.stringify(capturedSql));

    // Verify individual parts of the SQL query
    expect(capturedSql).toContain("SELECT m_user.id");
    expect(capturedSql).toContain("m_user.email");
    expect(capturedSql).toContain("m_user.username");
    expect(capturedSql).toContain("m_user.deleted_at");
    expect(capturedSql).toContain("m_user.created_date");
    expect(capturedSql).toContain("FROM m_user");
    expect(capturedSql).toContain("m_user.email != $1");
    expect(capturedSql).toContain("m_user.deleted_at = $2");
    expect(capturedSql).toContain("m_user.username LIKE $3");
    expect(capturedSql).toContain("m_user.created_date > $4");

    // Verify parameters are in correct order
    expect(capturedParams).toEqual([
      "admin@example.com",
      null,
      "temp%",
      "2024-01-01"
    ]);
  });
});
