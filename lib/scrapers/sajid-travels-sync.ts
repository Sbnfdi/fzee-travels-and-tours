import dns from 'dns';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

// Force Node.js to use IPv4 first to prevent ECONNREFUSED on some networks/hosts
if (typeof (dns as any).setDefaultResultOrder === 'function') {
  (dns as any).setDefaultResultOrder('ipv4first');
}

export interface ScrapedFlight {
  flightNumber: string;
  airline: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: Date;
  arrivalTime: Date;
  duration: number; // in minutes
  totalSeats: number;
  availableSeats: number;
  pricePerSeat: number;
  baggage: string;
  meal: boolean;
  category: string;
  pnr?: string;
  sectorRaw?: string;
  isRoundTrip?: boolean;
}

export interface SyncStatus {
  lastSyncTime: string | null;
  lastSyncDurationMs?: number;
  syncedCount: number;
  createdCount: number;
  updatedCount: number;
  deletedCount: number;
  deactivatedCount: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
  sourceUrl: string;
  intervalHours: number;
}

const SYNC_STATUS_FILE = path.join(process.cwd(), '.flight-sync-status.json');

const AIRLINE_CODE_MAP: Record<string, string> = {
  G9: 'Air Arabia',
  '3L': 'Air Arabia (Abu Dhabi)',
  EK: 'Emirates',
  QR: 'Qatar Airways',
  PK: 'PIA',
  SV: 'Saudia Airlines',
  FZ: 'FlyDubai',
  EY: 'Etihad Airways',
  J9: 'Jazeera Airways',
  KU: 'Kuwait Airways',
  GF: 'Gulf Air',
  WY: 'Oman Air',
  RJ: 'Royal Jordanian',
  TK: 'Turkish Airlines',
  UL: 'SriLankan Airlines',
  AI: 'Air India',
  IX: 'Air India Express',
  SG: 'SpiceJet',
  '6E': 'IndiGo',
  XY: 'Flynas',
  NS: 'Nesma Airlines',
  BI: 'Royal Brunei Airlines',
  MH: 'Malaysia Airlines',
  CZ: 'China Southern Airlines',
  CA: 'Air China',
  ET: 'Ethiopian Airlines',
  MS: 'EgyptAir',
  LH: 'Lufthansa',
  BA: 'British Airways',
  W5: 'Mahan Air',
  IR: 'Iran Air',
  AZ: 'ITA Airways',
  KQ: 'Kenya Airways',
  '5J': 'Cebu Pacific',
  AK: 'AirAsia',
  FD: 'Thai AirAsia',
  TR: 'Scoot Airlines',
  SQ: 'Singapore Airlines',
  ER: 'Serene Air',
  '9P': 'FlyJinnah',
  OV: 'SalamAir',
  PA: 'AirBlue',
  PF: 'AirSial',
  F3: 'Flyadeal',
  PC: 'Pegasus Airlines',
  XQ: 'SunExpress',
  VS: 'Virgin Atlantic',
  U2: 'EasyJet',
  FR: 'Ryanair',
  RX: 'Riyadh Air',
};

