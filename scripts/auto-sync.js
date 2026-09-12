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
let directLibsqlClient = null;
const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (tursoUrl && tursoAuthToken) {
  const { createClient } = require('@libsql/client');
  const { PrismaLibSQL } = require('@prisma/adapter-libsql');
  directLibsqlClient = createClient({ url: tursoUrl, authToken: tursoAuthToken });
  const adapter = new PrismaLibSQL(directLibsqlClient);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

const SYNC_STATUS_FILE = path.join(process.cwd(), '.flight-sync-status.json');

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
  TIF: 'Taif', ELQ: 'Gassim', YNB: 'Yanbu', HAS: 'Hail', ABT: 'Al Baha',
  AJF: 'Al-Jouf', EAM: 'Najran', BHH: 'Bisha', ULH: 'Al Ula', DXB: 'Dubai',
  SHJ: 'Sharjah', AUH: 'Abu Dhabi', RKT: 'Ras Al Khaimah', AAN: 'Al Ain',
  DWC: 'Dubai World Central', FJR: 'Fujairah', MCT: 'Muscat', SLL: 'Salalah',
  DOH: 'Doha', BAH: 'Bahrain', KWI: 'Kuwait', MAN: 'Manchester',
  LHR: 'London Heathrow', LGW: 'London Gatwick', STN: 'London Stansted',
  BHX: 'Birmingham', IST: 'Istanbul', CAI: 'Cairo', CMB: 'Colombo',
  BKK: 'Bangkok', KUL: 'Kuala Lumpur',
};

function cleanCityName(codeOrName) {
  if (!codeOrName) return 'Karachi';
  const cleanCode = codeOrName.replace(/[^a-zA-Z]/g, '').toUpperCase();
  if (CITY_CODE_MAP[cleanCode]) return CITY_CODE_MAP[cleanCode];
  for (const [code, cityName] of Object.entries(CITY_CODE_MAP)) {
    if (codeOrName.toUpperCase().includes(code)) return cityName;
  }
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
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date() : fallback;
}

