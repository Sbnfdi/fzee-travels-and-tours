import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/lib/middleware';

const handler = withRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN', 'BOOKING_MANAGER', 'SUPPORT_STAFF')(
  async (req: NextRequest) => {
    try {
      if (req.method === 'GET') {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status && status !== 'all') where.status = status;

        const agencies = await prisma.agency.findMany({
          where,
          include: { user: true, agents: true },
          orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({
          success: true,
          data: agencies,
          agencies: agencies,
        });
      }

      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error) {
      console.error('Agencies API error:', error);
      return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
    }
  }
);

export const GET = handler;
