import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole } from '@/lib/middleware';
import { hashPassword } from '@/lib/auth';

type TransactionClient = Parameters<Parameters<typeof prisma['$transaction']>[0]>[0];

export const GET = withRole('SUPER_ADMIN', 'ADMIN')(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const agencyId = searchParams.get('agencyId');

    const agents = await prisma.agent.findMany({
      where: agencyId ? { agencyId } : {},
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        agency: { select: { businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    console.error('Failed to fetch agents:', error);
    return NextResponse.json({ error: 'Failed to load agents' }, { status: 500 });
  }
});

export const PATCH = withRole('SUPER_ADMIN', 'ADMIN')(async (req: NextRequest) => {
  try {
    const { id, status, commissionRate } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (commissionRate !== undefined) dataToUpdate.commissionRate = commissionRate;

    const agent = await prisma.agent.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, data: agent, message: 'Agent updated successfully' });
  } catch (error) {
    console.error('Failed to update agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
});

export const POST = withRole('SUPER_ADMIN', 'ADMIN')(async (req: NextRequest) => {
  try {
    const { agencyId, name, email, phone, password, commissionRate } = await req.json();

    if (!agencyId || !name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (tx: TransactionClient) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          phone,
          role: 'TRAVEL_AGENT',
        },
      });

      const agent = await tx.agent.create({
        data: {
          userId: user.id,
          agencyId,
          commissionRate: commissionRate || 10,
          walletBalance: 0,
          status: 'active',
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        }
      });

      return agent;
    });

    return NextResponse.json({ success: true, data: result, message: 'Agent added successfully' });
  } catch (error) {
    console.error('Failed to create agent:', error);
    return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 });
  }
});
