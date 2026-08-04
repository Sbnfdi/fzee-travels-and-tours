const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('Creating FlightCategory table in Turso...');
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "FlightCategory" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await client.execute(`
      CREATE UNIQUE INDEX IF NOT EXISTS "FlightCategory_name_key" ON "FlightCategory"("name")
    `);
    
    console.log('Successfully created FlightCategory table and indexes.');

    // Seed initial categories if table is empty
    const { rows } = await client.execute('SELECT count(*) as count FROM "FlightCategory"');
    if (rows[0].count === 0) {
      console.log('Seeding initial categories...');
      const initialCategories = ['UAE One Way', 'KSA One Way', 'Oman One Way', 'Bahrain One Way', 'Umrah', 'Qatar One Way', 'UK One Way'];
      for (const cat of initialCategories) {
        await client.execute({
          sql: 'INSERT INTO "FlightCategory" (id, name) VALUES (?, ?)',
          args: [require('crypto').randomUUID(), cat]
        });
      }
      console.log('Seeding complete.');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
