import * as cheerio from 'cheerio';
import { prisma } from '@/lib/prisma';

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
  KHI: 'Karachi',
  ISB: 'Islamabad',
  LHE: 'Lahore',
  PEW: 'Peshawar',
  MUX: 'Multan',
  SKT: 'Sialkot',
  JED: 'Jeddah',
  MED: 'Madinah',
  RUH: 'Riyadh',
  DMM: 'Dammam',
  DXB: 'Dubai',
  SHJ: 'Sharjah',
  AUH: 'Abu Dhabi',
  RKT: 'Ras Al Khaimah',
  MCT: 'Muscat',
  DOH: 'Doha',
  MAN: 'Manchester',
  AHB: 'Abha',
};

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
};

function formatCity(codeOrName: string): string {
  if (!codeOrName) return '';
  const clean = codeOrName.replace(/<[^>]*>/g, '').trim().toUpperCase();
  return CITY_CODE_MAP[clean] || clean;
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

function parseCustomDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const match = dateStr.match(/(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})/);
  if (match) {
    const day = parseInt(match[1]);
    const monthStr = match[2].toLowerCase().substring(0, 3);
    const month = MONTH_MAP[monthStr] !== undefined ? MONTH_MAP[monthStr] : 7;
    const year = parseInt(match[3]);
    return new Date(Date.UTC(year, month, day));
  }
  const fallback = new Date(dateStr);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function estimatePrice(depCity: string, arrCity: string, airline: string): number {
  const arr = arrCity.toUpperCase();
  if (arr.includes('JED') || arr.includes('MED') || arr.includes('RUH') || arr.includes('JEDDAH') || arr.includes('RIYADH')) {
    if (airline.toLowerCase().includes('saudi') || airline.toLowerCase().includes('etihad')) return 125000;
    return 105000;
  }
  if (arr.includes('DXB') || arr.includes('SHJ') || arr.includes('AUH') || arr.includes('DUBAI') || arr.includes('SHARJAH')) {
    if (airline.toLowerCase().includes('fly') || airline.toLowerCase().includes('arabia')) return 78000;
    return 88000;
  }
  if (arr.includes('MCT') || arr.includes('DOH') || arr.includes('MUSCAT') || arr.includes('DOHA')) {
    return 92000;
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

    let currentAirline = 'Partner Airline';
    let currentSectorTitle = '';

    // Loop through table rows
    $('tr').each((_, element) => {
      const el = $(element);

      // Header sector row
      if (el.hasClass('sector_tr')) {
        const sectorText = stripHtml(el.find('h5').html() || '');
        const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';
        
        if (sectorText) currentSectorTitle = sectorText;
        if (imgAlt) {
          const cleanAlt = imgAlt
            .replace(/\.(png|jpg|jpeg|svg|webp)/gi, '')
            .replace(/^assets\//i, '')
            .replace(/^img\//i, '')
            .replace(/^airline-logo\//i, '')
            .replace(/-/g, ' ')
            .replace(/_/g, ' ')
            .trim()
            .toUpperCase();
          if (cleanAlt) currentAirline = cleanAlt;
        }
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
            depCityRaw = parts[0]?.trim() || '';
            arrCityRaw = parts[1]?.trim() || '';
          } else if (currentSectorTitle.includes('-')) {
            const parts = currentSectorTitle.split('-');
            depCityRaw = parts[0]?.trim() || '';
            arrCityRaw = parts[1]?.trim() || '';
          }

          const depCity = formatCity(depCityRaw || 'Karachi');
          const arrCity = formatCity(arrCityRaw || 'Jeddah');

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

          const category = `${arrCity} Direct Flight`;
          const pricePerSeat = estimatePrice(depCity, arrCity, currentAirline);

          flights.push({
            flightNumber: flightNo,
            airline: currentAirline,
            departureCity: depCity,
            arrivalCity: arrCity,
            departureTime,
            arrivalTime,
            duration: durationMinutes,
            totalSeats: 15,
            availableSeats: 12,
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
 * Sync live scraped flights directly into Prisma database
 */
export async function syncHajarAswadFlightsToDB() {
  const scrapedFlights = await fetchLiveHajarAswadFlights();
  if (!scrapedFlights || scrapedFlights.length === 0) {
    return { success: false, syncedCount: 0, message: 'No live flights found or fetch failed' };
  }

  let createdCount = 0;
  let updatedCount = 0;

  for (const f of scrapedFlights) {
    // Unique matching key: flightNumber + departureCity + arrivalCity
    // Check if a flight on the same day exists
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

    if (existing) {
      // PRESERVE existing pricePerSeat and fareTiers set by admin!
      await prisma.flight.update({
        where: { id: existing.id },
        data: {
          departureTime: f.departureTime,
          arrivalTime: f.arrivalTime,
          baggage: f.baggage,
          meal: f.meal,
          airline: f.airline,
          status: 'active',
          // Note: pricePerSeat and fareTiers are intentionally NOT updated here to preserve admin overrides!
        },
      });
      updatedCount++;
    } else {
      await prisma.flight.create({
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
          pricePerSeat: f.pricePerSeat,
          currency: 'PKR',
          baggage: f.baggage,
          meal: f.meal,
          category: f.category,
          status: 'active',
        },
      });
      createdCount++;
    }
  }

  return {
    success: true,
    totalScraped: scrapedFlights.length,
    createdCount,
    updatedCount,
    syncedCount: createdCount + updatedCount,
    message: `Successfully synced ${scrapedFlights.length} live flights (${createdCount} new, ${updatedCount} updated).`,
  };
}
