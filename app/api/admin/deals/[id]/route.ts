import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromCookies } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth || (auth.payload.role !== 'SUPER_ADMIN' && auth.payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    const deal = await prisma.sampleDeal.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        price: data.price,
        image: data.image,
        isMainDeal: data.isMainDeal,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, deal });
  } catch (error: any) {
    console.error('Update deal error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth || (auth.payload.role !== 'SUPER_ADMIN' && auth.payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.sampleDeal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete deal error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete deal' }, { status: 500 });
  }
}
