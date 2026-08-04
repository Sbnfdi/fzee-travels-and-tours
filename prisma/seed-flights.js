require('dotenv').config();
const { createClient } = require('@libsql/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { PrismaClient } = require('@prisma/client');

async function seedFlights() {
  let prisma;
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && authToken) {
    const adapter = new PrismaLibSql({ url, authToken });
    prisma = new PrismaClient({ adapter });
  } else {
    prisma = new PrismaClient();
  }

  console.log('Seeding flights...');
  
  const flightsToCreate = [
    {
      flightNumber: '9P 700',
      airline: 'FlyJinnah',
      departureCity: 'ISB',
      arrivalCity: 'JED',
      departureTime: new Date('2026-08-12T06:40:00Z'),
      arrivalTime: new Date('2026-08-12T10:05:00Z'),
      duration: 205,
      totalSeats: 200,
      availableSeats: 45,
      pricePerSeat: 140000,
      currency: 'PKR',
      baggage: '20+07 KG',
      meal: false,
      category: 'Umrah',
      status: 'active'
    },
    {
      flightNumber: '9P 746',
      airline: 'FlyJinnah',
      departureCity: 'ISB',
      arrivalCity: 'SHJ',
      departureTime: new Date('2026-08-09T21:10:00Z'),
      arrivalTime: new Date('2026-08-09T23:25:00Z'),
      duration: 135,
      totalSeats: 180,
      availableSeats: 30,
      pricePerSeat: 112000,
      currency: 'PKR',
      baggage: '20+10 KG',
      meal: false,
      category: 'UAE One Way',
      status: 'active'
    },
    {
      flightNumber: 'G9 557',
      airline: 'AirArabia',
      departureCity: 'PEW',
      arrivalCity: 'SHJ',
      departureTime: new Date('2026-08-07T11:40:00Z'),
      arrivalTime: new Date('2026-08-07T13:40:00Z'),
      duration: 120,
      totalSeats: 180,
      availableSeats: 20,
      pricePerSeat: 120000,
      currency: 'PKR',
      baggage: '20+10 KG',
      meal: false,
      category: 'UAE One Way',
      status: 'active'
    },
    {
      flightNumber: 'SV 725',
      airline: 'Saudia Airlines',
      departureCity: 'ISB',
      arrivalCity: 'RUH',
      departureTime: new Date('2026-08-08T09:50:00Z'),
      arrivalTime: new Date('2026-08-08T12:35:00Z'),
      duration: 165,
      totalSeats: 300,
      availableSeats: 120,
      pricePerSeat: 140000,
      currency: 'PKR',
      baggage: '23+07 KG',
      meal: true,
      category: 'KSA One Way',
      status: 'active'
    }
  ];

  for (const f of flightsToCreate) {
    await prisma.flight.create({ data: f });
    console.log(`Added ${f.airline} flight ${f.flightNumber}`);
  }

  console.log('Seed complete.');
}

seedFlights().catch(console.error);
