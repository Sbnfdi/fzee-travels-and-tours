import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all pending wallet top-ups for admin review
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'pending';

    const where: any = {};
    if (status !== 'all') where.status = status;

    const topups = await prisma.walletTopUp.findMany({
      where,
      include: {
        agent: { include: { user: true } },
        agency: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      topups: topups.map((t: any) => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        agencyName: t.agency?.businessName || 'Travel Agency',
        agentName: t.agent?.user?.name || 'Agent',
        agentEmail: t.agent?.user?.email || '',
        submittedAt: t.submittedAt,
        approvedAt: t.approvedAt,
        proofDocument: t.proofDocument,
      })),
    });
  } catch (error) {
    console.error('Admin topups GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch top-ups' }, { status: 500 });
  }
}
