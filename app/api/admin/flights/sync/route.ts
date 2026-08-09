import { NextRequest, NextResponse } from 'next/server';
import { syncHajarAswadFlightsToDB } from '@/lib/scrapers/hajar-aswad-sync';
import { withRole } from '@/lib/middleware';

export const POST = withRole('SUPER_ADMIN', 'ADMIN', 'BOOKING_MANAGER')(async (req: NextRequest) => {
  try {
    const result = await syncHajarAswadFlightsToDB();
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in flights sync API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync live flights' },
      { status: 500 }
    );
  }
});

export const GET = async (req: NextRequest) => {
  try {
    const result = await syncHajarAswadFlightsToDB();
    return NextResponse.json({
      success: result.success,
      data: result,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error in flights sync GET API:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to sync live flights' },
      { status: 500 }
    );
  }
};
