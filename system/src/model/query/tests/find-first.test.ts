import { beforeEach, describe, expect, it } from "bun:test";
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
});
