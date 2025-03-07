import { beforeEach, describe, expect, it } from "bun:test";
import { user } from "shared/generated/models/user";
import { findList } from "../find-list";
import type { FieldItem } from "../utils/types";

describe("findList", () => {
  // Test for basic querying with pagination
  it("should generate correct SQL with page-based pagination", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      "email",
      "username",
    ] as const as FieldItem[];

    let capturedSql = "";
    
    try {
      await findList({
        where,
        fields,
        model: user,
        currentPage: 2,
        itemPerPage: 5,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains the expected clauses
    expect(capturedSql).toContain("SELECT");
    expect(capturedSql).toContain("m_user.id");
    expect(capturedSql).toContain("m_user.display_name");
    expect(capturedSql).toContain("m_user.email");
    expect(capturedSql).toContain("m_user.username");
    expect(capturedSql).toContain("WHERE");
    expect(capturedSql).toContain("m_user.deleted_at");
    expect(capturedSql).toContain("LIMIT 5");
    expect(capturedSql).toContain("OFFSET 5"); // Page 2 starts at offset 5 with 5 items per page
  });

  // Test with ordering
  it("should generate correct SQL with ordering", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      "email",
    ] as const as FieldItem[];

    let capturedSql = "";
    
    try {
      await findList({
        where,
        fields,
        model: user,
        currentPage: 1,
        itemPerPage: 10,
        orderBy: [{ field: "display_name", direction: "DESC" }],
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL with ordering:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains the expected clauses
    expect(capturedSql).toContain("ORDER BY m_user.display_name DESC");
    expect(capturedSql).toContain("LIMIT 10");
    expect(capturedSql).toContain("OFFSET 0");
  });
}); 