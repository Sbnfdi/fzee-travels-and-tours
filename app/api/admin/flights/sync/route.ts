import { NextRequest, NextResponse } from 'next/server';
import { syncSajidTravelsFlightsToDB } from '@/lib/scrapers/sajid-travels-sync';
import { getSchedulerInfo } from '@/lib/scrapers/scheduler';
import { withRole } from '@/lib/middleware';

export const dynamic = 'force-dynamic';

export const POST = withRole('SUPER_ADMIN', 'ADMIN', 'BOOKING_MANAGER')(async (req: NextRequest) => {
  try {
    const result = await syncSajidTravelsFlightsToDB();
    const scheduler = getSchedulerInfo();

    return NextResponse.json({
      success: result.success,
      data: result,
      scheduler,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in admin flights sync API POST:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync live flights from Sajid Travels' },
      { status: 500 }
    );
  }
});

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const trigger = searchParams.get('trigger');

    if (trigger === 'true' || trigger === '1') {
      const result = await syncSajidTravelsFlightsToDB();
      const scheduler = getSchedulerInfo();
      return NextResponse.json({
        success: result.success,
        data: result,
        scheduler,
        message: result.message,
      });
    }

    // Return scheduler info & last sync status without re-running heavy scraper
    const scheduler = getSchedulerInfo();
    return NextResponse.json({
      success: true,
      scheduler,
      message: scheduler.status.message || 'Auto-sync active (every 5 hours)',
    });
  } catch (error: any) {
    console.error('Error in admin flights sync API GET:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch flight sync status' },
      { status: 500 }
    );
  }
};