const CITY_CODE_MAP: Record<string, string> = {
  // Pakistan
  KHI: 'Karachi',
  ISB: 'Islamabad',
  LHE: 'Lahore',
  PEW: 'Peshawar',
  MUX: 'Multan',
  SKT: 'Sialkot',
  LYP: 'Faisalabad',
  FSD: 'Faisalabad',
  UET: 'Quetta',
  SKZ: 'Sukkur',
  GWD: 'Gwadar',
  TUK: 'Turbat',
  RYK: 'Rahim Yar Khan',
  BHW: 'Bahawalpur',

  // Saudi Arabia
  JED: 'Jeddah',
  MED: 'Madinah',
  RUH: 'Riyadh',
  DMM: 'Dammam',
  AHB: 'Abha',
  TUU: 'Tabuk',
  GIZ: 'Jizan',
  TIF: 'Taif',
  ELQ: 'Gassim',
  YNB: 'Yanbu',
  HAS: 'Hail',
  ABT: 'Al Baha',
  AJF: 'Al-Jouf',
  EAM: 'Najran',
  BHH: 'Bisha',
  ULH: 'Al Ula',

  // UAE
  DXB: 'Dubai',
  SHJ: 'Sharjah',
  AUH: 'Abu Dhabi',
  RKT: 'Ras Al Khaimah',
  AAN: 'Al Ain',
  DWC: 'Dubai World Central',
  FJR: 'Fujairah',

  // Gulf & Middle East
  MCT: 'Muscat',
  SLL: 'Salalah',
  DOH: 'Doha',
  BAH: 'Bahrain',
  KWI: 'Kuwait',

  // International
  MAN: 'Manchester',
  LHR: 'London Heathrow',
  LGW: 'London Gatwick',
  STN: 'London Stansted',
  BHX: 'Birmingham',
  IST: 'Istanbul',
  CAI: 'Cairo',
  CMB: 'Colombo',
  BKK: 'Bangkok',
  KUL: 'Kuala Lumpur',
};

export function cleanCityName(codeOrName: string): string {
  if (!codeOrName) return 'Karachi';
  const cleanCode = codeOrName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (CITY_CODE_MAP[cleanCode]) {
    return CITY_CODE_MAP[cleanCode];
  }

  // Check if string contains known airport code
  for (const [code, cityName] of Object.entries(CITY_CODE_MAP)) {
    if (codeOrName.toUpperCase().includes(code)) {
      return cityName;
    }
  }

  return codeOrName.trim();
}

/**
 * Parse DD-MM-YYYY dates from Sajid Travels into UTC Date object
 */
