const fs = require('fs');
const cheerio = require('cheerio');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const dbFlights = await prisma.flight.findMany({
    where: {
      OR: [
        { departureCity: { contains: 'AUH' } },
        { arrivalCity: { contains: 'AUH' } },
      ]
    }
  });

  console.log(`Found ${dbFlights.length} AUH flights in DB:`);
  for (const f of dbFlights) {
    console.log(`ID: ${f.id} | Flight: ${f.flightNumber} | Dep: "${f.departureCity}" | Arr: "${f.arrivalCity}" | Cat: "${f.category}"`);
  }

  await prisma.$disconnect();
}

main();
