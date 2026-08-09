const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const flights = await prisma.flight.findMany({
    select: {
      id: true,
      flightNumber: true,
      departureCity: true,
      arrivalCity: true,
      category: true,
    }
  });

  console.log(`Total Flights in DB: ${flights.length}`);
  
  const duplicated = flights.filter(f => 
    f.departureCity.includes(' ') || f.arrivalCity.includes(' ') ||
    f.departureCity.includes('MCT') || f.arrivalCity.includes('MCT') ||
    f.departureCity.includes('DOH') || f.arrivalCity.includes('DOH')
  );

  console.log('Duplicated / Unformatted City Rows in DB:');
  console.log(JSON.stringify(duplicated, null, 2));

  await prisma.$disconnect();
}

main();
