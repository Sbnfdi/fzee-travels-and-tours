import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // Cache for 60 seconds

export async function GET(request: NextRequest) {
  try {
    const deals = await prisma.sampleDeal.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });
    
    // Separate main deal and destinations
    const mainDeal = deals.find(d => d.isMainDeal) || null;
    const destinations = deals.filter(d => !d.isMainDeal);

    return NextResponse.json({ success: true, mainDeal, destinations });
  } catch (error: any) {
    console.error('Fetch public deals error:', error);
    // If table doesn't exist yet (e.g. during Next.js build or before Turso sync), return empty gracefully
    if (error.code === 'SQLITE_UNKNOWN' || error.message?.includes('no such table')) {
      return NextResponse.json({ success: true, mainDeal: null, destinations: [] });
    }
    return NextResponse.json({ error: error.message || 'Failed to fetch deals' }, { status: 500 });
  }
}
