import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/lib/middleware';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

const handler = withRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'BOOKING_MANAGER', 'SUPPORT_STAFF')(
  async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;

      if (req.method === 'POST') {
        const body = await req.json();
        const { status, rejectionReason } = body;

        const finalStatus = status || 'confirmed';

        const booking = await prisma.booking.findUnique({
          where: { id },
          include: { group: true },
        });

        if (!booking) {
          return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        if (finalStatus === 'confirmed') {
          const updated = await prisma.$transaction(async (tx: TransactionClient) => {
            const bookingUpdated = await tx.booking.update({
              where: { id },
              data: { status: 'confirmed' },
            });

            // Auto-create invoice
            await tx.invoice.create({
              data: {
                invoiceNumber: `INV-${Date.now()}`,
                bookingId: booking.id,
                agencyId: booking.agencyId,
                subtotal: booking.totalAmount,
                tax: 0,
                totalAmount: booking.totalAmount,
                dueDate: new Date(),
                status: 'paid', // Admin confirming usually implies payment is approved
              },
            });

            return bookingUpdated;
          });

          return NextResponse.json({
            success: true,
            data: updated,
            message: `Booking ${booking.bookingNumber} confirmed successfully.`,
          });
        }

        if (finalStatus === 'rejected' || finalStatus === 'cancelled') {
          const result = await prisma.$transaction(async (tx: TransactionClient) => {
            const updated = await tx.booking.update({
              where: { id },
              data: { status: finalStatus },
            });

            // Restore group slots if group booking
            if (booking.groupId) {
              await tx.group.update({
                where: { id: booking.groupId },
                data: { availableSlots: { increment: booking.numberOfPax } },
              });
            }

            // Restore flight seats if flight booking
            if (booking.flightId) {
              await tx.flight.update({
                where: { id: booking.flightId },
                data: { availableSeats: { increment: booking.numberOfPax } },
              });
            }

            // Cancel any associated invoice
            await tx.invoice.updateMany({
              where: { bookingId: id },
              data: { status: 'cancelled' },
            });

            return updated;
          });

          return NextResponse.json({
            success: true,
            data: result,
            message: `Booking ${booking.bookingNumber} marked as ${finalStatus}.`,
          });
        }

        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error: any) {
      console.error('Booking approval error:', error);
      return NextResponse.json({ error: error?.message || 'Failed to process booking' }, { status: 500 });
    }
  }
);

export const POST = handler;
