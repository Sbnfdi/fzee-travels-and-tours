import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  bookingId: z.string(),
  subtotal: z.number().positive(),
  tax: z.number().nonnegative(),
  discount: z.number().nonnegative().optional(),
  dueDate: z.string(),
  notes: z.string().optional(),
});

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;

    const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });

    const whereClause = agent ? { agencyId: agent.agencyId } : {};

    // Auto-generate invoice records for any bookings that don't have an invoice yet
    if (agent) {
      const bookingsWithoutInvoice = await prisma.booking.findMany({
        where: {
          agencyId: agent.agencyId,
          invoices: { none: {} },
        },
        include: { group: true, hotel: true, flight: true, visa: true },
      });

      for (const b of bookingsWithoutInvoice) {
        const invNum = `INV-${b.bookingNumber.replace('BK-', '')}`;
        await prisma.invoice.upsert({
          where: { invoiceNumber: invNum },
          update: {},
          create: {
            invoiceNumber: invNum,
            bookingId: b.id,
            agencyId: b.agencyId,
            subtotal: b.totalAmount,
            tax: Math.round(b.totalAmount * 0.05),
            discount: 0,
            totalAmount: Math.round(b.totalAmount * 1.05),
            currency: 'PKR',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: b.status === 'confirmed' ? 'paid' : 'issued',
          },
        });
      }
    }

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      include: { booking: { include: { group: true, hotel: true, flight: true, visa: true } }, agency: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      invoices: invoices.map((inv) => {
        const b = inv.booking;
        let name = 'Unknown Booking';
        if (b) {
          if (b.bookingType === 'GROUP') name = b.group?.name || 'Group Package';
          if (b.bookingType === 'HOTEL') name = b.hotel?.name ? `${b.hotel.name} Reservation` : 'Hotel Reservation';
          if (b.bookingType === 'FLIGHT') name = b.flight?.airline ? `${b.flight.airline} Flight ${b.flight.flightNumber}` : 'Flight Ticket';
          if (b.bookingType === 'VISA') name = b.visa?.country ? `${b.visa.country} ${b.visa.visaType} Visa` : 'Visa Service';
        }

        return {
          ...inv,
          groupName: name,
          agencyName: inv.agency?.businessName || 'Travel Agency',
        };
      }),
      data: invoices,
    });
  } catch (error) {
    console.error('Invoices API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const data = createInvoiceSchema.parse(body);

    const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const discount = data.discount || 0;
    const totalAmount = data.subtotal + data.tax - discount;
    const invoiceNumber = `INV-${Date.now()}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: data.bookingId,
        agencyId: booking.agencyId,
        subtotal: data.subtotal,
        tax: data.tax,
        discount,
        totalAmount,
        currency: 'PKR',
        dueDate: new Date(data.dueDate),
        notes: data.notes,
        status: 'issued',
      },
    });

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    console.error('Invoices API POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
});
