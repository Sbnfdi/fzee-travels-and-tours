import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

export const GET = withAuth(async (req: NextRequest, { params }: any) => {
  try {
    const user = (req as any).user;
    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        group: true,
        hotel: true,
        flight: true,
        visa: true,
        agency: true,
        agent: { include: { user: true } },
        payments: true,
        invoices: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check ownership if user is a travel agent
    if (user.role === 'TRAVEL_AGENT') {
      const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });
      if (!agent || booking.agencyId !== agent.agencyId) {
        return NextResponse.json({ error: 'Forbidden: Access denied to this booking' }, { status: 403 });
      }
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Booking detail GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking details' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (req: NextRequest, { params }: any) => {
  try {
    const user = (req as any).user;
    const { id } = await params;

    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check ownership if user is a travel agent
    if (user.role === 'TRAVEL_AGENT') {
      const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });
      if (!agent || booking.agencyId !== agent.agencyId) {
        return NextResponse.json({ error: 'Forbidden: Access denied to this booking' }, { status: 403 });
      }
    }

    await prisma.$transaction(async (tx: TransactionClient) => {
      await tx.booking.delete({ where: { id } });

      if (booking.bookingType === 'GROUP' && booking.groupId) {
        await tx.group.update({
          where: { id: booking.groupId },
          data: { availableSlots: { increment: booking.numberOfPax } },
        });
      } else if (booking.bookingType === 'FLIGHT' && booking.flightId) {
        await tx.flight.update({
          where: { id: booking.flightId },
          data: { availableSeats: { increment: booking.numberOfPax } },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled and slots/seats returned to inventory.',
    });
  } catch (error) {
    console.error('Booking DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
});
