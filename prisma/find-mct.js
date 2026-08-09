const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mctFlights = await prisma.flight.findMany({
    where: {
      OR: [
        { departureCity: { contains: 'MCT' } },
        { arrivalCity: { contains: 'MCT' } },
        { departureCity: { contains: 'DOH' } },
        { arrivalCity: { contains: 'DOH' } },
      ]
    }
  });

  console.log(`Found ${mctFlights.length} MCT/DOH flights in DB:`);
  for (const f of mctFlights) {
    console.log(`ID: ${f.id} | Flight: ${f.flightNumber} | Dep: "${f.departureCity}" | Arr: "${f.arrivalCity}"`);
  }

  await prisma.$disconnect();
}

main();
