require('dotenv').config();
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const { PrismaClient } = require('@prisma/client');
let prisma;

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (tursoUrl && tursoAuthToken) {
  console.log('Using Turso DB:', tursoUrl);
  const { createClient } = require('@libsql/client');
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');
  const libsql = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  console.log('Using local SQLite DB');
  prisma = new PrismaClient();
}

async function checkDatabase() {
  console.log('--- Checking Current Flight Data in DB ---');
  const count = await prisma.flight.count();
  console.log('Total flights in DB:', count);

  const categories = await prisma.flightCategory.findMany();
  console.log('Total categories in DB:', categories.length, categories.map(c => c.name));

  const sampleFlights = await prisma.flight.findMany({
    take: 8,
    orderBy: { updatedAt: 'desc' },
    select: {
      flightNumber: true,
      airline: true,
      departureCity: true,
      arrivalCity: true,
      pricePerSeat: true,
      category: true,
      pnr: true,
      baggage: true,
      meal: true,
    }
  });

  console.log('\n--- 8 Sample Synced Flights With Real Wholesale Fares ---');
  console.table(sampleFlights);
}

checkDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
