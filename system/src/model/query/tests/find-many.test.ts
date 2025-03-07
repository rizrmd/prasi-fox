import { beforeEach, describe, expect, it } from "bun:test";
import { user } from "shared/generated/models/user";
import { findMany } from "../find-many";
import type { FieldItem, OrderByClause } from "../utils/types";

describe("findMany", () => {
  // Test for basic querying with pagination
  it("should generate correct SQL with pagination", async () => {
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
      await findMany({
        where,
        fields,
        model: user,
        limit: 3,
        offset: 0,
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
    expect(capturedSql).toContain("LIMIT 3");
  });

  // Test for ordering
  it("should generate correct SQL with ordering", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      "username",
    ] as const as FieldItem[];

    const orderBy: OrderByClause[] = [
      { field: "display_name", direction: "ASC" }
    ];

    let capturedSql = "";
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        orderBy,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL with order by:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains the ORDER BY clause
    expect(capturedSql).toContain("ORDER BY");
    expect(capturedSql).toContain("m_user.display_name ASC");
    expect(capturedSql).toContain("LIMIT");
  });

  // Test for multiple order by clauses
  it("should correctly handle multiple order by clauses", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      "username",
      "created_at",
    ] as const as FieldItem[];

    // Multiple orderBy fields with different directions
    const orderBy: OrderByClause[] = [
      { field: "created_at", direction: "DESC" },
      { field: "display_name", direction: "ASC" }
    ];

    let capturedSql = "";
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        orderBy,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL with multiple order by clauses:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains both ORDER BY clauses
    expect(capturedSql).toContain("ORDER BY");
    expect(capturedSql).toContain("m_user.created_at DESC");
    expect(capturedSql).toContain("m_user.display_name ASC");
    expect(capturedSql).toContain(", m_user.display_name ASC"); // Check correct formatting with comma
  });

  // Test for order by with NULLS FIRST/LAST
  it("should support NULLS FIRST/LAST in order by clauses", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      "last_login_at",
    ] as const as FieldItem[];

    // Using NULLS FIRST/LAST in ordering
    const orderBy: OrderByClause[] = [
      { field: "last_login_at", direction: "DESC", nulls: "LAST" },
      { field: "display_name", direction: "ASC", nulls: "FIRST" }
    ];

    let capturedSql = "";
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        orderBy,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL with NULLS FIRST/LAST:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains NULLS FIRST/LAST
    expect(capturedSql).toContain("m_user.last_login_at DESC NULLS LAST");
    expect(capturedSql).toContain("m_user.display_name ASC NULLS FIRST");
  });

  // Test for ordering by relation fields
  it("should support ordering by relation fields", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      // Include staff relation to ensure it's joined
      ["staff", "id", "name"],
      // Include session relation
      ["session", "id", "status"]
    ] as const as FieldItem[];

    // Order by fields in relations at various depths
    const orderBy: OrderByClause[] = [
      { field: "staff.name", direction: "ASC" },
      { field: "session.created_at", direction: "DESC" },
      // Base table field for mixed ordering
      { field: "display_name", direction: "ASC" }
    ];

    let capturedSql = "";
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        orderBy,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL with relation ordering:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains relation-based ORDER BY clauses
    expect(capturedSql).toContain("ORDER BY");
    expect(capturedSql).toContain("staff.name ASC");
    expect(capturedSql).toContain("session.created_at DESC");
    expect(capturedSql).toContain("m_user.display_name ASC");
  });

  // Test for ordering by deeply nested relation fields
  it("should support ordering by deeply nested relation fields", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      // Deep nested relation: staff → client
      ["staff", ["client", "id", "name", "company_name"]]
    ] as const as FieldItem[];

    // Order by deeply nested relation fields
    const orderBy: OrderByClause[] = [
      // Two levels deep relation sorting
      { field: "staff.client.name", direction: "ASC" },
      { field: "staff.client.company_name", direction: "DESC", nulls: "LAST" }
    ];

    let capturedSql = "";
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        orderBy,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL with deeply nested relation ordering:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }

    // Verify the SQL contains deeply nested relation-based ORDER BY clauses
    expect(capturedSql).toContain("ORDER BY");
    expect(capturedSql).toContain("staff_client.name ASC");
    expect(capturedSql).toContain("staff_client.company_name DESC NULLS LAST");
  });

  // Test for nested relations
  it("should generate correct SQL with nested relations", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    // Using valid relation paths based on the available model structure
    const fields = [
      "id",
      "display_name",
      // Nested relation: staff → client
      ["staff", ["client", "id", "name"]],
      // Simple relation with one field
      ["session", "id", "status"],
    ] as const as FieldItem[];

    let capturedSql = "";
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        limit: 5,
        debug: ({ sql }) => {
          capturedSql = sql;
          console.log("Generated SQL for nested relations:", sql);
        },
      });
    } catch (error: any) {
      // Expected to fail due to DB connection issues in test environment
      console.log("Expected error:", error.message);
    }
    
    // Verify SQL contains joins and nested relations
    expect(capturedSql).toContain("LEFT JOIN LATERAL");
    expect(capturedSql).toContain("m_staff");
    expect(capturedSql).toContain("m_client");
    expect(capturedSql).toContain("json_agg");
    expect(capturedSql).toContain("t_session");
    expect(capturedSql).toContain("LIMIT 5");
  });

  // Test for validation of orderBy relations
  it("should throw an error when ordering by a relation not included in fields", async () => {
    const where = [
      { field: "deleted_at", operator: "=" as const, value: null },
    ];

    const fields = [
      "id",
      "display_name",
      // Only include staff, but not client
      ["staff", "id", "name"]
    ] as const as FieldItem[];

    // Try to order by a relation that's not included in fields
    const orderBy: OrderByClause[] = [
      // This should fail because client is not included in fields
      { field: "client.name", direction: "ASC" }
    ];

    let errorMessage = '';
    
    try {
      await findMany({
        where,
        fields,
        model: user,
        orderBy,
      });
    } catch (error: any) {
      errorMessage = error.message;
      console.log("Expected validation error:", error.message);
    }

    // Verify the validation error
    expect(errorMessage).toContain("Relation \"client\" used in orderBy is not included in the query fields");
  });
}); 