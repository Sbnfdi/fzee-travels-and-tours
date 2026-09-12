require('dotenv').config();
const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const { PrismaClient } = require('@prisma/client');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

let prisma;
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (tursoUrl && tursoAuthToken) {
  const { createClient } = require('@libsql/client');
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');
  const libsql = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  const adapter = new PrismaLibSQL(libsql);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

const AIRLINE_CODE_MAP = {
  G9: 'Air Arabia', '3L': 'Air Arabia (Abu Dhabi)', EK: 'Emirates', QR: 'Qatar Airways',
  PK: 'PIA', SV: 'Saudia Airlines', FZ: 'FlyDubai', EY: 'Etihad Airways',
  J9: 'Jazeera Airways', KU: 'Kuwait Airways', GF: 'Gulf Air', WY: 'Oman Air',
  ER: 'Serene Air', '9P': 'FlyJinnah', OV: 'SalamAir', PA: 'AirBlue',
  PF: 'AirSial', XY: 'Flynas', F3: 'Flyadeal', RX: 'Riyadh Air',
};

const CITY_CODE_MAP = {
  KHI: 'Karachi', ISB: 'Islamabad', LHE: 'Lahore', PEW: 'Peshawar',
  MUX: 'Multan', SKT: 'Sialkot', LYP: 'Faisalabad', FSD: 'Faisalabad',
  UET: 'Quetta', SKZ: 'Sukkur', GWD: 'Gwadar', TUK: 'Turbat',
  RYK: 'Rahim Yar Khan', BHW: 'Bahawalpur', JED: 'Jeddah', MED: 'Madinah',
  RUH: 'Riyadh', DMM: 'Dammam', AHB: 'Abha', TUU: 'Tabuk', GIZ: 'Jizan',
  TIF: 'Taif', ELQ: 'Gassim', YNB: 'Yanbu', DXB: 'Dubai', SHJ: 'Sharjah',
  AUH: 'Abu Dhabi', RKT: 'Ras Al Khaimah', MCT: 'Muscat', SLL: 'Salalah',
  DOH: 'Doha', BAH: 'Bahrain', KWI: 'Kuwait', MAN: 'Manchester',
  LHR: 'London Heathrow', LGW: 'London Gatwick',
};

function cleanCityName(codeOrName) {
  if (!codeOrName) return 'Karachi';
  const cleanCode = codeOrName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (CITY_CODE_MAP[cleanCode]) return CITY_CODE_MAP[cleanCode];
  return codeOrName.trim();
}

function parseSajidDate(str) {
  if (!str) return new Date();
  const parts = str.trim().split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(Date.UTC(year, month, day));
    }
  }
  return new Date(str);
}

function determineFlightCategory(depCity, arrCity, targetFinalCode, rawSectorStr, isRoundTrip) {
  const finalCode = (targetFinalCode || '').toUpperCase();
  const s = (rawSectorStr || '').toUpperCase();
  const arr = (arrCity || '').toUpperCase();

  if (isRoundTrip) {
    if (finalCode === 'JED' || finalCode === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH') || s.includes('JED') || s.includes('MED')) {
      return 'Umrah Return Flight';
    }
    return `${arrCity} Return Flight`;
  }

  if (finalCode === 'LHR' || finalCode === 'MAN' || arr.includes('LONDON') || arr.includes('MANCHESTER')) {
    return 'UK Direct Flight';
  }
  if (finalCode === 'JED' || finalCode === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH')) {
    return 'Umrah Direct Flight';
  }
  if (finalCode === 'DXB' || finalCode === 'SHJ' || finalCode === 'AUH' || finalCode === 'RKT' || arr.includes('DUBAI') || arr.includes('SHARJAH')) {
    return 'UAE Direct Flight';
  }
  if (finalCode === 'RUH' || finalCode === 'DMM' || finalCode === 'AHB' || finalCode === 'ELQ' || arr.includes('RIYADH') || arr.includes('DAMMAM')) {
    return 'Saudi Direct Flight';
  }
  if (finalCode === 'MCT' || finalCode === 'SLL' || arr.includes('MUSCAT')) {
    return 'Muscat Direct Flight';
  }
  if (finalCode === 'DOH' || arr.includes('DOHA')) {
    return 'Qatar Direct Flight';
  }
  if (finalCode === 'BAH' || arr.includes('BAHRAIN')) {
    return 'Bahrain Direct Flight';
  }
  if (finalCode === 'KWI' || arr.includes('KUWAIT')) {
    return 'Kuwait Direct Flight';
  }

  return `${arrCity} Direct Flight`;
}

