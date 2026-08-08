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
  baggage: z.string().optional(),
  meal: z.boolean().optional().default(false),
  category: z.string().optional(),
});

/**
 * Calculate the current dynamic fare based on how many seats are sold.
 * fareTiers is a JSON array of { upToSeat: number, price: number } sorted by upToSeat ascending.
 * "upToSeat" means: "for seat numbers up to this limit, use this price".
 *
 * Example: totalSeats=200, availableSeats=200 => 0 seats sold, next seat to buy is #1
 * fareTiers: [{ upToSeat: 100, price: 90000 }, { upToSeat: 200, price: 120000 }]
 * => nextSeatNumber (1) <= 100, so price = 90000
 */
export function getCurrentFare(flight: { totalSeats: number; availableSeats: number; pricePerSeat: number; fareTiers?: string | null }): number {
  if (!flight.fareTiers) return flight.pricePerSeat;

  try {
    const tiers: { upToSeat: number; price: number }[] = JSON.parse(flight.fareTiers);
    if (!Array.isArray(tiers) || tiers.length === 0) return flight.pricePerSeat;

    const seatsSold = flight.totalSeats - flight.availableSeats;
    const nextSeatNumber = seatsSold + 1;

    // Sort tiers by upToSeat ascending
    const sortedTiers = [...tiers].sort((a, b) => a.upToSeat - b.upToSeat);

    for (const tier of sortedTiers) {
      if (nextSeatNumber <= tier.upToSeat) {
        return tier.price;
      }
    }

    // If all tiers exceeded, use the last tier's price
    return sortedTiers[sortedTiers.length - 1].price;
  } catch {
    return flight.pricePerSeat;
  }
}

export async function GET(req: NextRequest) {
  try {
    let flights = await prisma.flight.findMany({
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

const updateFlightSchema = z.object({
  id: z.string(),
  flightNumber: z.string().min(2).optional(),
  pnr: z.string().optional(),
  airline: z.string().min(2).optional(),
  departureCity: z.string().min(2).optional(),
  arrivalCity: z.string().min(2).optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  duration: z.number().positive().optional(),
  totalSeats: z.number().positive().optional(),
  availableSeats: z.number().nonnegative().optional(),
  pricePerSeat: z.number().positive().optional(),
  fareTiers: z.string().optional().nullable(),
  aircraftType: z.string().optional(),
  baggage: z.string().optional(),
  meal: z.boolean().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = updateFlightSchema.parse(body);
    const { id, ...updateData } = data;

    const existing = await prisma.flight.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    const updatedData: any = { ...updateData };
    if (updateData.departureTime) updatedData.departureTime = new Date(updateData.departureTime);
    if (updateData.arrivalTime) updatedData.arrivalTime = new Date(updateData.arrivalTime);

    const updated = await prisma.flight.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ success: true, data: updated, flight: updated });
  } catch (error) {
    console.error('Flights API PUT error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update flight' }, { status: 500 });
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
