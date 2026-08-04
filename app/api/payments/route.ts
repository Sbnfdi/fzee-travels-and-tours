import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

const submitPaymentSchema = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  method: z.enum(['bank_transfer', 'cheque', 'cash', 'credit', 'wallet']),
  transactionId: z.string().optional(),
  bankName: z.string().optional(),
  proofDocument: z.string().optional(),
});

const handler = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;

    if (req.method === 'GET') {
      const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });

      const whereClause = agent ? { agentId: agent.id } : {};

      const payments = await prisma.payment.findMany({
        where: whereClause,
        include: { booking: true, agency: true },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({
        success: true,
        payments: payments.map((p: any) => ({
          ...p,
          agencyName: p.agency?.businessName || 'Travel Agency',
        })),
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { bookingId, amount, method, transactionId, bankName, proofDocument } = submitPaymentSchema.parse(body);

      const agent = await prisma.agent.findUnique({
        where: { userId: user.userId },
        include: { agency: { include: { wallet: true } } },
      });

      if (!agent) {
        return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
      }

      // If paying via wallet, verify balance & perform atomic deduction
      if (method === 'wallet') {
        if (agent.walletBalance < amount) {
          return NextResponse.json({ error: 'Insufficient wallet balance for this payment.' }, { status: 400 });
        }

        const paymentResult = await prisma.$transaction(async (tx: TransactionClient) => {
          const payment = await tx.payment.create({
            data: {
              bookingId,
              agencyId: agent.agencyId,
              agentId: agent.id,
              amount,
              method,
              status: 'approved',
              submittedAt: new Date(),
              reviewedAt: new Date(),
            },
          });

          await tx.agent.update({
            where: { id: agent.id },
            data: { walletBalance: agent.walletBalance - amount },
          });

          if (agent.agency.wallet) {
            await tx.wallet.update({
              where: { agencyId: agent.agencyId },
              data: { balance: agent.agency.wallet.balance - amount },
            });
          }

          await tx.booking.update({
            where: { id: bookingId },
            data: { status: 'confirmed' },
          });

          // Create invoice automatically since it's confirmed
          await tx.invoice.create({
            data: {
              invoiceNumber: `INV-${Date.now()}`,
              bookingId,
              agencyId: agent.agencyId,
              subtotal: amount,
              tax: 0,
              totalAmount: amount,
              dueDate: new Date(),
              status: 'paid', // since paid via wallet
            },
          });

          return payment;
        });

        return NextResponse.json({
          success: true,
          data: paymentResult,
          message: 'Payment settled instantly using agency wallet.',
        });
      }

      // Manual bank transfer / cash submission
      const payment = await prisma.payment.create({
        data: {
          bookingId,
          agencyId: agent.agencyId,
          agentId: agent.id,
          amount,
          method,
          transactionId,
          bankName,
          proofDocument,
          status: 'pending',
          submittedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: payment,
        message: 'Payment request submitted for admin review.',
      });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Payments API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
});

export const GET = handler;
export const POST = handler;
