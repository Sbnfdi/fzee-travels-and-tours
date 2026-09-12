import dns from 'dns';
import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

// Force Node.js to use IPv4 first to prevent ECONNREFUSED on Hostinger
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
}

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

  // UAE
  DXB: 'Dubai',
  SHJ: 'Sharjah',
  AUH: 'Abu Dhabi',
  RKT: 'Ras Al Khaimah',
  AAN: 'Al Ain',
  DWC: 'Dubai World Central',

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
  IST: 'Istanbul',
  CAI: 'Cairo',
  CMB: 'Colombo',
  BKK: 'Bangkok',
  KUL: 'Kuala Lumpur',
};

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

export function cleanCityName(text: string): string {
  if (!text) return '';
  const clean = text.replace(/<[^>]*>/g, ' ').replace(/[^a-zA-Z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = clean.split(' ').filter(w => w.length > 0);
  
  // Remove consecutive duplicates (e.g. MCT MCT -> MCT)
  const uniqueWords: string[] = [];
  for (const w of words) {
    if (uniqueWords.length === 0 || uniqueWords[uniqueWords.length - 1].toUpperCase() !== w.toUpperCase()) {
      uniqueWords.push(w);
    }
  }

  const firstWord = uniqueWords[0]?.toUpperCase() || '';
  if (CITY_CODE_MAP[firstWord]) {
    return CITY_CODE_MAP[firstWord];
  }

  const fullStr = uniqueWords.join(' ').toUpperCase();
  if (CITY_CODE_MAP[fullStr]) {
    return CITY_CODE_MAP[fullStr];
  }

  return uniqueWords.join(' ');
}

export function cleanAirlineName(rawImgAlt: string, sectorId: string): string {
  if (rawImgAlt) {
    let clean = rawImgAlt
      .replace(/\.(png|jpg|jpeg|svg|webp)/gi, '')
      .replace(/assets\/|img\/|airline-logo\//gi, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .trim();
    
    // Remove city codes or sector strings appended
    clean = clean.replace(/(Islamabad|Peshawar|Lahore|Karachi|Multan|Sialkot|Muscat|Jeddah|Riyadh|Doha|Dubai|Sharjah|Abu Dhabi|MCT|DOH|JED|RUH|DXB|SHJ|AUH|ISB|PEW|LHE|KHI).*/gi, '').trim();
    if (clean.length >= 2) return clean.toUpperCase();
  }

  if (sectorId && sectorId.includes('_')) {
    const parts = sectorId.split('_');
    const airlinePart = parts[parts.length - 1];
    if (airlinePart) {
      return airlinePart.replace(/-/g, ' ').trim().toUpperCase();
    }
  }

  return 'PARTNER AIRLINE';
}

function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function splitByBr(html: string): string[] {
  if (!html) return [];
  return html
    .split(/<br\s*\/?>/gi)
    .map(item => stripHtml(item))
    .filter(item => item.length > 0);
}

export function parseCustomDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3,9})(?:\s+(\d{2,4}))?/);
  if (match) {
    const day = parseInt(match[1]);
    const monthStr = match[2].toLowerCase().substring(0, 3);
    const month = MONTH_MAP[monthStr] !== undefined ? MONTH_MAP[monthStr] : 0;
    let year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month, day));
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

