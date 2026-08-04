import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');

    const where: any = { status: 'open' };
    if (destination) {
      where.destination = { contains: destination, mode: 'insensitive' };
    }

    let groups = await prisma.group.findMany({
      where,
      include: { agency: { include: { user: true } } },
      orderBy: { startDate: 'asc' },
    });

    // Seed default group tours in DB if database has no groups yet
    if (groups.length === 0 && !destination) {
      const defaultAgency = await prisma.agency.findFirst();
      if (defaultAgency) {
        const sampleTours = [
          {
            id: 'group-1',
            name: '14-Day Umrah Executive Group Package',
            destination: 'Makkah & Madinah, Saudi Arabia',
            duration: 14,
            startDate: new Date('2026-09-15'),
            endDate: new Date('2026-09-29'),
            totalSlots: 40,
            availableSlots: 28,
            pricePerPerson: 320000,
            currency: 'PKR',
            status: 'open',
            agencyId: defaultAgency.id,
          },
          {
            id: 'group-2',
            name: '7-Day Skardu Autumn Paradise Expedition',
            destination: 'Skardu & Shangrila, Pakistan',
            duration: 7,
            startDate: new Date('2026-10-05'),
            endDate: new Date('2026-10-12'),
            totalSlots: 25,
            availableSlots: 14,
            pricePerPerson: 145000,
            currency: 'PKR',
            status: 'open',
            agencyId: defaultAgency.id,
          },
          {
            id: 'group-3',
            name: '5-Day Dubai Luxury City & Desert Group Package',
            destination: 'Dubai, UAE',
            duration: 5,
            startDate: new Date('2026-11-10'),
            endDate: new Date('2026-11-15'),
            totalSlots: 30,
            availableSlots: 20,
            pricePerPerson: 210000,
            currency: 'PKR',
            status: 'open',
            agencyId: defaultAgency.id,
          },
        ];

        for (const t of sampleTours) {
          await prisma.group.upsert({
            where: { id: t.id },
            update: {},
            create: t,
          });
        }

        groups = await prisma.group.findMany({
          where,
          include: { agency: { include: { user: true } } },
          orderBy: { startDate: 'asc' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      groups,
      data: groups,
    });
  } catch (error) {
    console.error('Groups API error:', error);
    return NextResponse.json({ error: 'Failed to fetch tour groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, destination, duration, startDate, endDate, totalSlots, pricePerPerson } = body;

    if (!name || !destination || !startDate || !endDate || !totalSlots || !pricePerPerson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const defaultAgency = await prisma.agency.findFirst();
    if (!defaultAgency) {
      return NextResponse.json({ error: 'No agency found to link the group to' }, { status: 400 });
    }

    const newGroup = await prisma.group.create({
      data: {
        name,
        destination,
        duration: Number(duration),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalSlots: Number(totalSlots),
        availableSlots: Number(totalSlots),
        pricePerPerson: Number(pricePerPerson),
        currency: 'PKR',
        status: 'open',
        agencyId: defaultAgency.id,
      },
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Failed to create tour package' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    await prisma.group.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Tour package removed successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json({ error: 'Failed to remove tour package' }, { status: 500 });
  }
}