function determineFlightCategory(destCode, arrCity, isRoundTrip) {
  const code = (destCode || '').toUpperCase();
  const arr = (arrCity || '').toUpperCase();

  if (isRoundTrip) {
    if (code === 'JED' || code === 'MED' || arr.includes('JEDDAH') || arr.includes('MADINAH')) {
      return 'Umrah Return Flight';
    }
    if (code === 'LHR' || code === 'MAN' || code === 'LGW' || code === 'STN' || code === 'BHX' || arr.includes('LONDON') || arr.includes('MANCHESTER')) {
      return 'UK Return Flight';
    }
    if (code === 'DXB' || code === 'SHJ' || code === 'AUH' || code === 'RKT' || arr.includes('DUBAI') || arr.includes('SHARJAH') || arr.includes('ABU DHABI')) {
      return 'UAE Return Flight';
    }
    if (code === 'RUH' || code === 'DMM' || code === 'AHB' || code === 'ELQ' || code === 'GIZ' || arr.includes('RIYADH') || arr.includes('DAMMAM')) {
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
  if (code === 'LHR' || code === 'MAN' || code === 'LGW' || code === 'STN' || code === 'BHX' || arr.includes('LONDON') || arr.includes('MANCHESTER')) {
    return 'UK Direct Flight';
  }
  if (code === 'DXB' || code === 'SHJ' || code === 'AUH' || code === 'RKT' || arr.includes('DUBAI') || arr.includes('SHARJAH') || arr.includes('ABU DHABI')) {
    return 'UAE Direct Flight';
  }
  if (code === 'RUH' || code === 'DMM' || code === 'AHB' || code === 'ELQ' || code === 'GIZ' || code === 'TUU' || code === 'TIF' || arr.includes('RIYADH') || arr.includes('DAMMAM')) {
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

function saveSyncStatus(status) {
  try {
    fs.writeFileSync(SYNC_STATUS_FILE, JSON.stringify(status, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save sync status file:', err);
  }
}

async function executeSync() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] 🔄 Starting 5-hour flight & wholesale price auto-sync...`);

  try {
    const targetUrl = 'https://groups.sajidtravels.pk/';
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${targetUrl}: HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const scrapedFlights = [];
    const categoriesToEnsure = new Set();

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
          rawAirline, airlineCode, rawFlightNo, rawDateStr, rawSectorStr,
          rawTimeStr, rawFareFormatted, rawPnr, rawMeal, rawBaggage, rawFareNum
        ] = parsed;

        let airline = (rawAirline || '').trim();
        if (!airline && airlineCode && AIRLINE_CODE_MAP[airlineCode]) {
          airline = AIRLINE_CODE_MAP[airlineCode];
        }
        if (!airline) {
          const logoAlt = el.find('img').attr('alt') || '';
          airline = (logoAlt && logoAlt !== 'Logo') ? logoAlt : 'Partner Airline';
        }

        const sectors = (rawSectorStr || '').split('\n').map(s => s.trim()).filter(Boolean);
        const dates = (rawDateStr || '').split('\n').map(d => d.trim()).filter(Boolean);
        const times = (rawTimeStr || '').split('\n').map(t => t.trim()).filter(Boolean);
        const flightNos = (rawFlightNo || '').split('\n').map(f => f.trim()).filter(Boolean);
        const bags = (rawBaggage || '').split('\n').map(b => b.trim()).filter(Boolean);

        const firstSector = sectors[0] || 'ISB-AUH';
        const lastSector = sectors[sectors.length - 1] || firstSector;

        const originCode = firstSector.split('-')[0] || 'ISB';
        const lastDestCode = lastSector.split('-')[1] || lastSector.split('-')[0];

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
          const turnaroundIndex = Math.floor(sectors.length / 2) - 1;
          const turnaroundSector = sectors[turnaroundIndex] || firstSector;
          finalDestCode = turnaroundSector.split('-')[1] || turnaroundSector.split('-')[0];

          if (turnaroundIndex > 0) {
            const transitCode = firstSector.split('-')[1];
            if (transitCode && transitCode !== finalDestCode) {
              transitCity = cleanCityName(transitCode);
            }
          }

          const destName = cleanCityName(finalDestCode);
          arrCity = transitCity ? `${destName} (via ${transitCity} Return)` : `${destName} (Return)`;
        } else {
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

        const arrDate = parseSajidDate(dates[dates.length - 1] || dates[0]);
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

        let price = parseInt(rawFareNum || '0', 10);
        if (!price || isNaN(price)) {
          price = parseInt((rawFareFormatted || '').replace(/[^0-9]/g, ''), 10);
        }
        if (!price || isNaN(price)) {
          const fareCellText = el.find('td[data-label="Fare"]').text().replace(/[^0-9]/g, '');
          price = parseInt(fareCellText, 10) || 75000;
        }

        const category = determineFlightCategory(finalDestCode, arrCity, isRoundTrip);
        categoriesToEnsure.add(category);

        const flightNumber = flightNos.length > 0 ? flightNos.join(' / ') : rawFlightNo || 'PA-101';
        const baggage = bags.length > 0 ? bags.join(' | ') : rawBaggage || '20+7 KG';
        const meal = (rawMeal || '').toUpperCase().includes('YES');
        const pnr = rawPnr ? `SAJ-${rawPnr.trim()}` : `SAJ-${Math.floor(10000 + Math.random() * 90000)}`;

        scrapedFlights.push({
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
      } catch (rowErr) {}
    });

    console.log(`[${new Date().toISOString()}] Parsed ${scrapedFlights.length} live flights.`);

    let existingFlights = [];
    if (directLibsqlClient) {
      const selectRes = await directLibsqlClient.execute(
        'SELECT id, flightNumber, pnr, departureCity, arrivalCity, departureTime, arrivalTime, pricePerSeat, category, status, baggage, meal, availableSeats FROM Flight'
      );
      existingFlights = selectRes.rows.map((r) => ({
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
      existingFlights = await prisma.flight.findMany();
    }

    const existingMap = new Map();
    for (const ef of existingFlights) {
      const key = `${ef.flightNumber}__${ef.departureCity}__${ef.departureTime.toISOString()}__${ef.pnr || ''}`;
      existingMap.set(key, ef);
    }

    const activeSyncedIds = new Set();
    const toUpdate = [];
    const toCreate = [];
    let unchangedCount = 0;

    for (const f of scrapedFlights) {
      const matchKey = `${f.flightNumber}__${f.departureCity}__${f.departureTime.toISOString()}__${f.pnr || ''}`;
      const existing = existingMap.get(matchKey);

      const tierConfig = JSON.stringify([
        { upToSeat: Math.round(f.totalSeats * 0.5), price: f.pricePerSeat },
        { upToSeat: f.totalSeats, price: Math.round(f.pricePerSeat * 1.05) },
      ]);

      if (existing) {
        activeSyncedIds.add(existing.id);

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

    if (directLibsqlClient && (toUpdate.length > 0 || toCreate.length > 0)) {
      const writeStatements = [];

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
            id, f.flightNumber, f.pnr, f.airline, f.departureCity, f.arrivalCity,
            f.departureTime.toISOString(), f.arrivalTime.toISOString(), f.duration,
            f.totalSeats, f.availableSeats, f.pricePerSeat, item.tierConfig,
            f.baggage, f.meal ? 1 : 0, f.category,
          ],
        });
        createdCount++;
      }

      const BATCH_SIZE = 50;
      for (let i = 0; i < writeStatements.length; i += BATCH_SIZE) {
        const batch = writeStatements.slice(i, i + BATCH_SIZE);
        await directLibsqlClient.batch(batch, 'write');
      }
    }

    const obsoleteFlights = existingFlights.filter((f) => !activeSyncedIds.has(f.id));
    if (obsoleteFlights.length > 0) {
      const toDeleteIds = obsoleteFlights.map(f => f.id);
      await prisma.flight.deleteMany({
        where: { id: { in: toDeleteIds } },
      });
      console.log(`[${new Date().toISOString()}] Cleaned up ${toDeleteIds.length} obsolete flights.`);
    }

    const existingCats = new Set((await prisma.flightCategory.findMany({ select: { name: true } })).map(c => c.name));
    for (const catName of categoriesToEnsure) {
      if (!existingCats.has(catName)) {
        try {
          await prisma.flightCategory.create({ data: { name: catName } });
        } catch {}
      }
    }

    const durationMs = Date.now() - startTime;
    const syncedCount = createdCount + updatedCount + unchangedCount;
    const message = `Auto-sync completed in ${(durationMs / 1000).toFixed(1)}s (${scrapedFlights.length} synced: ${unchangedCount} unchanged, ${updatedCount} updated, ${createdCount} created).`;
    console.log(`[${new Date().toISOString()}] ✅ ${message}`);

    saveSyncStatus({
      lastSyncTime: new Date().toISOString(),
      lastSyncDurationMs: durationMs,
      syncedCount,
      createdCount,
      updatedCount,
      deletedCount: obsoleteFlights.length,
      deactivatedCount: 0,
      status: 'success',
      message,
      sourceUrl: 'https://groups.sajidtravels.pk/',
      intervalHours: 5,
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ❌ Auto-sync error:`, err);
    saveSyncStatus({
      lastSyncTime: new Date().toISOString(),
      syncedCount: 0,
      createdCount: 0,
      updatedCount: 0,
      deletedCount: 0,
      deactivatedCount: 0,
      status: 'error',
      message: err.message || 'Auto-sync failed',
      sourceUrl: 'https://groups.sajidtravels.pk/',
      intervalHours: 5,
    });
  }
}

const INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 hours
console.log('🚀 Standalone Sajid Travels Flight Auto-Sync Daemon started.');
console.log(`⏱️  Schedule: Every 5 hours (${INTERVAL_MS / 1000 / 60} minutes).`);

executeSync();
setInterval(executeSync, INTERVAL_MS);
