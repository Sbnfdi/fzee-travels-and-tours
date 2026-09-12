import { NextRequest, NextResponse } from 'next/server';
import { syncSajidTravelsFlightsToDB } from '@/lib/scrapers/sajid-travels-sync';
import { getSchedulerInfo } from '@/lib/scrapers/scheduler';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds maximum execution time for serverless/hosted

async function handleSyncRequest(req: NextRequest) {
  try {
    // Optional CRON_SECRET authorization check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      const queryKey = req.nextUrl.searchParams.get('key');
      if (authHeader !== `Bearer ${cronSecret}` && queryKey !== cronSecret) {
        return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
      }
    }

    const result = await syncSajidTravelsFlightsToDB();
    const scheduler = getSchedulerInfo();

    return NextResponse.json({
      success: result.success,
      data: result,
      scheduler: {
        intervalHours: 5,
        nextSyncAt: scheduler.nextSyncAt,
        nextSyncInMinutes: scheduler.nextSyncInMinutes,
      },
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in cron sync-flights API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync live flights from Sajid Travels' },
      { status: 500 }
    );
  }
}

export const GET = async (req: NextRequest) => {
  return handleSyncRequest(req);
};

export const POST = async (req: NextRequest) => {
  return handleSyncRequest(req);
};
