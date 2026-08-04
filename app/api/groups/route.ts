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
