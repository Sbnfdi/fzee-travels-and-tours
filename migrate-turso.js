require('dotenv').config();
const { createClient } = require('@libsql/client');

async function main() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoAuthToken) {
    console.error('Missing Turso credentials in .env');
    process.exit(1);
  }

  const client = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  });

  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS "SystemSettings" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
          "currency" TEXT NOT NULL DEFAULT 'PKR',
          "defaultCreditLimit" REAL NOT NULL DEFAULT 100000,
          "autoApproveAgencies" BOOLEAN NOT NULL DEFAULT true,
          "bankName" TEXT NOT NULL DEFAULT 'Fzee Travels Bank Pakistan',
          "bankAccountName" TEXT NOT NULL DEFAULT 'Fzee Travels & Tours (Pvt) Ltd',
          "bankAccountNumber" TEXT NOT NULL DEFAULT '0123-4567890-01',
          "updatedAt" DATETIME NOT NULL
      );
    `);
    console.log('Successfully created SystemSettings table on Turso!');
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

main();
