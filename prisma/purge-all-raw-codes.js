const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Purging all uncleaned/duplicate city and airline rows from database...');

  const deleted = await prisma.flight.deleteMany({
    where: {
      OR: [
        { departureCity: { contains: 'AUH' } },
        { arrivalCity: { contains: 'AUH' } },
        { departureCity: { contains: 'MCT' } },
        { arrivalCity: { contains: 'MCT' } },
        { departureCity: { contains: 'DOH' } },
        { arrivalCity: { contains: 'DOH' } },
        { departureCity: { contains: 'JED' } },
        { arrivalCity: { contains: 'JED' } },
        { departureCity: { contains: 'SHJ' } },
        { arrivalCity: { contains: 'SHJ' } },
        { departureCity: { contains: 'DXB' } },
        { arrivalCity: { contains: 'DXB' } },
        { departureCity: { contains: 'RUH' } },
        { arrivalCity: { contains: 'RUH' } },
        { departureCity: { contains: 'PEW' } },
        { arrivalCity: { contains: 'PEW' } },
        { departureCity: { contains: 'ISB' } },
        { arrivalCity: { contains: 'ISB' } },
        { departureCity: { contains: 'LHE' } },
        { arrivalCity: { contains: 'LHE' } },
        { departureCity: { contains: 'KHI' } },
        { arrivalCity: { contains: 'KHI' } },
        { airline: { contains: 'Islamabad' } },
        { airline: { contains: 'Peshawar' } },
        { airline: { contains: 'Lahore' } },
        { airline: { contains: 'Karachi' } },
      ]
    }
  });

  console.log(`Deleted ${deleted.count} stale/uncleaned flight records from DB.`);
  await prisma.$disconnect();
}

main();
