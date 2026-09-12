import {
  syncSajidTravelsFlightsToDB,
  getStoredSyncStatus,
  saveSyncStatus,
  SyncStatus,
} from './sajid-travels-sync';

const SYNC_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 hours in milliseconds
const CHECK_TICK_MS = 5 * 60 * 1000; // Check every 5 minutes

// Maintain global singleton state across Next.js reloads
const globalForScheduler = globalThis as unknown as {
  flightSyncSchedulerStarted?: boolean;
  flightSyncInterval?: NodeJS.Timeout;
  flightSyncIsActive?: boolean;
};

export async function runAutoSync(): Promise<any> {
  if (globalForScheduler.flightSyncIsActive) {
    console.log('[Auto-Sync] Sync already in progress, skipping duplicate call.');
    return { success: false, message: 'Sync in progress' };
  }

  globalForScheduler.flightSyncIsActive = true;
  console.log('🔄 [Auto-Sync] Triggering 5-hour scheduled flight & price sync from https://groups.sajidtravels.pk/ ...');

  try {
    const result = await syncSajidTravelsFlightsToDB();
    console.log('✅ [Auto-Sync] Completed successfully:', result.message);
    return result;
  } catch (error) {
    console.error('❌ [Auto-Sync] Error during scheduled sync:', error);
    return { success: false, error };
  } finally {
    globalForScheduler.flightSyncIsActive = false;
  }
}

/**
 * Start the 5-hour recurring auto-sync scheduler.
 * Runs in Node.js server runtime.
 */
export function startAutoSyncScheduler() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }

  if (globalForScheduler.flightSyncSchedulerStarted) {
    return;
  }
  globalForScheduler.flightSyncSchedulerStarted = true;

  console.log('🚀 [Auto-Sync Scheduler] Initialized. Target sync interval: Every 5 hours from https://groups.sajidtravels.pk/');

  // Initial check after 15 seconds to let server boot cleanly
  const initialTimer = setTimeout(async () => {
    try {
      const status = getStoredSyncStatus();
      const lastSyncMs = status.lastSyncTime ? new Date(status.lastSyncTime).getTime() : 0;
      const elapsed = Date.now() - lastSyncMs;

      if (!status.lastSyncTime || elapsed >= SYNC_INTERVAL_MS) {
        console.log(`[Auto-Sync] Last sync was ${(elapsed / (1000 * 60 * 60)).toFixed(1)} hours ago (>= 5h). Running initial sync...`);
        await runAutoSync();
      } else {
        const nextInMinutes = Math.round((SYNC_INTERVAL_MS - elapsed) / 60000);
        console.log(`[Auto-Sync] Last sync is fresh (${(elapsed / 60000).toFixed(0)} mins ago). Next auto-sync in ~${nextInMinutes} minutes.`);
      }
    } catch (err) {
      console.error('[Auto-Sync] Initial check error:', err);
    }
  }, 15000);

  if (initialTimer && typeof initialTimer.unref === 'function') {
    initialTimer.unref();
  }

  // Periodic tick check every 5 minutes
  globalForScheduler.flightSyncInterval = setInterval(async () => {
    try {
      const status = getStoredSyncStatus();
      const lastSyncMs = status.lastSyncTime ? new Date(status.lastSyncTime).getTime() : 0;
      const elapsed = Date.now() - lastSyncMs;

      if (!status.lastSyncTime || elapsed >= SYNC_INTERVAL_MS) {
        console.log(`[Auto-Sync] 5 hours elapsed since last sync. Running scheduled sync...`);
        await runAutoSync();
      }
    } catch (err) {
      console.error('[Auto-Sync] Periodic check error:', err);
    }
  }, CHECK_TICK_MS);

  if (globalForScheduler.flightSyncInterval && typeof globalForScheduler.flightSyncInterval.unref === 'function') {
    globalForScheduler.flightSyncInterval.unref();
  }
}

export function getSchedulerInfo() {
  const status = getStoredSyncStatus();
  const lastSyncMs = status.lastSyncTime ? new Date(status.lastSyncTime).getTime() : 0;
  const elapsed = Date.now() - lastSyncMs;
  const nextSyncInMs = Math.max(0, SYNC_INTERVAL_MS - elapsed);

  return {
    isStarted: !!globalForScheduler.flightSyncSchedulerStarted,
    isSyncing: !!globalForScheduler.flightSyncIsActive,
    intervalHours: 5,
    intervalMs: SYNC_INTERVAL_MS,
    nextSyncInMinutes: Math.round(nextSyncInMs / 60000),
    nextSyncAt: new Date(Date.now() + nextSyncInMs).toISOString(),
    status,
  };
}
