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

function formatCity(codeOrName: string): string {
  const clean = codeOrName.trim().toUpperCase();
  return CITY_CODE_MAP[clean] || codeOrName.trim();
}

function estimatePrice(depCity: string, arrCity: string, airline: string): number {
  const dep = depCity.toUpperCase();
  const arr = arrCity.toUpperCase();

  // Saudi routes (Umrah)
  if (arr.includes('JED') || arr.includes('JEDDAH') || arr.includes('MED') || arr.includes('MADINAH') || arr.includes('RUH') || arr.includes('RIYADH')) {
    if (airline.toLowerCase().includes('saudi') || airline.toLowerCase().includes('etihad')) return 125000;
    return 105000;
  }

  // UAE routes
  if (arr.includes('DXB') || arr.includes('DUBAI') || arr.includes('SHJ') || arr.includes('SHARJAH') || arr.includes('AUH') || arr.includes('ABU')) {
    if (airline.toLowerCase().includes('fly') || airline.toLowerCase().includes('arabia')) return 78000;
    return 88000;
  }

  // Oman / Qatar
  if (arr.includes('MCT') || arr.includes('MUSCAT') || arr.includes('DOH') || arr.includes('DOHA')) {
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
        const sectorText = el.find('h5').text().trim();
        const imgAlt = el.find('img').attr('alt') || el.find('img').attr('src') || '';
        
        if (sectorText) currentSectorTitle = sectorText;
        if (imgAlt) {
          const cleanAlt = imgAlt.replace('.png', '').replace('airline-logo/', '').replace(/-/g, ' ').toUpperCase();
          if (cleanAlt) currentAirline = cleanAlt;
        }
        return;
      }

      // Flight detail row
      if (el.hasClass('sector_td')) {
        const dateStr = el.find('td[data-title="Date"]').text().replace(/\s+/g, ' ').trim();
        const flightNo = el.find('td[data-title="Flight No"]').text().replace(/\s+/g, ' ').trim();
        const routeText = el.find('td').eq(2).text().replace(/\s+/g, ' ').trim();
        const timeStr = el.find('td[data-title="Time"]').text().replace(/\s+/g, ' ').trim();
        const baggageStr = el.find('td[data-title="Bag"]').text().replace(/\s+/g, ' ').trim();
        const mealText = el.find('td[data-title="Meal"]').text().replace(/\s+/g, ' ').trim();

        if (!flightNo || flightNo.length < 2) return;

        // Parse route (e.g. PEW - SHJ or Karachi to Jeddah)
        let depCityRaw = '';
        let arrCityRaw = '';

        if (routeText && routeText.includes('-')) {
          const parts = routeText.split('-');
          depCityRaw = parts[0]?.trim() || '';
          arrCityRaw = parts[1]?.trim() || '';
        } else if (currentSectorTitle.includes('-')) {
          const parts = currentSectorTitle.split('-');
          depCityRaw = parts[0]?.trim() || '';
          arrCityRaw = parts[1]?.trim() || '';
        }

        const depCity = formatCity(depCityRaw || 'Karachi');
        const arrCity = formatCity(arrCityRaw || 'Jeddah');

        // Parse Date (e.g. 12 Aug 2026)
        let departureDate = new Date();
        if (dateStr) {
          const parsed = new Date(dateStr);
          if (!isNaN(parsed.getTime())) {
            departureDate = parsed;
          }
        }

        // Parse Time (e.g. 07:30 - 10:00)
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
        departureTime.setHours(depHour, depMin, 0, 0);

        const arrivalTime = new Date(departureDate);
        arrivalTime.setHours(arrHour, arrMin, 0, 0);
        if (arrivalTime <= departureTime) {
          arrivalTime.setDate(arrivalTime.getDate() + 1);
        }

        const durationMinutes = Math.max(120, Math.round((arrivalTime.getTime() - departureTime.getTime()) / 60000));
        const meal = mealText.toUpperCase().includes('YES') || mealText.toUpperCase().includes('INCLUDED');
        const baggage = baggageStr.replace(/[^0-9+KG]/gi, ' ').trim() || '20+07 KG';

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
    // Check if flight already exists by flightNumber and departureCity/arrivalCity/departureTime
    const existing = await prisma.flight.findFirst({
      where: {
        flightNumber: f.flightNumber,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
      },
    });

    if (existing) {
      await prisma.flight.update({
        where: { id: existing.id },
        data: {
          departureTime: f.departureTime,
          arrivalTime: f.arrivalTime,
          baggage: f.baggage,
          meal: f.meal,
          airline: f.airline,
          status: 'active',
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
    message: `Successfully synced ${createdCount + updatedCount} live flights (${createdCount} new, ${updatedCount} updated).`,
  };
}
