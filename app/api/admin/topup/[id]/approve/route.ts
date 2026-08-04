import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/lib/middleware';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

const handler = withRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN')(
  async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;

      if (req.method === 'POST') {
        const body = await req.json();
        const { status, rejectionReason } = body;

        const finalStatus = status || 'approved';

        const topUp = await prisma.walletTopUp.findUnique({
          where: { id },
          include: { agent: true, agency: { include: { wallet: true } } },
        });

        if (!topUp) {
          return NextResponse.json({ error: 'Top-up request not found' }, { status: 404 });
        }

        if (topUp.status !== 'pending') {
          return NextResponse.json({ error: `Top-up request is already ${topUp.status}` }, { status: 400 });
        }

        const user = (req as any).user;

        // Perform atomic balance credit if approved
        const result = await prisma.$transaction(async (tx: TransactionClient) => {
          const updatedTopUp = await tx.walletTopUp.update({
            where: { id },
            data: {
              status: finalStatus,
              approvedAt: finalStatus === 'approved' ? new Date() : null,
              approvedBy: user?.userId || 'admin',
              notes: rejectionReason || null,
            },
          });

          if (finalStatus === 'approved') {
            // Increment Agent balance
            await tx.agent.update({
              where: { id: topUp.agentId },
              data: { walletBalance: topUp.agent.walletBalance + topUp.amount },
            });

            // Increment Agency Wallet balance
            if (topUp.agency.wallet) {
              await tx.wallet.update({
                where: { agencyId: topUp.agencyId },
                data: { balance: topUp.agency.wallet.balance + topUp.amount },
              });
            }
          }

          return updatedTopUp;
        });

        return NextResponse.json({
          success: true,
          data: result,
          message: `Top-up request has been ${finalStatus} and balance credited.`,
        });
      }

      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error: any) {
      console.error('Top-up approval API error:', error);
      return NextResponse.json({ error: error?.message || 'Failed to process top-up approval' }, { status: 500 });
    }
  }
);

export const POST = handler;