export function determineFlightCategory(depCity: string, arrCity: string, sectorTitle?: string): string {
  const arr = (arrCity || '').toUpperCase();
  const dep = (depCity || '').toUpperCase();
  const title = (sectorTitle || '').toUpperCase();

  // Umrah destination (Jeddah, Madinah, Makkah)
  if (
    arr.includes('JED') || arr.includes('MED') || arr.includes('JEDDAH') || arr.includes('MADINAH') || arr.includes('MAKKAH') ||
    title.includes('JEDDAH') || title.includes('MADINAH') || title.includes('UMRAH')
  ) {
    return 'Umrah Direct Flight';
  }

  // UAE destinations (Dubai, Sharjah, Abu Dhabi, Ras Al Khaimah)
  if (
    arr.includes('DXB') || arr.includes('SHJ') || arr.includes('AUH') || arr.includes('RKT') ||
    arr.includes('DUBAI') || arr.includes('SHARJAH') || arr.includes('ABU DHABI') || arr.includes('RAS AL KHAIMAH') ||
    title.includes('DUBAI') || title.includes('SHARJAH') || title.includes('ABU DHABI')
  ) {
    return 'UAE Direct Flight';
  }

  // Saudi Arabia Other (Riyadh, Dammam, Abha, Tabuk, Gassim, Jizan)
  if (
    arr.includes('RUH') || arr.includes('DMM') || arr.includes('AHB') || arr.includes('TUU') || arr.includes('GIZ') ||
    arr.includes('RIYADH') || arr.includes('DAMMAM') || arr.includes('ABHA') || arr.includes('TABUK') ||
    title.includes('RIYADH') || title.includes('DAMMAM')
  ) {
    return 'Saudi Direct Flight';
  }

  // Muscat / Oman
  if (arr.includes('MCT') || arr.includes('SLL') || arr.includes('MUSCAT') || arr.includes('SALALAH') || title.includes('MUSCAT')) {
    return 'Muscat Direct Flight';
  }

  // Qatar (Doha)
  if (arr.includes('DOH') || arr.includes('DOHA') || title.includes('DOHA') || title.includes('QATAR')) {
    return 'Qatar Direct Flight';
  }

  // Bahrain
  if (arr.includes('BAH') || arr.includes('BAHRAIN') || title.includes('BAHRAIN')) {
    return 'Bahrain Direct Flight';
  }

  // UK (Manchester, London Heathrow, Gatwick)
  if (
    arr.includes('MAN') || arr.includes('LHR') || arr.includes('LGW') || arr.includes('MANCHESTER') || arr.includes('LONDON') ||
    arr.includes('HEATHROW') || title.includes('MANCHESTER') || title.includes('HEATHROW') || title.includes('LONDON')
  ) {
    return 'UK Direct Flight';
  }

  // Return legs for Umrah (e.g. Jeddah -> Peshawar/Islamabad/Lahore)
  if (dep.includes('JED') || dep.includes('MED') || dep.includes('JEDDAH') || dep.includes('MADINAH')) {
    return 'Umrah Direct Flight';
  }

  return `${arrCity} Direct Flight`;
}