export function parseSajidDate(str: string): Date {
  if (!str) return new Date();
  const parts = str.trim().split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

/**
 * Accurately categorize flight by destination & round-trip status
 */
export function determineFlightCategory(
  depCity: string,
  arrCity: string,
  finalDestCode: string,
  sectorStr: string,
  isRoundTrip: boolean
): string {
  const finalCode = (finalDestCode || '').toUpperCase();
  const s = (sectorStr || '').toUpperCase();
  const arr = (arrCity || '').toUpperCase();

  // Round trips to Jeddah / Madinah are Umrah Return Flights
  if (isRoundTrip) {
    if (finalCode === 'JED' || finalCode === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH') || s.includes('JED') || s.includes('MED')) {
      return 'Umrah Return Flight';
    }
    return `${arrCity} Return Flight`;
  }

  // UK destinations
  if (finalCode === 'LHR' || finalCode === 'MAN' || finalCode === 'LGW' || finalCode === 'STN' || finalCode === 'BHX' ||
      arr.includes('LONDON') || arr.includes('MANCHESTER') || arr.includes('HEATHROW')) {
    return 'UK Direct Flight';
  }

  // Umrah one-way destinations
  if (finalCode === 'JED' || finalCode === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH')) {
    return 'Umrah Direct Flight';
  }

  // UAE destinations
  if (finalCode === 'DXB' || finalCode === 'SHJ' || finalCode === 'AUH' || finalCode === 'RKT' || finalCode === 'FJR' ||
      arr.includes('DUBAI') || arr.includes('SHARJAH') || arr.includes('ABU DHABI') || arr.includes('RAS AL KHAIMAH')) {
    return 'UAE Direct Flight';
  }

  // Saudi Arabia Other (Riyadh, Dammam, Abha, Gassim, etc.)
  if (finalCode === 'RUH' || finalCode === 'DMM' || finalCode === 'AHB' || finalCode === 'ELQ' || finalCode === 'GIZ' ||
      finalCode === 'TUU' || finalCode === 'TIF' || finalCode === 'HAS' ||
      arr.includes('RIYADH') || arr.includes('DAMMAM') || arr.includes('ABHA') || arr.includes('GASSIM')) {
    return 'Saudi Direct Flight';
  }

  // Muscat / Oman
  if (finalCode === 'MCT' || finalCode === 'SLL' || arr.includes('MUSCAT') || arr.includes('SALALAH')) {
    return 'Muscat Direct Flight';
  }

  // Qatar (Doha)
  if (finalCode === 'DOH' || arr.includes('DOHA') || arr.includes('QATAR')) {
    return 'Qatar Direct Flight';
  }

  // Bahrain
  if (finalCode === 'BAH' || arr.includes('BAHRAIN')) {
    return 'Bahrain Direct Flight';
  }

  // Kuwait
  if (finalCode === 'KWI' || arr.includes('KUWAIT')) {
    return 'Kuwait Direct Flight';
  }

  return `${arrCity} Direct Flight`;
}

/**
 * Fetch and parse all live flight schedules and fares from https://groups.sajidtravels.pk/
 */
export async function fetchLiveSajidTravelsFlights(): Promise<ScrapedFlight[]> {
  try {
    const targetUrl = 'https://groups.sajidtravels.pk/';
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${targetUrl}: HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const flights: ScrapedFlight[] = [];

    // Parse each flight row containing openBookingModal
    $('tr').each((_, element) => {
      const el = $(element);
      const onclick = el.find('a.book-btn, button').attr('onclick') || '';
      if (!onclick.includes('openBookingModal')) return;

      const match = onclick.match(/openBookingModal\s*\(\s*([\s\S]+?)\s*\);/);
      if (!match) return;

      try {
        const rawArgs = match[1].replace(/&quot;/g, '"');
        const parsed = JSON.parse(`[${rawArgs}]`);
        let [
          rawAirline,
          airlineCode,
          rawFlightNo,
          rawDateStr,
          rawSectorStr,
          rawTimeStr,
          rawFareFormatted,
          rawPnr,
          rawMeal,
          rawBaggage,
          rawFareNum,
        ] = parsed;

        // Resolve airline name
        let airline = (rawAirline || '').trim();
        if (!airline && airlineCode && AIRLINE_CODE_MAP[airlineCode]) {
          airline = AIRLINE_CODE_MAP[airlineCode];
        }
        if (!airline) {
          const logoAlt = el.find('img').attr('alt') || '';
          if (logoAlt && logoAlt !== 'Logo') airline = logoAlt;
          else airline = 'Partner Airline';
        }

        // Parse sectors, dates, times, flight numbers
        const sectors = (rawSectorStr || '').split('\n').map((s: string) => s.trim()).filter(Boolean);
        const dates = (rawDateStr || '').split('\n').map((d: string) => d.trim()).filter(Boolean);
        const times = (rawTimeStr || '').split('\n').map((t: string) => t.trim()).filter(Boolean);
        const flightNos = (rawFlightNo || '').split('\n').map((f: string) => f.trim()).filter(Boolean);
        const bags = (rawBaggage || '').split('\n').map((b: string) => b.trim()).filter(Boolean);

        const firstSector = sectors[0] || 'ISB-AUH';
        const lastSector = sectors[sectors.length - 1] || firstSector;

        const firstParts = firstSector.split('-');
        const lastParts = lastSector.split('-');

        const depCode = firstParts[0] || 'ISB';
        const initialArrCode = firstParts[1] || 'AUH';
        const finalArrCode = lastParts[1] || lastParts[0] || initialArrCode;

        // Determine round-trip status
        let isRoundTrip = false;
        if (sectors.length >= 2) {
          if (firstParts[0] === lastParts[1] && firstParts[1] === lastParts[0]) {
            isRoundTrip = true;
          } else if (
            sectors.some((s: string) =>
              s.includes('JED-ISB') ||
              s.includes('JED-LHE') ||
              s.includes('JED-KHI') ||
              s.includes('JED-MUX') ||
              s.includes('JED-PEW') ||
              s.includes('JED-LYP') ||
              s.includes('MED-ISB') ||
              s.includes('MED-LHE')
            )
          ) {
            isRoundTrip = true;
          }
        }

        const depCity = cleanCityName(depCode);
        let arrCity = cleanCityName(isRoundTrip ? initialArrCode : finalArrCode);

        // Clarify arrival display for return and connecting flights
        if (isRoundTrip) {
          arrCity = `${arrCity} (Return)`;
        } else if (sectors.length > 1) {
          const transitCode = initialArrCode;
          if (transitCode && transitCode !== finalArrCode) {
            arrCity = `${cleanCityName(finalArrCode)} (via ${transitCode})`;
          }
        }

        // Parse Departure Date & Time
        const depDate = parseSajidDate(dates[0]);
        let depHour = 8;
        let depMin = 0;
        if (times[0] && times[0].includes('-')) {
          const t = times[0].split('-')[0].trim().split(':');
          if (t.length >= 2) {
            depHour = parseInt(t[0], 10) || 8;
            depMin = parseInt(t[1], 10) || 0;
          }
        }
        const departureTime = new Date(depDate);
        departureTime.setUTCHours(depHour, depMin, 0, 0);

        // Parse Arrival Date & Time
        const arrivalDatePart = dates[dates.length - 1] || dates[0];
        const arrDate = parseSajidDate(arrivalDatePart);
        let arrHour = 11;
        let arrMin = 0;
        const lastTime = times[times.length - 1] || times[0] || '';
        if (lastTime && lastTime.includes('-')) {
          const t = lastTime.split('-')[1].trim().split(':');
          if (t.length >= 2) {
            arrHour = parseInt(t[0], 10) || 11;
            arrMin = parseInt(t[1], 10) || 0;
          }
        }
        const arrivalTime = new Date(arrDate);
        arrivalTime.setUTCHours(arrHour, arrMin, 0, 0);
        if (arrivalTime <= departureTime) {
          arrivalTime.setDate(arrivalTime.getDate() + 1);
        }

        const duration = Math.max(120, Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000));

        // Exact Wholesale Group Price per Seat
        let price = parseInt(rawFareNum || '0', 10);
        if (!price || isNaN(price)) {
          price = parseInt((rawFareFormatted || '').replace(/[^0-9]/g, ''), 10);
        }
        if (!price || isNaN(price)) {
          const fareCellText = el.find('td[data-label="Fare"]').text().replace(/[^0-9]/g, '');
          price = parseInt(fareCellText, 10) || 75000;
        }

        const targetFinalCode = isRoundTrip ? initialArrCode : finalArrCode;
        const category = determineFlightCategory(depCity, arrCity, targetFinalCode, rawSectorStr, isRoundTrip);
        const flightNumber = flightNos.length > 0 ? flightNos.join(' / ') : rawFlightNo || 'PA-101';
        const baggage = bags.length > 0 ? bags.join(' | ') : rawBaggage || '20+7 KG';
        const meal = (rawMeal || '').toUpperCase().includes('YES');

        flights.push({
          flightNumber,
          airline,
          departureCity: depCity,
          arrivalCity: arrCity,
          departureTime,
          arrivalTime,
          duration,
          totalSeats: 20,
          availableSeats: 15,
          pricePerSeat: price,
          baggage,
          meal,
          category,
          pnr: rawPnr ? `SAJ-${rawPnr}` : `SAJ-${Math.floor(10000 + Math.random() * 90000)}`,
          sectorRaw: rawSectorStr,
          isRoundTrip,
        });
      } catch (rowErr) {
        console.error('Error parsing Sajid Travels row:', rowErr);
      }
    });

    return flights;
  } catch (error) {
    console.error('Error fetching live Sajid Travels flights:', error);
    return [];
  }
}

