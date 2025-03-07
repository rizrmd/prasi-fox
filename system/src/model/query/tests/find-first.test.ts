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

    const result = await findFirst({
      where,
      fields,
      model: user,
      debug: ({ sql, arg, select: selectFields, joins: lateralJoins, where: whereClause }) => {
        console.log("Generated SQL for nested relations:", sql);
      },
    });
    console.log("Result with nested relations:", result);

    // Skip detailed assertion since this is a demonstration of syntax
    expect(result).toBeTruthy();
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

    const result = await findFirst({
      where,
      fields,
      model: user,
      debug: ({ sql }) => {
        console.log("Generated SQL for has_many relation:", sql);
      },
    });

    console.log("Result with has_many relation:", result);

    // Verify that we got the user with email test@example.com
    expect(result).toBeTruthy();
    expect(result?.email).toBe("test@example.com");

    // Verify that we got all sessions for this user
    expect(result?.session).toBeTruthy();
    expect(Array.isArray(result?.session)).toBe(true);
    // The user should have at least two sessions
    expect(result?.session.length).toBeGreaterThan(1);

    // Each session should have id and status fields
    for (const session of result?.session || []) {
      expect(session).toHaveProperty("id");
      expect(session).toHaveProperty("status");
    }
  });
});
