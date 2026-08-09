import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/lib/middleware';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get('destination');

    const where: any = { status: 'open' };
    if (destination) {
      where.destination = { contains: destination };
    }

    let groups = await prisma.group.findMany({
      where,
      include: { agency: { include: { user: true } } },
      orderBy: { startDate: 'asc' },
    });

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

export const POST = withRole('SUPER_ADMIN', 'ADMIN', 'BOOKING_MANAGER')(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();
    const { name, destination, duration, startDate, endDate, totalSlots, pricePerPerson } = body;

    if (!name || !destination || !startDate || !endDate || !totalSlots || !pricePerPerson) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find agency linked to the logged in user, or default main agency
    let agency = await prisma.agency.findFirst({ where: { userId: user.userId } });
    if (!agency) {
      agency = await prisma.agency.findFirst();
    }

    if (!agency) {
      return NextResponse.json({ error: 'No agency found to link the group package' }, { status: 400 });
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
        agencyId: agency.id,
      },
    });

    return NextResponse.json({ success: true, group: newGroup });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ error: 'Failed to create tour package' }, { status: 500 });
  }
});

export const DELETE = withRole('SUPER_ADMIN', 'ADMIN', 'BOOKING_MANAGER')(async (request: NextRequest) => {
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
});