async function scrapeAndSync() {
  const targetUrl = 'https://groups.sajidtravels.pk/';
  console.log(`\n[${new Date().toISOString()}] 🌐 Fetching live schedules & fares from ${targetUrl} ...`);

  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed HTTP ${response.status}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const flights = [];

  $('tr').each((_, element) => {
    const el = $(element);
    const onclick = el.find('a.book-btn, button').attr('onclick') || '';
    if (!onclick.includes('openBookingModal')) return;

    const match = onclick.match(/openBookingModal\s*\(\s*([\s\S]+?)\s*\);/);
    if (!match) return;

    try {
      const rawArgs = match[1].replace(/&quot;/g, '"');
      const parsed = JSON.parse(`[${rawArgs}]`);
      let [rawAirline, airlineCode, rawFlightNo, rawDateStr, rawSectorStr, rawTimeStr, rawFareFormatted, rawPnr, rawMeal, rawBaggage, rawFareNum] = parsed;

      let airline = (rawAirline || '').trim();
      if (!airline && airlineCode && AIRLINE_CODE_MAP[airlineCode]) {
        airline = AIRLINE_CODE_MAP[airlineCode];
      }
      if (!airline) airline = 'Partner Airline';

      const sectors = (rawSectorStr || '').split('\n').map(s => s.trim()).filter(Boolean);
      const dates = (rawDateStr || '').split('\n').map(d => d.trim()).filter(Boolean);
      const times = (rawTimeStr || '').split('\n').map(t => t.trim()).filter(Boolean);
      const flightNos = (rawFlightNo || '').split('\n').map(f => f.trim()).filter(Boolean);
      const bags = (rawBaggage || '').split('\n').map(b => b.trim()).filter(Boolean);

      const firstSector = sectors[0] || 'ISB-AUH';
      const lastSector = sectors[sectors.length - 1] || firstSector;
      const firstParts = firstSector.split('-');
      const lastParts = lastSector.split('-');

      const depCode = firstParts[0] || 'ISB';
      const initialArrCode = firstParts[1] || 'AUH';
      const finalArrCode = lastParts[1] || lastParts[0] || initialArrCode;

      let isRoundTrip = false;
      if (sectors.length >= 2) {
        if (firstParts[0] === lastParts[1] && firstParts[1] === lastParts[0]) {
          isRoundTrip = true;
        } else if (sectors.some(s => s.includes('JED-ISB') || s.includes('JED-LHE') || s.includes('JED-KHI') || s.includes('JED-MUX') || s.includes('JED-PEW'))) {
          isRoundTrip = true;
        }
      }

      const depCity = cleanCityName(depCode);
      let arrCity = cleanCityName(isRoundTrip ? initialArrCode : finalArrCode);

      if (isRoundTrip) {
        arrCity = `${arrCity} (Return)`;
      } else if (sectors.length > 1 && initialArrCode !== finalArrCode) {
        arrCity = `${cleanCityName(finalArrCode)} (via ${initialArrCode})`;
      }

      const depDate = parseSajidDate(dates[0]);
      let depHour = 8, depMin = 0;
      if (times[0] && times[0].includes('-')) {
        const t = times[0].split('-')[0].trim().split(':');
        if (t.length >= 2) {
          depHour = parseInt(t[0], 10) || 8;
          depMin = parseInt(t[1], 10) || 0;
        }
      }
      const departureTime = new Date(depDate);
      departureTime.setUTCHours(depHour, depMin, 0, 0);

      const arrivalDatePart = dates[dates.length - 1] || dates[0];
      const arrDate = parseSajidDate(arrivalDatePart);
      let arrHour = 11, arrMin = 0;
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

      let price = parseInt(rawFareNum || '0', 10);
      if (!price || isNaN(price)) {
        price = parseInt((rawFareFormatted || '').replace(/[^0-9]/g, ''), 10) || 75000;
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
      });
    } catch (e) {}
  });

  console.log(`✈️ Parsed ${flights.length} flights from Sajid Travels portal.`);
  if (flights.length === 0) return;

  const activeSyncedIds = new Set();
  const categoriesToEnsure = new Set();
  let created = 0, updated = 0;

  for (const f of flights) {
    if (f.category) categoriesToEnsure.add(f.category);

    const startOfDay = new Date(f.departureTime);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(f.departureTime);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const existing = await prisma.flight.findFirst({
      where: {
        flightNumber: f.flightNumber,
        departureCity: f.departureCity,
        arrivalCity: f.arrivalCity,
        departureTime: { gte: startOfDay, lte: endOfDay },
      },
    });

    const tierConfig = JSON.stringify([
      { upToSeat: Math.round(f.totalSeats * 0.5), price: f.pricePerSeat },
      { upToSeat: f.totalSeats, price: Math.round(f.pricePerSeat * 1.05) },
    ]);

    if (existing) {
      const up = await prisma.flight.update({
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
          status: 'active',
        },
      });
      activeSyncedIds.add(up.id);
      updated++;
    } else {
      const cr = await prisma.flight.create({
        data: {
          flightNumber: f.flightNumber,
          pnr: f.pnr,
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
      activeSyncedIds.add(cr.id);
      created++;
    }
  }

  for (const cat of categoriesToEnsure) {
    try {
      const ex = await prisma.flightCategory.findUnique({ where: { name: cat } });
      if (!ex) await prisma.flightCategory.create({ data: { name: cat } });
    } catch {}
  }

  const allDbFlights = await prisma.flight.findMany({
    select: { id: true, status: true, _count: { select: { bookings: true } } },
  });

  let deleted = 0, deactivated = 0;
  for (const dbf of allDbFlights) {
    if (!activeSyncedIds.has(dbf.id)) {
      if (dbf._count.bookings > 0) {
        if (dbf.status !== 'cancelled') {
          await prisma.flight.update({ where: { id: dbf.id }, data: { status: 'cancelled' } });
          deactivated++;
        }
      } else {
        await prisma.flight.delete({ where: { id: dbf.id } });
        deleted++;
      }
    }
  }

  console.log(`✅ Sync complete: ${created} created, ${updated} updated with live prices, ${deleted} obsolete deleted, ${deactivated} cancelled.`);
}

const FIVE_HOURS_MS = 5 * 60 * 60 * 1000;

async function runDaemon() {
  console.log('🚀 Starting Sajid Travels Auto-Sync Daemon (5-Hour Cycle) ...');
  try {
    await scrapeAndSync();
  } catch (err) {
    console.error('Initial sync error:', err);
  }

  console.log(`⏳ Next sync will trigger automatically in 5 hours (${(FIVE_HOURS_MS / (1000 * 60 * 60))}h).`);
  setInterval(async () => {
    try {
      await scrapeAndSync();
    } catch (err) {
      console.error('Recurring sync error:', err);
    }
  }, FIVE_HOURS_MS);
}

runDaemon();
