require('dotenv').config();
const { createClient } = require('@libsql/client');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

async function alter() {
  console.log('Altering Flight table...');
  try {
    await client.execute('ALTER TABLE Flight ADD COLUMN baggage TEXT;');
    console.log('Added baggage column');
  } catch(e) { console.log('baggage error (might exist):', e.message); }
  
  try {
    await client.execute('ALTER TABLE Flight ADD COLUMN meal INTEGER NOT NULL DEFAULT 0;');
    console.log('Added meal column');
  } catch(e) { console.log('meal error (might exist):', e.message); }
  
  try {
    await client.execute('ALTER TABLE Flight ADD COLUMN category TEXT;');
    console.log('Added category column');
  } catch(e) { console.log('category error (might exist):', e.message); }
  
  console.log('Done altering.');
}

alter().then(() => client.close());
