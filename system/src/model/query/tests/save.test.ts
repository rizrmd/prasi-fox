import { beforeEach, describe, expect, it } from "bun:test";
import { sql } from "bun";
import { user } from "shared/generated/models/user";
import { save } from "../save";

describe("save", () => {
  // Test for insert operation (no primary key provided)
  it("should generate correct SQL for insert when no primary key is provided", async () => {
    const data = {
      display_name: "Test User",
      email: "test@example.com",
      username: "testuser",
    };

    const capturedQueries: string[] = [];

    // Mock sql.unsafe for insert
    const originalSqlUnsafe = sql.unsafe;
    const mockQuery = {
      active: true,
      cancelled: false,
      cancel: () => {},
      simple: () => Promise.resolve([]),
      run: () => Promise.resolve([]),
      values: () => Promise.resolve([]),
      all: () => Promise.resolve([]),
      then: (resolve: any) => resolve([{}])
    };

    sql.unsafe = (query: string, params: any[]) => {
      capturedQueries.push(query);
      console.log("Generated SQL for insert:", query);
      return mockQuery as any;
    };

    try {
      await save({
        data,
        model: user,
        debug: ({ sql }) => {
          console.log("Generated SQL for insert:", sql);
        },
      });
    } catch (error: any) {
      console.log("Unexpected error:", error.message);
    } finally {
      // Restore original sql.unsafe
      sql.unsafe = originalSqlUnsafe;
    }

    // Verify the SQL contains the expected clauses for insert
    expect(capturedQueries[0]).toContain("INSERT INTO");
    expect(capturedQueries[0]).toContain("display_name");
    expect(capturedQueries[0]).toContain("email");
    expect(capturedQueries[0]).toContain("username");
    expect(capturedQueries[0]).toContain("VALUES");
    expect(capturedQueries[0]).toContain("RETURNING *");
  });

  // Test for update operation (primary key provided)
  it("should generate correct SQL for update when primary key is provided", async () => {
    const data = {
      id: "123e4567-e89b-12d3-a456-426614174000", // Primary key as UUID
      display_name: "Updated User",
      email: "updated@example.com",
    };

    const capturedQueries: string[] = [];

    // Mock sql.unsafe to return true for exists check (for update case)
    const originalSqlUnsafe = sql.unsafe;
    const mockQuery = {
      active: true,
      cancelled: false,
      cancel: () => {},
      simple: () => Promise.resolve([]),
      run: () => Promise.resolve([]),
      values: () => Promise.resolve([]),
      all: () => Promise.resolve([]),
      then: (resolve: any) => {
        const lastQuery = capturedQueries[capturedQueries.length - 1];
        if (lastQuery && lastQuery.includes("SELECT EXISTS")) {
          return resolve([{ exists: true }]);
        }
        return resolve([{}]);
      }
    };

    sql.unsafe = (query: string, params: any[]) => {
      capturedQueries.push(query);
      console.log("Generated SQL:", query);
      return mockQuery as any;
    };

    try {
      await save({
        data,
        model: user,
        debug: ({ sql }) => {
          console.log("Generated SQL:", sql);
        },
      });
    } catch (error: any) {
      console.log("Unexpected error:", error.message);
    } finally {
      // Restore original sql.unsafe
      sql.unsafe = originalSqlUnsafe;
    }

    // First query should be EXISTS check
    expect(capturedQueries[0]).toContain("SELECT EXISTS");
    expect(capturedQueries[0]).toContain("WHERE id =");

    // Second query should be UPDATE since record would exist
    expect(capturedQueries[1]).toContain("UPDATE");
    expect(capturedQueries[1]).toContain("SET");
    expect(capturedQueries[1]).toContain("display_name =");
    expect(capturedQueries[1]).toContain("email =");
    expect(capturedQueries[1]).toContain("WHERE id =");
    expect(capturedQueries[1]).toContain("RETURNING *");
  });

  // Test for checking existence before update
  it("should check record existence before updating", async () => {
    const data = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      display_name: "Updated User",
    };

    const capturedQueries: string[] = [];

    // Mock sql.unsafe 
    const originalSqlUnsafe = sql.unsafe;
    const mockQuery = {
      active: true,
      cancelled: false,
      cancel: () => {},
      simple: () => Promise.resolve([]),
      run: () => Promise.resolve([]),
      values: () => Promise.resolve([]),
      all: () => Promise.resolve([]),
      then: (resolve: any) => {
        const lastQuery = capturedQueries[capturedQueries.length - 1];
        if (lastQuery && lastQuery.includes("SELECT EXISTS")) {
          return resolve([{ exists: true }]);
        }
        return resolve([{}]);
      }
    };

    sql.unsafe = (query: string, params: any[]) => {
      capturedQueries.push(query);
      console.log("Generated SQL:", query);
      return mockQuery as any;
    };

    try {
      await save({
        data,
        model: user,
        debug: ({ sql }) => {
          console.log("Generated SQL:", sql);
        },
      });
    } catch (error: any) {
      console.log("Unexpected error:", error.message);
    } finally {
      // Restore original sql.unsafe
      sql.unsafe = originalSqlUnsafe;
    }

    // First query should be EXISTS check
    expect(capturedQueries[0]).toContain("SELECT EXISTS");
    expect(capturedQueries[0]).toContain("WHERE id =");
  });

  // Test for insert when record doesn't exist with primary key
  it("should insert when record with primary key doesn't exist", async () => {
    const data = {
      id: "123e4567-e89b-12d3-a456-426614174999", // Non-existent UUID
      display_name: "New User",
      email: "new@example.com",
    };

    const capturedQueries: string[] = [];

    // Mock sql.unsafe to return false for exists check
    const originalSqlUnsafe = sql.unsafe;
    const mockQuery = {
      active: true,
      cancelled: false,
      cancel: () => {},
      simple: () => Promise.resolve([]),
      run: () => Promise.resolve([]),
      values: () => Promise.resolve([]),
      all: () => Promise.resolve([]),
      then: (resolve: any) => {
        const lastQuery = capturedQueries[capturedQueries.length - 1];
        if (lastQuery && lastQuery.includes("SELECT EXISTS")) {
          return resolve([{ exists: false }]);
        }
        return resolve([{}]);
      }
    };

    sql.unsafe = (query: string, params: any[]) => {
      capturedQueries.push(query);
      console.log("Generated SQL:", query);
      return mockQuery as any;
    };

    try {
      await save({
        data,
        model: user,
        debug: ({ sql }) => {
          console.log("Generated SQL:", sql);
        },
      });

      // First query should be EXISTS check
      expect(capturedQueries[0]).toContain("SELECT EXISTS");
      
      // Second query should be INSERT since record doesn't exist
      expect(capturedQueries[1]).toContain("INSERT INTO");
      expect(capturedQueries[1]).toContain("id");
      expect(capturedQueries[1]).toContain("display_name");
      expect(capturedQueries[1]).toContain("email");
    } catch (error: any) {
      console.log("Unexpected error:", error.message);
    } finally {
      // Restore original sql.unsafe
      sql.unsafe = originalSqlUnsafe;
    }
  });

  // Test error when no primary key columns in model
  it("should throw error if model has no primary key columns", async () => {
    const modelWithoutPK = {
      ...user,
      columns: Object.fromEntries(
        Object.entries(user.columns).map(([key, value]) => [
          key,
          typeof value === "object" ? { ...value, primary: false } : value,
        ])
      ),
    };

    const data = {
      display_name: "Test User",
    };

    try {
      await save({
        data,
        model: modelWithoutPK,
      });
      throw new Error("Should not reach here");
    } catch (error: any) {
      expect(error.message).toContain("has no primary key columns");
    }
  });
});
