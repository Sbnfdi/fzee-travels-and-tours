import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/lib/middleware';

const handler = withRole('SUPER_ADMIN', 'ADMIN', 'FINANCE_ADMIN')(
  async (req: NextRequest, { params }: any) => {
    try {
      const { id } = await params;

      if (req.method === 'POST') {
        const body = await req.json();
        const { status, approved, rejectionReason } = body;

        const finalStatus = status || (approved ? 'approved' : 'rejected');

        const agency = await prisma.agency.update({
          where: { id },
          data: {
            status: finalStatus,
            registrationApprovedAt: finalStatus === 'approved' ? new Date() : null,
            rejectionReason: finalStatus === 'rejected' ? rejectionReason : null,
          },
          include: { user: true },
        });

        return NextResponse.json({
          success: true,
          data: agency,
        });
      }

      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
    } catch (error) {
      console.error('Approval API error:', error);
      return NextResponse.json({ error: 'Failed to update agency approval' }, { status: 500 });
    }
  }
);

export const POST = handler;
