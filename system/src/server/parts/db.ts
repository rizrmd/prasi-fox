import { sql } from "bun";

interface DatabaseConnectionResult {
  isConnected: boolean;
  error?: string;
}

/**
 * Check if the database connection is working
 * @returns {Promise<{ isConnected: boolean, error?: string }>} Connection status and error if any
 */
export async function checkDatabaseConnection(): Promise<DatabaseConnectionResult> {
  try {
    // Try to connect and execute a simple query
    // it will load from process.env.DATABASE_URL
    await sql`SELECT 1`;

    return {
      isConnected: true,
    };
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      isConnected: false,
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
