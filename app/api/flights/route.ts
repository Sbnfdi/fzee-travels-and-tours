import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createFlightSchema = z.object({
  flightNumber: z.string().min(2),
  pnr: z.string().optional(),
  airline: z.string().min(2),
  departureCity: z.string().min(2),
  arrivalCity: z.string().min(2),
  departureTime: z.string(),
  arrivalTime: z.string(),
  duration: z.number().positive(),
  totalSeats: z.number().positive(),
  availableSeats: z.number().nonnegative(),
  pricePerSeat: z.number().positive(),
  fareTiers: z.string().optional(), // JSON string
  aircraftType: z.string().optional(),
});

/**
 * Calculate the current dynamic fare based on how many seats are sold.
 * fareTiers is a JSON array of { upToSeat: number, price: number } sorted by upToSeat ascending.
 * "upToSeat" means: "for seats sold from previous tier up to this seat number, use this price".
 *
 * Example: totalSeats=100, availableSeats=85 => 15 seats sold
 * fareTiers: [{ upToSeat: 10, price: 100000 }, { upToSeat: 30, price: 120000 }, { upToSeat: 100, price: 150000 }]
 * => 15 seats sold falls in the 2nd tier (11-30), so current price = 120000
 */
export function getCurrentFare(flight: { totalSeats: number; availableSeats: number; pricePerSeat: number; fareTiers?: string | null }): number {
  if (!flight.fareTiers) return flight.pricePerSeat;

  try {
    const tiers: { upToSeat: number; price: number }[] = JSON.parse(flight.fareTiers);
    if (!Array.isArray(tiers) || tiers.length === 0) return flight.pricePerSeat;

    const seatsSold = flight.totalSeats - flight.availableSeats;
    // Sort tiers by upToSeat ascending
    tiers.sort((a, b) => a.upToSeat - b.upToSeat);

    for (const tier of tiers) {
      if (seatsSold < tier.upToSeat) {
        return tier.price;
      }
    }

    // If all tiers exceeded, use the last tier's price
    return tiers[tiers.length - 1].price;
  } catch {
    return flight.pricePerSeat;
  }
}

export async function GET(req: NextRequest) {
  try {
    let flights = await prisma.flight.findMany({
      where: { status: 'active' },
      orderBy: { departureTime: 'asc' },
    });

    if (flights.length === 0) {
      const defaultFlights = [
        {
          id: 'fl-1',
          flightNumber: 'PK-735',
          pnr: 'ABC123',
          airline: 'PIA - Pakistan International Airlines',
          departureCity: 'Lahore (LHE)',
          arrivalCity: 'Jeddah (JED)',
          departureTime: new Date('2026-09-15T08:30:00Z'),
          arrivalTime: new Date('2026-09-15T12:15:00Z'),
          duration: 345,
          totalSeats: 250,
          availableSeats: 45,
          pricePerSeat: 165000,
          fareTiers: JSON.stringify([
            { upToSeat: 100, price: 145000 },
            { upToSeat: 200, price: 165000 },
            { upToSeat: 250, price: 195000 },
          ]),
          currency: 'PKR',
          aircraftType: 'Boeing 777-300ER',
          status: 'active',
        },
        {
          id: 'fl-2',
          flightNumber: 'EK-623',
          pnr: 'DEF456',
          airline: 'Emirates',
          departureCity: 'Karachi (KHI)',
          arrivalCity: 'Dubai (DXB)',
          departureTime: new Date('2026-10-01T22:00:00Z'),
          arrivalTime: new Date('2026-10-01T23:30:00Z'),
          duration: 150,
          totalSeats: 300,
          availableSeats: 32,
          pricePerSeat: 85000,
          fareTiers: JSON.stringify([
            { upToSeat: 150, price: 75000 },
            { upToSeat: 250, price: 85000 },
            { upToSeat: 300, price: 105000 },
          ]),
          currency: 'PKR',
          aircraftType: 'Airbus A380',
          status: 'active',
        },
        {
          id: 'fl-3',
          flightNumber: 'SV-738',
          pnr: 'GHI789',
          airline: 'Saudia Airlines',
          departureCity: 'Islamabad (ISB)',
          arrivalCity: 'Madinah (MED)',
          departureTime: new Date('2026-09-20T14:15:00Z'),
          arrivalTime: new Date('2026-09-20T18:45:00Z'),
          duration: 330,
          totalSeats: 220,
          availableSeats: 28,
          pricePerSeat: 175000,
          fareTiers: JSON.stringify([
            { upToSeat: 80, price: 155000 },
            { upToSeat: 180, price: 175000 },
            { upToSeat: 220, price: 210000 },
          ]),
          currency: 'PKR',
          aircraftType: 'Boeing 787 Dreamliner',
          status: 'active',
        },
      ];

      for (const f of defaultFlights) {
        await prisma.flight.upsert({
          where: { id: f.id },
          update: {},
          create: f,
        });
      }

      flights = await prisma.flight.findMany({
        where: { status: 'active' },
        orderBy: { departureTime: 'asc' },
      });
    }

    // Attach current dynamic fare to each flight
    const flightsWithFare = flights.map((f: any) => ({
      ...f,
      currentFare: getCurrentFare(f),
    }));

    return NextResponse.json({ success: true, flights: flightsWithFare, data: flightsWithFare });
  } catch (error) {
    console.error('Flights API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch flights' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = createFlightSchema.parse(body);

    const flight = await prisma.flight.create({
      data: {
        ...data,
        departureTime: new Date(data.departureTime),
        arrivalTime: new Date(data.arrivalTime),
        currency: 'PKR',
      },
    });

    return NextResponse.json({ success: true, data: flight });
  } catch (error) {
    console.error('Flights API POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create flight' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Flight ID is required' }, { status: 400 });
    }

    await prisma.flight.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Flight removed successfully' });
  } catch (error) {
    console.error('Flights DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete flight' }, { status: 500 });
  }
}
