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

    // Auto-seed default hotels if database is empty
    if (hotels.length === 0 && (!city || city === 'all')) {
      const defaultHotels = [
        {
          id: 'hotel-1',
          name: 'Pullman Zamzam Makkah Tower',
          city: 'Makkah',
          country: 'Saudi Arabia',
          address: 'Abraj Al Bait Complex, Makkah',
          starRating: 5,
          pricePerNight: 42000,
          currency: 'PKR',
          description: 'Direct Haram view Luxury 5-Star Hotel with 24/7 dining & shuttle services.',
          amenities: 'Free WiFi, Haram View, Buffet Breakfast, Room Service',
        },
        {
          id: 'hotel-2',
          name: 'Dar Al Taqwa Hotel Madinah',
          city: 'Madinah',
          country: 'Saudi Arabia',
          address: 'Off Court Yard, Al Masjid an Nabawi',
          starRating: 5,
          pricePerNight: 38000,
          currency: 'PKR',
          description: 'Premier location opposite Prophet\'s Mosque main entrance for easy access.',
          amenities: 'Free WiFi, Mosque Entrance View, Executive Lounge',
        },
        {
          id: 'hotel-3',
          name: 'Shangrila Resort Skardu',
          city: 'Skardu',
          country: 'Pakistan',
          address: 'Kachura Lake, Skardu',
          starRating: 4,
          pricePerNight: 28000,
          currency: 'PKR',
          description: 'Scenic lakeside cottages surrounded by snow-capped Himalayan peaks.',
          amenities: 'Boating, Restaurant, Garden, Heating, Airport Transfer',
        },
        {
          id: 'hotel-4',
          name: 'JW Marriott Marquis Hotel Dubai',
          city: 'Dubai',
          country: 'UAE',
          address: 'Business Bay, Sheikh Zayed Road, Dubai',
          starRating: 5,
          pricePerNight: 65000,
          currency: 'PKR',
          description: 'Iconic twin-tower luxury hotel near Burj Khalifa and Dubai Mall.',
          amenities: 'Outdoor Pool, Spa, 12 Restaurants, Free Shuttle',
        },
      ];

      for (const h of defaultHotels) {
        await prisma.hotel.upsert({
          where: { id: h.id },
          update: {},
          create: h,
        });
      }

      hotels = await prisma.hotel.findMany({
        where,
        orderBy: { starRating: 'desc' },
      });
    }

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
