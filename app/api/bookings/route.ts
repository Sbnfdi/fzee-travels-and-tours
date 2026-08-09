import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

const createBookingSchema = z.object({
  bookingType: z.enum(['GROUP', 'HOTEL', 'FLIGHT', 'VISA']).default('GROUP'),
  groupId: z.string().optional(),
  hotelId: z.string().optional(),
  flightId: z.string().optional(),
  visaId: z.string().optional(),
  numberOfPax: z.number().min(1).max(50),
  passengerDetails: z.array(
    z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      passport: z.string().optional(),
    })
  ).optional(),
  specialRequests: z.string().optional(),
});

const handler = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;

    if (req.method === 'GET') {
      const { searchParams } = new URL(req.url);
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const skip = (page - 1) * limit;

      const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });
      const whereClause = agent ? { agentId: agent.id } : {};

      const [bookings, total] = await Promise.all([
        prisma.booking.findMany({
          where: whereClause,
          include: { group: true, hotel: true, flight: true, visa: true, payments: true, agency: true },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.booking.count({ where: whereClause }),
      ]);

      return NextResponse.json({
        success: true,
        bookings: bookings.map((b: any) => {
          let name = 'Unknown Booking';
          if (b.bookingType === 'GROUP') name = b.group?.name || 'Group Package';
          if (b.bookingType === 'HOTEL') name = b.hotel?.name ? `${b.hotel.name} Reservation` : 'Hotel Reservation';
          if (b.bookingType === 'FLIGHT') name = b.flight?.airline ? `${b.flight.airline} Flight ${b.flight.flightNumber}` : 'Flight Ticket';
          if (b.bookingType === 'VISA') name = b.visa?.country ? `${b.visa.country} ${b.visa.visaType} Visa` : 'Visa Service';

          return {
            ...b,
            groupName: name, // We keep the groupName property so frontend doesn't break
            agencyName: b.agency?.businessName || 'Travel Agency',
          };
        }),
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { bookingType, groupId, hotelId, flightId, visaId, numberOfPax, passengerDetails, specialRequests } = createBookingSchema.parse(body);

      // Find the agent record for this user
      const agent = await prisma.agent.findUnique({
        where: { userId: user.userId },
        include: { agency: true },
      });
      if (!agent) {
        return NextResponse.json({ error: 'Agent profile not found. Please complete registration first.' }, { status: 404 });
      }

      let totalAmount = 0;
      let inventoryIdToUpdate: string | null = null;
      let inventoryTypeToUpdate: 'GROUP' | 'FLIGHT' | null = null;
      let availableSlots = 0;

      // Validate based on bookingType
      if (bookingType === 'GROUP') {
        if (!groupId) return NextResponse.json({ error: 'Group ID required for group bookings.' }, { status: 400 });
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group || group.status !== 'open') return NextResponse.json({ error: 'Invalid or closed group.' }, { status: 400 });
        if (group.availableSlots < numberOfPax) return NextResponse.json({ error: 'Not enough slots remaining.' }, { status: 400 });
        
        totalAmount = group.pricePerPerson * numberOfPax;
        inventoryIdToUpdate = group.id;
        inventoryTypeToUpdate = 'GROUP';
        availableSlots = group.availableSlots;
      } else if (bookingType === 'FLIGHT') {
        if (!flightId) return NextResponse.json({ error: 'Flight ID required for flight bookings.' }, { status: 400 });
        const flight = await prisma.flight.findUnique({ where: { id: flightId } });
        if (!flight || flight.status !== 'active') return NextResponse.json({ error: 'Invalid or inactive flight.' }, { status: 400 });
        if (flight.availableSeats < numberOfPax) return NextResponse.json({ error: 'Not enough seats remaining.' }, { status: 400 });
        
        // Use exact seat-by-seat dynamic tier pricing calculation
        const { calculateTotalFlightFare } = await import('@/app/api/flights/route');
        const fareCalculation = calculateTotalFlightFare(flight, numberOfPax);
        totalAmount = fareCalculation.totalAmount;
        inventoryIdToUpdate = flight.id;
        inventoryTypeToUpdate = 'FLIGHT';
        availableSlots = flight.availableSeats;
      } else if (bookingType === 'HOTEL') {
        if (!hotelId) return NextResponse.json({ error: 'Hotel ID required for hotel bookings.' }, { status: 400 });
        const hotel = await prisma.hotel.findUnique({ where: { id: hotelId } });
        if (!hotel) return NextResponse.json({ error: 'Invalid hotel.' }, { status: 400 });
        
        totalAmount = hotel.pricePerNight * numberOfPax; // Simplification: assuming pax = nights or rooms for now
      } else if (bookingType === 'VISA') {
        if (!visaId) return NextResponse.json({ error: 'Visa ID required for visa bookings.' }, { status: 400 });
        const visa = await prisma.visaService.findUnique({ where: { id: visaId } });
        if (!visa || visa.status !== 'active') return NextResponse.json({ error: 'Invalid or inactive visa service.' }, { status: 400 });
        
        totalAmount = visa.pricePerPerson * numberOfPax;
      }

      const commission = 0;

      const booking = await prisma.$transaction(async (tx: TransactionClient) => {
        // Re-check & decrement inventory atomically inside transaction to prevent overselling race conditions
        if (inventoryTypeToUpdate === 'GROUP' && inventoryIdToUpdate) {
          const group = await tx.group.findUnique({ where: { id: inventoryIdToUpdate } });
          if (!group || group.availableSlots < numberOfPax) {
            throw new Error('NOT_ENOUGH_SLOTS');
          }
          await tx.group.update({
            where: { id: inventoryIdToUpdate },
            data: { availableSlots: { decrement: numberOfPax } },
          });
        } else if (inventoryTypeToUpdate === 'FLIGHT' && inventoryIdToUpdate) {
          const flight = await tx.flight.findUnique({ where: { id: inventoryIdToUpdate } });
          if (!flight || flight.availableSeats < numberOfPax) {
            throw new Error('NOT_ENOUGH_SEATS');
          }
          await tx.flight.update({
            where: { id: inventoryIdToUpdate },
            data: { availableSeats: { decrement: numberOfPax } },
          });
        }

        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const bookingNum = `BK-${Date.now()}-${uniqueSuffix}`;

        const newBooking = await tx.booking.create({
          data: {
            bookingNumber: bookingNum,
            bookingType,
            groupId: bookingType === 'GROUP' ? groupId : undefined,
            hotelId: bookingType === 'HOTEL' ? hotelId : undefined,
            flightId: bookingType === 'FLIGHT' ? flightId : undefined,
            visaId: bookingType === 'VISA' ? visaId : undefined,
            agencyId: agent.agencyId,
            agentId: agent.id,
            numberOfPax,
            totalAmount,
            commission,
            status: 'pending',
            passengerDetails: JSON.stringify(passengerDetails || []),
            specialRequests,
          },
        });

        // Auto-create Invoice for this booking
        const invNum = `INV-${newBooking.bookingNumber.replace('BK-', '')}`;
        await tx.invoice.upsert({
          where: { invoiceNumber: invNum },
          update: { bookingId: newBooking.id },
          create: {
            invoiceNumber: invNum,
            bookingId: newBooking.id,
            agencyId: newBooking.agencyId,
            subtotal: totalAmount,
            tax: Math.round(totalAmount * 0.05),
            discount: 0,
            totalAmount: Math.round(totalAmount * 1.05),
            currency: 'PKR',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            status: newBooking.status === 'confirmed' ? 'paid' : 'issued',
          },
        });

        return newBooking;
      });

      return NextResponse.json({
        success: true,
        booking: booking,
        data: booking,
        message: `Booking ${booking.bookingNumber} confirmed for ${numberOfPax} PAX.`,
      });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Bookings API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process booking' }, { status: 500 });
  }
});

export const GET = handler;
export const POST = handler;