export function estimatePrice(depCity: string, arrCity: string, airline: string, category?: string): number {
  const arr = (arrCity || '').toUpperCase();
  const al = (airline || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Umrah (Jeddah / Madinah)
  if (cat.includes('umrah') || arr.includes('JED') || arr.includes('MED') || arr.includes('JEDDAH') || arr.includes('MADINAH')) {
    if (al.includes('saudi') || al.includes('etihad') || al.includes('emirates') || al.includes('qatar')) return 135000;
    if (al.includes('airblue') || al.includes('pia') || al.includes('serene')) return 118000;
    if (al.includes('fly') || al.includes('jinnah') || al.includes('nas')) return 108000;
    return 115000;
  }

  // Saudi Other (Riyadh, Dammam, Abha, Tabuk)
  if (cat.includes('saudi') || arr.includes('RUH') || arr.includes('DMM') || arr.includes('AHB') || arr.includes('RIYADH') || arr.includes('DAMMAM')) {
    if (al.includes('saudi') || al.includes('qatar') || al.includes('etihad')) return 115000;
    if (al.includes('airblue') || al.includes('pia')) return 98000;
    if (al.includes('sial') || al.includes('jinnah') || al.includes('nas')) return 92000;
    return 95000;
  }

  // UAE (Dubai / Sharjah / Abu Dhabi)
  if (cat.includes('uae') || arr.includes('DXB') || arr.includes('SHJ') || arr.includes('AUH') || arr.includes('DUBAI') || arr.includes('SHARJAH')) {
    if (al.includes('emirates')) return 95000;
    if (al.includes('flydubai')) return 85000;
    if (al.includes('arabia') || al.includes('sial') || al.includes('jinnah')) return 78000;
    return 82000;
  }

  // Muscat / Oman
  if (cat.includes('muscat') || arr.includes('MCT') || arr.includes('SLL') || arr.includes('MUSCAT')) {
    if (al.includes('oman') || al.includes('salam')) return 88000;
    return 82000;
  }

  // Qatar (Doha)
  if (cat.includes('qatar') || arr.includes('DOH') || arr.includes('DOHA')) {
    if (al.includes('qatar')) return 118000;
    return 95000;
  }

  // Bahrain
  if (cat.includes('bahrain') || arr.includes('BAH') || arr.includes('BAHRAIN')) {
    if (al.includes('gulf')) return 98000;
    return 88000;
  }

  // United Kingdom (Manchester, Heathrow, London)
  if (cat.includes('uk') || arr.includes('MAN') || arr.includes('LHR') || arr.includes('LGW') || arr.includes('MANCHESTER') || arr.includes('LONDON')) {
    if (al.includes('etihad') || al.includes('british') || al.includes('emirates')) return 225000;
    return 195000;
  }

  return 95000;
}

/**
 * Fetch and parse live flights from https://hajaraswadgroups.com/index.php
 */
export async function fetchLiveHajarAswadFlights(): Promise<ScrapedFlight[]> {
  try {
    const targetUrl = 'https://hajaraswadgroups.com/index.php';
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${targetUrl}: HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const flights: ScrapedFlight[] = [];

    let currentAirline = 'PARTNER AIRLINE';
    let currentSectorId = '';
    let currentSectorTitle = '';

    // Loop through table rows
    $('tr').each((_, element) => {
      const el = $(element);

      // Header sector row
      if (el.hasClass('sector_tr')) {
        currentSectorId = el.attr('id') || '';
        const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';
        currentAirline = cleanAirlineName(imgAlt, currentSectorId);
        currentSectorTitle = el.find('h5').text().trim();
        return;
      }

      // Flight detail row
      if (el.hasClass('sector_td')) {
        const dateHtml = el.find('td[data-title="Date"]').html() || '';
        const flightNoHtml = el.find('td[data-title="Flight No"]').html() || '';
        const routeHtml = el.find('td').eq(2).html() || '';
        const timeHtml = el.find('td[data-title="Time"]').html() || '';
        const bagHtml = el.find('td[data-title="Bag"]').html() || '';
        const mealHtml = el.find('td[data-title="Meal"]').html() || '';

        const dates = splitByBr(dateHtml);
        const flightNos = splitByBr(flightNoHtml);
        const routes = splitByBr(routeHtml);
        const times = splitByBr(timeHtml);
        const bags = splitByBr(bagHtml);

        const legCount = Math.max(dates.length, flightNos.length, routes.length, times.length, 1);

        for (let i = 0; i < legCount; i++) {
          const dateStr = dates[i] || dates[0] || '';
          const flightNo = flightNos[i] || flightNos[0] || '';
          const routeStr = routes[i] || routes[0] || '';
          const timeStr = times[i] || times[0] || '';
          const bagStr = bags[i] || bags[0] || '20+7 KG';

          if (!flightNo || flightNo.length < 2) continue;

          let depCityRaw = '';
          let arrCityRaw = '';

          if (routeStr && routeStr.includes('-')) {
            const parts = routeStr.split('-');
            depCityRaw = parts[0] || '';
            arrCityRaw = parts[1] || '';
          } else if (currentSectorTitle && currentSectorTitle.includes('-')) {
            const parts = currentSectorTitle.split('-');
            depCityRaw = parts[0] || '';
            arrCityRaw = parts[1] || '';
          }

          const depCity = cleanCityName(depCityRaw || 'Karachi');
          const arrCity = cleanCityName(arrCityRaw || 'Jeddah');
          const departureDate = parseCustomDate(dateStr);

          let depHour = 8;
          let depMin = 0;
          let arrHour = 11;
          let arrMin = 0;

          if (timeStr && timeStr.includes('-')) {
            const timeParts = timeStr.split('-');
            const depT = timeParts[0].trim().split(':');
            const arrT = timeParts[1].trim().split(':');

            if (depT.length >= 2) {
              depHour = parseInt(depT[0]) || 8;
              depMin = parseInt(depT[1]) || 0;
            }
            if (arrT.length >= 2) {
              arrHour = parseInt(arrT[0]) || 11;
              arrMin = parseInt(arrT[1]) || 0;
            }
          }

          const departureTime = new Date(departureDate);
          departureTime.setUTCHours(depHour, depMin, 0, 0);

          const arrivalTime = new Date(departureDate);
          arrivalTime.setUTCHours(arrHour, arrMin, 0, 0);
          if (arrivalTime <= departureTime) {
            arrivalTime.setDate(arrivalTime.getDate() + 1);
          }

          const durationMinutes = Math.max(120, Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000));
          const meal = stripHtml(mealHtml).toUpperCase().includes('YES');
          const baggage = bagStr.replace(/[^0-9+KG]/gi, ' ').replace(/\s+/g, ' ').trim() || '20+7 KG';

          const category = determineFlightCategory(depCity, arrCity, currentSectorTitle);
          const pricePerSeat = estimatePrice(depCity, arrCity, currentAirline, category);

          flights.push({
            flightNumber: flightNo.trim(),
            airline: currentAirline,
            departureCity: depCity,
            arrivalCity: arrCity,
            departureTime,
            arrivalTime,
            duration: durationMinutes,
            totalSeats: 20,
            availableSeats: 15,
            pricePerSeat,
            baggage,
            meal,
            category,
          });
        }
      }
    });

    return flights;
  } catch (error) {
    console.error('Error scraping Hajar Aswad flights:', error);
    return [];
  }
}

