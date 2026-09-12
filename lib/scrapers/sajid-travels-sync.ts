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
 * Accurately categorize flight by true destination & round-trip status
 */
export function determineFlightCategory(
  destCode: string,
  arrCity: string,
  isRoundTrip: boolean
): string {
  const code = (destCode || '').toUpperCase();
  const arr = (arrCity || '').toUpperCase();

  if (isRoundTrip) {
    if (code === 'JED' || code === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH')) {
      return 'Umrah Return Flight';
    }
    if (code === 'LHR' || code === 'MAN' || code === 'LGW' || code === 'STN' || code === 'BHX' ||
        arr.includes('LONDON') || arr.includes('MANCHESTER')) {
      return 'UK Return Flight';
    }
    if (code === 'DXB' || code === 'SHJ' || code === 'AUH' || code === 'RKT' ||
        arr.includes('DUBAI') || arr.includes('SHARJAH') || arr.includes('ABU DHABI')) {
      return 'UAE Return Flight';
    }
    if (code === 'RUH' || code === 'DMM' || code === 'AHB' || code === 'ELQ' || code === 'GIZ' ||
        arr.includes('RIYADH') || arr.includes('DAMMAM')) {
      return 'Saudi Return Flight';
    }
    if (code === 'BAH' || arr.includes('BAHRAIN')) {
      return 'Bahrain Return Flight';
    }
    if (code === 'KWI' || arr.includes('KUWAIT')) {
      return 'Kuwait Return Flight';
    }
    if (code === 'MCT' || code === 'SLL' || arr.includes('MUSCAT')) {
      return 'Muscat Return Flight';
    }
    if (code === 'DOH' || arr.includes('DOHA')) {
      return 'Qatar Return Flight';
    }
    return `${cleanCityName(code)} Return Flight`;
  }

  // One way
  if (code === 'JED' || code === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH')) {
    return 'Umrah Direct Flight';
  }
  if (code === 'LHR' || code === 'MAN' || code === 'LGW' || code === 'STN' || code === 'BHX' ||
      arr.includes('LONDON') || arr.includes('MANCHESTER')) {
    return 'UK Direct Flight';
  }
  if (code === 'DXB' || code === 'SHJ' || code === 'AUH' || code === 'RKT' ||
      arr.includes('DUBAI') || arr.includes('SHARJAH') || arr.includes('ABU DHABI')) {
    return 'UAE Direct Flight';
  }
  if (code === 'RUH' || code === 'DMM' || code === 'AHB' || code === 'ELQ' || code === 'GIZ' ||
      code === 'TUU' || code === 'TIF' || arr.includes('RIYADH') || arr.includes('DAMMAM')) {
    return 'Saudi Direct Flight';
  }
  if (code === 'MCT' || code === 'SLL' || arr.includes('MUSCAT')) {
    return 'Muscat Direct Flight';
  }
  if (code === 'DOH' || arr.includes('DOHA')) {
    return 'Qatar Direct Flight';
  }
  if (code === 'BAH' || arr.includes('BAHRAIN')) {
    return 'Bahrain Direct Flight';
  }
  if (code === 'KWI' || arr.includes('KUWAIT')) {
    return 'Kuwait Direct Flight';
  }

  return `${cleanCityName(code)} Direct Flight`;
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
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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

        const originCode = firstSector.split('-')[0] || 'ISB';
        const lastDestCode = lastSector.split('-')[1] || lastSector.split('-')[0];

        // Determine round-trip status
        const pakistanAirports = new Set(['ISB', 'LHE', 'KHI', 'PEW', 'MUX', 'SKT', 'LYP', 'FSD', 'UET', 'BHW', 'RYK']);
        let isRoundTrip = false;
        if (sectors.length >= 2) {
          if (originCode === lastDestCode || (pakistanAirports.has(originCode) && pakistanAirports.has(lastDestCode))) {
            isRoundTrip = true;
          }
        }

        let finalDestCode = '';
        let transitCity = '';
        let arrCity = '';

        if (isRoundTrip) {
          // In round trip, the turnaround destination is the middle point
          const turnaroundIndex = Math.floor(sectors.length / 2) - 1;
          const turnaroundSector = sectors[turnaroundIndex] || firstSector;
          finalDestCode = turnaroundSector.split('-')[1] || turnaroundSector.split('-')[0];

          // Check if there was an outbound transit
          if (turnaroundIndex > 0) {
            const transitCode = firstSector.split('-')[1];
            if (transitCode && transitCode !== finalDestCode) {
              transitCity = cleanCityName(transitCode);
            }
          }

          const destName = cleanCityName(finalDestCode);
          arrCity = transitCity ? `${destName} (via ${transitCity} Return)` : `${destName} (Return)`;
        } else {
          // One way: final sector destination
          finalDestCode = lastDestCode;
          if (sectors.length > 1) {
            const transitCode = firstSector.split('-')[1];
            if (transitCode && transitCode !== finalDestCode) {
              transitCity = cleanCityName(transitCode);
            }
          }
          const destName = cleanCityName(finalDestCode);
          arrCity = transitCity ? `${destName} (via ${transitCity})` : destName;
        }

        const depCity = cleanCityName(originCode);

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

        const category = determineFlightCategory(finalDestCode, arrCity, isRoundTrip);
        const flightNumber = flightNos.length > 0 ? flightNos.join(' / ') : rawFlightNo || 'PA-101';
        const baggage = bags.length > 0 ? bags.join(' | ') : rawBaggage || '20+7 KG';
        const meal = (rawMeal || '').toUpperCase().includes('YES');
        const pnr = rawPnr ? `SAJ-${rawPnr.trim()}` : `SAJ-${Math.floor(10000 + Math.random() * 90000)}`;

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
          pnr,
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

// In-memory mutex to prevent concurrent sync operations from causing locking/timeouts
let isSyncInProgress = false;
let activeSyncPromise: Promise<any> | null = null;

/**
 * High-speed synchronization engine:
 * 1. Concurrency Mutex: queues/shares concurrent sync calls.
 * 2. Scrapes live flights & exact wholesale group prices from groups.sajidtravels.pk.
 * 3. In-memory diff checking against existing DB flights: only writes flights that actually changed.
 * 4. High-performance LibSQL batching / transactions for bulk updates and creations in 1-2 network round trips.
 * 5. Instant bulk deletion of obsolete flights and bulk category insertion.
 */
export async function syncSajidTravelsFlightsToDB() {
  if (isSyncInProgress && activeSyncPromise) {
    return activeSyncPromise;
  }

  isSyncInProgress = true;
  activeSyncPromise = doSyncFlights();

  try {
    const result = await activeSyncPromise;
    return result;
  } finally {
    isSyncInProgress = false;
    activeSyncPromise = null;
  }
}

async function doSyncFlights() {
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

  // Check if Turso LibSQL client is available for direct high-speed batching
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;
  let directLibsqlClient: any = null;
  if (tursoUrl && tursoAuthToken) {
    try {
      const { createClient } = require('@libsql/client');
      directLibsqlClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
    } catch {}
  }

  // Fast bulk fetch of all existing flights
  let existingFlights: Array<{
    id: string;
    flightNumber: string;
    pnr: string | null;
    departureCity: string;
    arrivalCity: string;
    departureTime: Date;
    arrivalTime: Date;
    pricePerSeat: number;
    category: string | null;
    status: string;
    baggage: string | null;
    meal: boolean;
    availableSeats: number;
  }> = [];

  if (directLibsqlClient) {
    const selectRes = await directLibsqlClient.execute(
      'SELECT id, flightNumber, pnr, departureCity, arrivalCity, departureTime, arrivalTime, pricePerSeat, category, status, baggage, meal, availableSeats FROM Flight'
    );
    existingFlights = selectRes.rows.map((r: any) => ({
      id: r.id,
      flightNumber: r.flightNumber,
      pnr: r.pnr,
      departureCity: r.departureCity,
      arrivalCity: r.arrivalCity,
      departureTime: new Date(r.departureTime),
      arrivalTime: new Date(r.arrivalTime),
      pricePerSeat: Number(r.pricePerSeat),
      category: r.category,
      status: r.status,
      baggage: r.baggage,
      meal: Boolean(r.meal),
      availableSeats: Number(r.availableSeats),
    }));
  } else {
    existingFlights = await prisma.flight.findMany({
      select: {
        id: true,
        flightNumber: true,
        pnr: true,
        departureCity: true,
        arrivalCity: true,
        departureTime: true,
        arrivalTime: true,
        pricePerSeat: true,
        category: true,
        status: true,
        baggage: true,
        meal: true,
        availableSeats: true,
      },
    });
  }

  // 100% Unique Match Key Map
  const existingMap = new Map<string, typeof existingFlights[0]>();
  for (const ef of existingFlights) {
    const key = `${ef.flightNumber}__${ef.departureCity}__${ef.departureTime.toISOString()}__${ef.pnr || ''}`;
    existingMap.set(key, ef);
  }

  const activeSyncedIds = new Set<string>();
  const categoriesToEnsure = new Set<string>();
  const toUpdate: { id: string; flight: ScrapedFlight; tierConfig: string }[] = [];
  const toCreate: { flight: ScrapedFlight; tierConfig: string }[] = [];
  let unchangedCount = 0;

  for (const f of scrapedFlights) {
    if (f.category) categoriesToEnsure.add(f.category);

    const matchKey = `${f.flightNumber}__${f.departureCity}__${f.departureTime.toISOString()}__${f.pnr || ''}`;
    const existing = existingMap.get(matchKey);

    const tierConfig = JSON.stringify([
      { upToSeat: Math.round(f.totalSeats * 0.5), price: f.pricePerSeat },
      { upToSeat: f.totalSeats, price: Math.round(f.pricePerSeat * 1.05) },
    ]);

    if (existing) {
      activeSyncedIds.add(existing.id);

      // Fast diff checking to skip unnecessary DB writes
      const priceDiff = Math.abs(existing.pricePerSeat - f.pricePerSeat) > 0;
      const catDiff = existing.category !== f.category;
      const arrDiff = existing.arrivalCity !== f.arrivalCity;
      const depDiff = existing.departureCity !== f.departureCity;
      const statusDiff = existing.status !== 'active';
      const bagDiff = existing.baggage !== f.baggage;
      const mealDiff = existing.meal !== f.meal;

      if (!priceDiff && !catDiff && !arrDiff && !depDiff && !statusDiff && !bagDiff && !mealDiff) {
        unchangedCount++;
        continue;
      }

      toUpdate.push({ id: existing.id, flight: f, tierConfig });
    } else {
      toCreate.push({ flight: f, tierConfig });
    }
  }

  let createdCount = 0;
  let updatedCount = 0;

  // Execute updates and creates with maximum speed
  if (directLibsqlClient && (toUpdate.length > 0 || toCreate.length > 0)) {
    const writeStatements: Array<{ sql: string; args: any[] }> = [];

    for (const item of toUpdate) {
      const f = item.flight;
      writeStatements.push({
        sql: `UPDATE "Flight" SET 
          "departureTime" = ?, "arrivalTime" = ?, "duration" = ?, "totalSeats" = ?, "availableSeats" = ?,
          "pricePerSeat" = ?, "fareTiers" = ?, "baggage" = ?, "meal" = ?, "airline" = ?,
          "departureCity" = ?, "arrivalCity" = ?, "category" = ?, "pnr" = ?, "status" = 'active', "updatedAt" = CURRENT_TIMESTAMP
          WHERE "id" = ?`,
        args: [
          f.departureTime.toISOString(),
          f.arrivalTime.toISOString(),
          f.duration,
          f.totalSeats,
          f.availableSeats,
          f.pricePerSeat,
          item.tierConfig,
          f.baggage,
          f.meal ? 1 : 0,
          f.airline,
          f.departureCity,
          f.arrivalCity,
          f.category,
          f.pnr,
          item.id,
        ],
      });
      updatedCount++;
    }

    for (const item of toCreate) {
      const f = item.flight;
      const id = `cm_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      activeSyncedIds.add(id);
      writeStatements.push({
        sql: `INSERT INTO "Flight" (
          "id", "flightNumber", "pnr", "airline", "departureCity", "arrivalCity",
          "departureTime", "arrivalTime", "duration", "totalSeats", "availableSeats",
          "pricePerSeat", "fareTiers", "currency", "baggage", "meal", "category", "status",
          "createdAt", "updatedAt"
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PKR', ?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        args: [
          id,
          f.flightNumber,
          f.pnr,
          f.airline,
          f.departureCity,
          f.arrivalCity,
          f.departureTime.toISOString(),
          f.arrivalTime.toISOString(),
          f.duration,
          f.totalSeats,
          f.availableSeats,
          f.pricePerSeat,
          item.tierConfig,
          f.baggage,
          f.meal ? 1 : 0,
          f.category,
        ],
      });
      createdCount++;
    }

    const BATCH_SIZE = 50;
    for (let i = 0; i < writeStatements.length; i += BATCH_SIZE) {
      const batch = writeStatements.slice(i, i + BATCH_SIZE);
      await directLibsqlClient.batch(batch, 'write');
    }
  } else if (toUpdate.length > 0 || toCreate.length > 0) {
    // Local development fallback via Prisma transactions
    const CHUNK_SIZE = 30;
    for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
      const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map((item) => {
          const f = item.flight;
          return prisma.flight.update({
            where: { id: item.id },
            data: {
              departureTime: f.departureTime,
              arrivalTime: f.arrivalTime,
              duration: f.duration,
              totalSeats: f.totalSeats,
              availableSeats: f.availableSeats,
              pricePerSeat: f.pricePerSeat,
              fareTiers: item.tierConfig,
              baggage: f.baggage,
              meal: f.meal,
              airline: f.airline,
              departureCity: f.departureCity,
              arrivalCity: f.arrivalCity,
              category: f.category,
              pnr: f.pnr,
              status: 'active',
            },
          });
        })
      );
      updatedCount += chunk.length;
    }

    for (let i = 0; i < toCreate.length; i += CHUNK_SIZE) {
      const chunk = toCreate.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (item) => {
          const f = item.flight;
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
              pricePerSeat: f.pricePerSeat,
              fareTiers: item.tierConfig,
              currency: 'PKR',
              baggage: f.baggage,
              meal: f.meal,
              category: f.category,
              status: 'active',
            },
          });
          activeSyncedIds.add(created.id);
        })
      );
      createdCount += chunk.length;
    }
  }

  // Bulk obsolete flight management
  const obsoleteFlights = existingFlights.filter((f) => !activeSyncedIds.has(f.id));
  let deletedCount = 0;
  let deactivatedCount = 0;

  if (obsoleteFlights.length > 0) {
    const obsoleteIds = obsoleteFlights.map((f) => f.id);
    const booked = await prisma.booking.findMany({
      where: { flightId: { in: obsoleteIds } },
      select: { flightId: true },
    });
    const bookedFlightIds = new Set(booked.map((b) => b.flightId).filter(Boolean));

    const toCancel: string[] = [];
    const toDelete: string[] = [];

    for (const obs of obsoleteFlights) {
      if (bookedFlightIds.has(obs.id)) {
        if (obs.status !== 'cancelled') toCancel.push(obs.id);
      } else {
        toDelete.push(obs.id);
      }
    }

    if (toCancel.length > 0) {
      await prisma.flight.updateMany({
        where: { id: { in: toCancel } },
        data: { status: 'cancelled' },
      });
      deactivatedCount = toCancel.length;
    }

    if (toDelete.length > 0) {
      await prisma.flight.deleteMany({
        where: { id: { in: toDelete } },
      });
      deletedCount = toDelete.length;
    }
  }

  // Fast bulk ensure categories exist in FlightCategory table
  try {
    const existingCats = new Set(
      (await prisma.flightCategory.findMany({ select: { name: true } })).map((c) => c.name)
    );
    const missingCats = [...categoriesToEnsure].filter((c) => !existingCats.has(c));
    for (const catName of missingCats) {
      try {
        await prisma.flightCategory.create({ data: { name: catName } });
      } catch {}
    }

    // Automatically prune any legacy categories from FlightCategory that have 0 active flights
    if (directLibsqlClient) {
      await directLibsqlClient.execute(
        'DELETE FROM FlightCategory WHERE name NOT IN (SELECT DISTINCT category FROM Flight WHERE category IS NOT NULL)'
      );
    } else {
      const activeCats = await prisma.flight.findMany({
        where: { category: { not: null } },
        select: { category: true },
        distinct: ['category'],
      });
      const validNames = activeCats.map((f) => f.category).filter(Boolean) as string[];
      await prisma.flightCategory.deleteMany({
        where: { name: { notIn: validNames } },
      });
    }
  } catch {}

  const syncedCount = createdCount + updatedCount + unchangedCount;
  const durationMs = Date.now() - startTime;
  let message = `Fast sync completed in ${(durationMs / 1000).toFixed(1)}s: ${scrapedFlights.length} live flights synchronized from Sajid Travels (${unchangedCount} verified, ${updatedCount} updated, ${createdCount} added`;
  if (deletedCount > 0) message += `, ${deletedCount} obsolete deleted`;
  if (deactivatedCount > 0) message += `, ${deactivatedCount} cancelled`;
  message += ').';

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
