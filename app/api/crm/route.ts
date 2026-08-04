import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware';
import { z } from 'zod';

const createCRMActivitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note']),
  subject: z.string().min(2),
  description: z.string().optional(),
  contactName: z.string().min(2),
  contactEmail: z.string().optional(),
  dueDate: z.string().optional(),
});

export const GET = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;

    const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });

    const whereClause = agent ? { agencyId: agent.agencyId } : {};

    const activities = await prisma.cRMActivity.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      activities,
      data: activities,
    });
  } catch (error) {
    console.error('CRM API GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch CRM activities' }, { status: 500 });
  }
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const user = (req as any).user;
    const body = await req.json();
    const data = createCRMActivitySchema.parse(body);

    const agent = await prisma.agent.findUnique({ where: { userId: user.userId } });
    if (!agent) {
      return NextResponse.json({ error: 'Agent profile not found' }, { status: 404 });
    }

    const activity = await prisma.cRMActivity.create({
      data: {
        agencyId: agent.agencyId,
        type: data.type,
        subject: data.subject,
        description: data.description,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        createdBy: user.userId,
        status: 'open',
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error('CRM API POST error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to log CRM activity' }, { status: 500 });
  }
});

export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Activity ID is required' }, { status: 400 });
    }

    await prisma.cRMActivity.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'CRM activity deleted successfully.',
    });
  } catch (error) {
    console.error('CRM DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete activity' }, { status: 500 });
  }
});
