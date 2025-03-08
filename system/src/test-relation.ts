import { sql } from "bun";

async function testRelationComments() {
  const connectionString = Bun.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment");
    process.exit(1);
  }

  const url = new URL(connectionString);
  url.searchParams.set("sslmode", "prefer");

  console.log("🔌 Connecting to database...");
  try {
    await sql`SELECT 1`;
    console.log("✅ Connected to database");

    // Drop test tables if they exist
    console.log("🗑️ Dropping test tables...");
    await sql`DROP TABLE IF EXISTS t_test_child CASCADE;`;
    await sql`DROP TABLE IF EXISTS t_test_parent CASCADE;`;
    
    // Create parent table
    console.log("📝 Creating parent table...");
    await sql`
      CREATE TABLE t_test_parent (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL
      );
    `;
    
    // Create child table with foreign key
    console.log("📝 Creating child table with foreign key...");
    await sql`
      CREATE TABLE t_test_child (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        parent_id UUID REFERENCES t_test_parent(id)
      );
    `;
    
    // Add comment to the foreign key constraint
    console.log("📝 Adding comment to foreign key constraint...");
    const constraintName = await sql`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 't_test_child'::regclass 
      AND contype = 'f';
    `;
    
    if (constraintName.length > 0) {
      const fkName = constraintName[0].conname;
      console.log(`Found constraint: ${fkName}`);
      
      await sql.unsafe(`
        COMMENT ON CONSTRAINT ${fkName} ON t_test_child IS 'This is a test relation comment';
      `);
      
      // Verify the comment was added
      const comment = await sql`
        SELECT obj_description(pc.oid, 'pg_constraint') as comment
        FROM pg_constraint pc
        WHERE pc.conname = ${fkName};
      `;
      
      console.log(`Comment on constraint: ${comment[0].comment || "No comment"}`);
      
      // Test the model-pull query for foreign keys
      console.log("\nTesting model-pull query for foreign keys:");
      const relations = await sql`
        SELECT
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name,
          obj_description(pc.oid, 'pg_constraint') AS constraint_comment
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu 
          ON ccu.constraint_name = tc.constraint_name
        LEFT JOIN pg_constraint pc
          ON pc.conname = tc.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
          AND tc.table_name = 't_test_child';
      `;
      
      for (const row of relations) {
        console.log(`- FK from ${row.table_name}.${row.column_name} to ${row.foreign_table_name}.${row.foreign_column_name}`);
        console.log(`  Comment: ${row.constraint_comment || "No comment"}`);
      }
    } else {
      console.log("No foreign key constraint found");
    }
    
  } catch (error) {
    console.error("Failed:", error);
    process.exit(1);
  }
}

testRelationComments(); 