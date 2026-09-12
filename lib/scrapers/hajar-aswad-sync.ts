/**
 * Compatibility wrapper for legacy Hajar Aswad references.
 * All synchronization has migrated to https://groups.sajidtravels.pk/
 */
import {
  syncSajidTravelsFlightsToDB,
  fetchLiveSajidTravelsFlights,
  ScrapedFlight,
  cleanCityName,
  determineFlightCategory,
} from './sajid-travels-sync';

export {
  ScrapedFlight,
  cleanCityName,
  determineFlightCategory,
};

export async function fetchLiveHajarAswadFlights(): Promise<ScrapedFlight[]> {
  return fetchLiveSajidTravelsFlights();
}

export async function syncHajarAswadFlightsToDB() {
  return syncSajidTravelsFlightsToDB();
}
