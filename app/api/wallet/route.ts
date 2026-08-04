import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

const topUpSchema = z.object({
  amount: z.number().positive().max(10000000),
  proofDocument: z.string().optional(),
});

const handler = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;

    if (req.method === 'GET') {
      const agent = await prisma.agent.findUnique({
        where: { userId: user.userId },
        include: { agency: { include: { wallet: true } } },
      });

      if (!agent) {
        return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
      }

      // Also fetch top-up history for this agent
      const topups = await prisma.walletTopUp.findMany({
        where: { agentId: agent.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        data: {
          walletBalance: agent.walletBalance,
          agencyWallet: agent.agency?.wallet || null,
        },
        topups,
      });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { amount, proofDocument } = topUpSchema.parse(body);

      const agent = await prisma.agent.findUnique({
        where: { userId: user.userId },
      });

      if (!agent) {
        return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
      }

      const topUp = await prisma.walletTopUp.create({
        data: {
          agencyId: agent.agencyId,
          agentId: agent.id,
          amount,
          proofDocument,
          status: 'pending',
          submittedAt: new Date(),
        },
      });

      // Return the wallet data (not the topup record) so the UI state stays correct
      return NextResponse.json({
        success: true,
        topUp,
        message: 'Top-up request of PKR ' + amount.toLocaleString() + ' submitted successfully. Pending admin approval.',
      });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  } catch (error) {
    console.error('Wallet API error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to process wallet request' }, { status: 500 });
  }
});

export const GET = handler;
export const POST = handler;
