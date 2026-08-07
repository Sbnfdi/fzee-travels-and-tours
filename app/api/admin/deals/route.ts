import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth || (auth.payload.role !== 'SUPER_ADMIN' && auth.payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deals = await prisma.sampleDeal.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ success: true, deals });
  } catch (error: any) {
    console.error('Fetch deals error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth || (auth.payload.role !== 'SUPER_ADMIN' && auth.payload.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const deal = await prisma.sampleDeal.create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        price: data.price || null,
        image: data.image || null,
        isMainDeal: data.isMainDeal || false,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
    
    return NextResponse.json({ success: true, deal });
  } catch (error: any) {
    console.error('Create deal error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create deal' }, { status: 500 });
  }
}
