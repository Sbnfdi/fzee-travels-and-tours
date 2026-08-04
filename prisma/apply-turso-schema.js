require('dotenv').config();
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  console.error('   TURSO_DATABASE_URL:', url ? '✅' : '❌ not found');
  console.error('   TURSO_AUTH_TOKEN:  ', authToken ? '✅' : '❌ not found');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function applySchema() {
  console.log('🔗 Connecting to Turso:', url);

  const raw = fs.readFileSync(path.join(__dirname, 'turso_schema.sql'), 'utf8');

  // Strip BOM, normalize line endings
  const sql = raw.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');

  // Split on semicolons, keep only real SQL statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => {
      const noComments = s.replace(/--[^\n]*/g, '').trim();
      return noComments.length > 0;
    });

  console.log(`📋 Applying ${statements.length} SQL statements...\n`);

  let applied = 0;
  let skipped = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await client.execute(stmt);
      applied++;
      process.stdout.write(`\r  ✅ Applied: ${applied}  ⏭️  Skipped: ${skipped}`);
    } catch (err) {
      if (err.message?.includes('already exists')) {
        skipped++;
        process.stdout.write(`\r  ✅ Applied: ${applied}  ⏭️  Skipped: ${skipped}`);
      } else {
        console.error(`\n❌ Error on statement ${i + 1}:`, err.message);
        console.error('Statement preview:', stmt.substring(0, 300));
        process.exit(1);
      }
    }
  }

  console.log(`\n\n🎉 Done! Applied: ${applied}, Skipped (already existed): ${skipped}`);
  client.close();
}

applySchema().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
