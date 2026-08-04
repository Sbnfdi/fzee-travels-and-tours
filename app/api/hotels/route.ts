import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createHotelSchema = z.object({
  name: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  address: z.string().min(2),
  starRating: z.number().min(1).max(5),
  pricePerNight: z.number().positive(),
  description: z.string().optional(),
  amenities: z.string().optional(),
  roomTypes: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city');

    const where: any = {};
    if (city && city !== 'all') where.city = { contains: city, mode: 'insensitive' };

    let hotels = await prisma.hotel.findMany({
      where,
      orderBy: { starRating: 'desc' },
    });



    return NextResponse.json({ success: true, hotels, data: hotels });
  } catch (error) {
    console.error('Hotels API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch hotels' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createHotelSchema.parse(body);

    const hotel = await prisma.hotel.create({
      data: { ...validatedData, currency: 'PKR' },
    });

    return NextResponse.json({ success: true, data: hotel });
  } catch (error) {
    console.error('Hotels API POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create hotel' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Hotel ID is required' }, { status: 400 });
    }

    await prisma.hotel.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Hotel removed successfully' });
  } catch (error) {
    console.error('Hotels DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete hotel' }, { status: 500 });
  }
}
