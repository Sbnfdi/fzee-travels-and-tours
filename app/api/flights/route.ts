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
