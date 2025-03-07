import { beforeEach, describe, expect, it } from "bun:test";
import { sql } from "bun";
import { save } from "../save";
import type { ModelDefinition } from "../../types";

// Create a simplified test suite for save functionality
describe("save", () => {
  let capturedQueries: string[] = [];
  let originalSqlUnsafe: any;
  
  beforeEach(() => {
    // Clear captured queries before each test
    capturedQueries = [];
    
    // Save the original sql.unsafe
    originalSqlUnsafe = sql.unsafe;
    
    // Create a mock SQLQuery object
    const mockQueryResult = {
      execute: () => Promise.resolve([{ id: 'test-id' }]),
      raw: () => Promise.resolve([{ id: 'test-id' }]),
      catch: (fn: any) => Promise.resolve([{ id: 'test-id' }]).catch(fn),
      finally: (fn: any) => Promise.resolve([{ id: 'test-id' }]).finally(fn),
      [Symbol.toStringTag]: 'Promise',
      
      // Add methods used in the code
      active: true,
      cancelled: false,
      cancel: () => {},
      simple: () => Promise.resolve([]),
      run: () => Promise.resolve([]),
      values: () => Promise.resolve([]),
      all: () => Promise.resolve([{ id: 'test-id' }]),
      then: (resolve: any) => resolve([{ id: 'test-id' }])
    };
    
    // Mock sql.unsafe to capture queries
    sql.unsafe = (query: string, values?: any[]) => {
      capturedQueries.push(query);
      console.log("SQL Query:", query);
      return mockQueryResult as any;
    };
  });

  it("should generate correct SQL for insert", async () => {
    // Test data
    const data = {
      display_name: "Test User",
      email: "test@example.com"
    };

    // Create a simplified model definition
    const testModel: ModelDefinition = {
      table: "m_user",
      columns: {
        id: { 
          type: "uuid", 
          primary: true 
        },
        display_name: { 
          type: "text" 
        },
        email: { 
          type: "text" 
        }
      }
    };
    
    // Mock the begin method on sql since Bun's mock.module doesn't seem to work here
    const originalBegin = sql.begin;
    sql.begin = async (fn: any) => fn({
      unsafe: sql.unsafe
    });
    
    try {
      // Execute the save function with our test model
      const result = await save({
        data,
        model: testModel,
        debug: ({ sql }) => console.log("Debug SQL:", sql)
      });
      
      console.log("Save result:", result);
      console.log("Captured queries:", capturedQueries);
      
      // Check that at least one query was generated
      expect(capturedQueries.length).toBeGreaterThan(0);
      
      // Check that the first query is an INSERT
      const insertQuery = capturedQueries.find(q => q.includes("INSERT INTO"));
      expect(insertQuery).toBeDefined();
      if (insertQuery) {
        expect(insertQuery).toContain("INSERT INTO m_user");
        expect(insertQuery).toContain("display_name");
        expect(insertQuery).toContain("email");
        expect(insertQuery).toContain("VALUES");
        expect(insertQuery).toContain("RETURNING *");
      }
    } catch (error) {
      console.error("Test error:", error);
      throw error;
    } finally {
      // Restore original sql methods
      sql.unsafe = originalSqlUnsafe;
      sql.begin = originalBegin;
    }
  });
});