/**
 * Persist sync status metadata so UI & API can easily read it
 */
export function saveSyncStatus(status: SyncStatus) {
  try {
    fs.writeFileSync(SYNC_STATUS_FILE, JSON.stringify(status, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save sync status file:', err);
  }
}

/**
 * Read current sync status metadata
 */
export function getStoredSyncStatus(): SyncStatus {
  try {
    if (fs.existsSync(SYNC_STATUS_FILE)) {
      const content = fs.readFileSync(SYNC_STATUS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch {}

  return {
    lastSyncTime: null,
    syncedCount: 0,
    createdCount: 0,
    updatedCount: 0,
    deletedCount: 0,
    deactivatedCount: 0,
    status: 'idle',
    message: 'Auto-sync initialized (scheduled every 5 hours)',
    sourceUrl: 'https://groups.sajidtravels.pk/',
    intervalHours: 5,
  };
}

/**
 * Sync live scraped flights from Sajid Travels into Prisma database:
 * 1. Upserts live flights with EXACT wholesale prices & schedules
 * 2. Updates pricePerSeat and dynamic fareTiers for all synced flights
 * 3. Deletes obsolete unbooked flights and marks obsolete booked flights cancelled
 * 4. Ensures all unique flight categories are present in FlightCategory table
 * 5. Records sync timestamp and metrics for the 5-hour recurrence scheduler
 */
export async function syncSajidTravelsFlightsToDB() {
  const startTime = Date.now();
  saveSyncStatus({
    ...getStoredSyncStatus(),
    status: 'syncing',
    message: 'Fetching and synchronizing live flights from https://groups.sajidtravels.pk/...',
  });

  const scrapedFlights = await fetchLiveSajidTravelsFlights();
  if (!scrapedFlights || scrapedFlights.length === 0) {
    const errorStatus: SyncStatus = {
      lastSyncTime: getStoredSyncStatus().lastSyncTime,
      syncedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      deletedCount: 0,
      deactivatedCount: 0,
      status: 'error',
      message: 'No live flights found or fetch failed from https://groups.sajidtravels.pk/',
      sourceUrl: 'https://groups.sajidtravels.pk/',
      intervalHours: 5,
    };
    saveSyncStatus(errorStatus);
    return {
      success: false,
      ...errorStatus,
    };
  }

  // Purge any old malformed city name flights with no bookings
  await prisma.flight.deleteMany({
    where: {
      OR: [
        { departureCity: { contains: 'MCT MCT' } },
        { arrivalCity: { contains: 'MCT MCT' } },
        { departureCity: { contains: 'DOH DOH' } },
        { arrivalCity: { contains: 'DOH DOH' } },
      ],
      bookings: { none: {} },
    },
  });

  // Pre-fetch all existing flights for instant in-memory lookup
  const existingFlights = await prisma.flight.findMany({
    select: {
      id: true,
      flightNumber: true,
      departureCity: true,
      arrivalCity: true,
      departureTime: true,
      pnr: true,
    },
  });

  const existingMap = new Map<string, typeof existingFlights[0]>();
  for (const ef of existingFlights) {
    const key = `${ef.flightNumber}__${ef.departureCity}__${ef.arrivalCity}__${ef.departureTime.toISOString().slice(0, 10)}`;
    existingMap.set(key, ef);
  }

  const activeSyncedIds = new Set<string>();
  const categoriesToEnsure = new Set<string>();

  let createdCount = 0;
  let updatedCount = 0;

  // Process in chunks of 15 for optimal concurrency without socket exhaustion
  const CHUNK_SIZE = 15;
  for (let i = 0; i < scrapedFlights.length; i += CHUNK_SIZE) {
    const chunk = scrapedFlights.slice(i, i + CHUNK_SIZE);
    await Promise.all(
      chunk.map(async (f) => {
        if (f.category) {
          categoriesToEnsure.add(f.category);
        }

        const dateKey = f.departureTime.toISOString().slice(0, 10);
        const matchKey = `${f.flightNumber}__${f.departureCity}__${f.arrivalCity}__${dateKey}`;
        const existing = existingMap.get(matchKey);

        const tierConfig = JSON.stringify([
          { upToSeat: Math.round(f.totalSeats * 0.5), price: f.pricePerSeat },
          { upToSeat: f.totalSeats, price: Math.round(f.pricePerSeat * 1.05) },
        ]);

        if (existing) {
          const updated = await prisma.flight.update({
            where: { id: existing.id },
            data: {
              departureTime: f.departureTime,
              arrivalTime: f.arrivalTime,
              duration: f.duration,
              totalSeats: f.totalSeats,
              availableSeats: f.availableSeats,
              pricePerSeat: f.pricePerSeat, // SYNC EXACT LIVE PRICE
              fareTiers: tierConfig,
              baggage: f.baggage,
              meal: f.meal,
              airline: f.airline,
              departureCity: f.departureCity,
              arrivalCity: f.arrivalCity,
              category: f.category,
              pnr: f.pnr || existing.pnr,
              status: 'active',
            },
          });
          activeSyncedIds.add(updated.id);
          updatedCount++;
        } else {
          const created = await prisma.flight.create({
            data: {
              flightNumber: f.flightNumber,
              pnr: f.pnr || `SAJ-${Math.floor(100000 + Math.random() * 900000)}`,
              airline: f.airline,
              departureCity: f.departureCity,
              arrivalCity: f.arrivalCity,
              departureTime: f.departureTime,
              arrivalTime: f.arrivalTime,
              duration: f.duration,
              totalSeats: f.totalSeats,
              availableSeats: f.availableSeats,
              pricePerSeat: f.pricePerSeat, // SYNC EXACT LIVE PRICE
              fareTiers: tierConfig,
              currency: 'PKR',
              baggage: f.baggage,
              meal: f.meal,
              category: f.category,
              status: 'active',
            },
          });
          activeSyncedIds.add(created.id);
          createdCount++;
        }
      })
    );
  }

  // Ensure all categories exist in FlightCategory table
  for (const catName of categoriesToEnsure) {
    try {
      const catExists = await prisma.flightCategory.findUnique({
        where: { name: catName },
      });
      if (!catExists) {
        await prisma.flightCategory.create({
          data: { name: catName },
        });
      }
    } catch {}
  }

  // Obsolete flight management
  const allCurrentDbFlights = await prisma.flight.findMany({
    select: {
      id: true,
      flightNumber: true,
      departureCity: true,
      arrivalCity: true,
      departureTime: true,
      status: true,
      _count: {
        select: { bookings: true },
      },
    },
  });

  const obsoleteFlights = allCurrentDbFlights.filter((f) => !activeSyncedIds.has(f.id));
  let deletedCount = 0;
  let deactivatedCount = 0;

  for (const obs of obsoleteFlights) {
    if (obs._count.bookings > 0) {
      if (obs.status !== 'cancelled') {
        await prisma.flight.update({
          where: { id: obs.id },
          data: { status: 'cancelled' },
        });
        deactivatedCount++;
      }
    } else {
      await prisma.flight.delete({
        where: { id: obs.id },
      });
      deletedCount++;
    }
  }

  const syncedCount = createdCount + updatedCount;
  const durationMs = Date.now() - startTime;
  let message = `Successfully synced ${scrapedFlights.length} flights from Sajid Travels (${createdCount} added, ${updatedCount} updated with live prices`;
  if (deletedCount > 0) message += `, ${deletedCount} obsolete deleted`;
  if (deactivatedCount > 0) message += `, ${deactivatedCount} cancelled`;
  message += ` in ${(durationMs / 1000).toFixed(1)}s).`;

  const successStatus: SyncStatus = {
    lastSyncTime: new Date().toISOString(),
    lastSyncDurationMs: durationMs,
    syncedCount,
    createdCount,
    updatedCount,
    deletedCount,
    deactivatedCount,
    status: 'success',
    message,
    sourceUrl: 'https://groups.sajidtravels.pk/',
    intervalHours: 5,
  };

  saveSyncStatus(successStatus);

  return {
    success: true,
    totalScraped: scrapedFlights.length,
    ...successStatus,
  };
}
