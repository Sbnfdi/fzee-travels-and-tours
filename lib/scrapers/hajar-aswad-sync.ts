/**
 * Compatibility wrapper for legacy Hajar Aswad references.
 * All synchronization has migrated to https://groups.sajidtravels.pk/
 */
import {
  syncSajidTravelsFlightsToDB,
  fetchLiveSajidTravelsFlights,
  type ScrapedFlight,
  cleanCityName,
  determineFlightCategory,
} from './sajid-travels-sync';

export type { ScrapedFlight };
export {
  cleanCityName,
  determineFlightCategory,
};

export async function fetchLiveHajarAswadFlights(): Promise<ScrapedFlight[]> {
  return fetchLiveSajidTravelsFlights();
}

export async function syncHajarAswadFlightsToDB() {
  return syncSajidTravelsFlightsToDB();
}