/**
 * Sync live scraped flights directly into Prisma database:
 * 1. Inserts new live flights
 * 2. Updates matching existing flights WITH synced fares and categories
 * 3. Deletes or deactivates flights that no longer exist on the website
 * 4. Ensures categories exist in FlightCategory table
 */
export async function syncHajarAswadFlightsToDB() {
  const scrapedFlights = await fetchLiveHajarAswadFlights();
  if (!scrapedFlights || scrapedFlights.length === 0) {
    return {
      success: false,
      syncedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      deletedCount: 0,
      deactivatedCount: 0,
      message: 'No live flights found or fetch failed from Hajar Aswad website',
    };
  }

  // Purge any corrupted/duplicated city name records with no bookings
  await prisma.flight.deleteMany({
    where: {
      OR: [
        { departureCity: { contains: 'MCT MCT' } },
        { arrivalCity: { contains: 'MCT MCT' } },
        { departureCity: { contains: 'DOH DOH' } },
        { arrivalCity: { contains: 'DOH DOH' } },
        { airline: { contains: 'Islamabad' } },
        { airline: { contains: 'Peshawar' } },
      ],
      bookings: { none: {} },
    },
  });

  const activeSyncedIds = new Set<string>();
  const categoriesToEnsure = new Set<string>();

  let createdCount = 0;
  let updatedCount = 0;

  for (const f of scrapedFlights) {
    if (f.category) {
      categoriesToEnsure.add(f.category);
    }

    const startOfDay = new Date(f.departureTime);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(f.departureTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await prisma.flight.findFirst({
      where: {
        flightNumber: f.flightNumber,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
        departureTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const tierConfig = JSON.stringify([
      { upToSeat: Math.round(f.totalSeats * 0.5), price: f.pricePerSeat },
      { upToSeat: f.totalSeats, price: Math.round(f.pricePerSeat * 1.08) },
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
          pricePerSeat: f.pricePerSeat, // SYNC FARE
          fareTiers: existing.fareTiers || tierConfig,
          baggage: f.baggage,
          meal: f.meal,
          airline: f.airline,
          departureCity: f.departureCity,
          arrivalCity: f.arrivalCity,
          category: f.category,
          status: 'active',
        },
      });
      activeSyncedIds.add(updated.id);
      updatedCount++;
    } else {
      const created = await prisma.flight.create({
        data: {
          flightNumber: f.flightNumber,
          pnr: `HAJ-${Math.floor(100000 + Math.random() * 900000)}`,
          airline: f.airline,
          departureCity: f.departureCity,
          arrivalCity: f.arrivalCity,
          departureTime: f.departureTime,
          arrivalTime: f.arrivalTime,
          duration: f.duration,
          totalSeats: f.totalSeats,
          availableSeats: f.availableSeats,
          pricePerSeat: f.pricePerSeat, // SYNC FARE
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
  }

  // Auto-sync FlightCategory table with all unique categories
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
    } catch {
      // Ignore unique constraint races
    }
  }

  // Find all DB flights that were not present on the website in this sync run
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

  const obsoleteFlights = allCurrentDbFlights.filter(f => !activeSyncedIds.has(f.id));
  let deletedCount = 0;
  let deactivatedCount = 0;

  for (const obs of obsoleteFlights) {
    if (obs._count.bookings > 0) {
      // Flight has real bookings; preserve booking history by marking cancelled/inactive
      if (obs.status !== 'cancelled') {
        await prisma.flight.update({
          where: { id: obs.id },
          data: { status: 'cancelled' },
        });
        deactivatedCount++;
      }
    } else {
      // Flight has no bookings; delete obsolete flight from DB
      await prisma.flight.delete({
        where: { id: obs.id },
      });
      deletedCount++;
    }
  }

  const syncedCount = createdCount + updatedCount;
  let message = `Sync complete: ${scrapedFlights.length} live flights on website (${createdCount} added, ${updatedCount} updated`;
  if (deletedCount > 0) {
    message += `, ${deletedCount} obsolete deleted`;
  }
  if (deactivatedCount > 0) {
    message += `, ${deactivatedCount} deactivated`;
  }
  message += ').';

  return {
    success: true,
    totalScraped: scrapedFlights.length,
    createdCount,
    updatedCount,
    deletedCount,
    deactivatedCount,
    syncedCount,
    message,
  };
}
