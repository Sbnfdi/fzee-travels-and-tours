const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const flights = await prisma.flight.findMany({
    select: {
      id: true,
      flightNumber: true,
      airline: true,
      departureCity: true,
      arrivalCity: true,
    }
  });

  const depCities = new Set();
  const arrCities = new Set();

  flights.forEach(f => {
    depCities.add(f.departureCity);
    arrCities.add(f.arrivalCity);
  });

  console.log(`Total Flights in DB: ${flights.length}`);
  console.log('Unique Departure Cities in DB:', Array.from(depCities));
  console.log('Unique Arrival Cities in DB:', Array.from(arrCities));

  const suspicious = flights.filter(f => 
    f.departureCity.includes('AUH') || f.arrivalCity.includes('AUH') ||
    f.departureCity.includes(' ') || f.arrivalCity.includes(' ')
  );

  console.log('Suspicious Cities:', JSON.stringify(suspicious, null, 2));

  await prisma.$disconnect();
}

main();
